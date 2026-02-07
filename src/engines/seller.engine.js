/* ======================================================
   SELLER ENGINE – VA-SELLER (FINAL)
   - FC weighted by MP demand
   - Fallback to FC stock
   - Final fallback to system FC priority
   - No DEFAULT_FC ever
====================================================== */

const TARGET_DAYS = 45;

/* 🔒 SYSTEM FC PRIORITY (LAST RESORT ONLY) */
const FALLBACK_FC_PRIORITY = ["JPX1", "JPX2", "BLR1", "DEL1"];

function round2(num) {
  return Math.round(num * 100) / 100;
}

function groupBy(arr, keyFn) {
  return arr.reduce((acc, item) => {
    const key = keyFn(item);
    acc[key] = acc[key] || [];
    acc[key].push(item);
    return acc;
  }, {});
}

export function runSellerEngine({
  sales,
  fcStock,
  uniwareStock,
  companyRemarks,
  uniware40CapRemaining,
}) {
  /* ---------------- CLOSED STYLES ---------------- */
  const closedStyles = new Set(
    companyRemarks
      .filter(r => String(r.remark).toLowerCase() === "closed")
      .map(r => r.styleId)
  );

  /* ---------------- SELLER SALES ---------------- */
  const sellerSales = sales.filter(r => r.warehouseId === "SELLER");
  const sellerBySku = groupBy(sellerSales, r => r.sku);

  /* ---------------- MP SALES ---------------- */
  const mpSales = sales.filter(r => r.warehouseId !== "SELLER");

  /* ---------------- FC STOCK MAP ---------------- */
  const fcStockBySku = {};
  fcStock.forEach(r => {
    if (!fcStockBySku[r.sku]) fcStockBySku[r.sku] = [];
    fcStockBySku[r.sku].push({
      fc: r.warehouseId,
      qty: r.quantity,
    });
  });

  /* ---------------- UNIWARE MAP ---------------- */
  const uniwareMap = Object.fromEntries(
    uniwareStock.map(u => [u.uniwareSku, u.quantity])
  );

  const results = [];
  let uniwareUsed = 0;

  /* ======================================================
     PROCESS EACH SKU
  ====================================================== */
  Object.entries(sellerBySku).forEach(([sku, skuRows]) => {
    const saleQty = skuRows.reduce((s, r) => s + r.quantity, 0);
    const styleId = skuRows[0].styleId;
    const uniwareSku = skuRows[0].uniwareSku;

    const drr = round2(saleQty / 30);

    /* ---------- CLOSED STYLE ---------- */
    if (closedStyles.has(styleId)) {
      results.push({
        mp: "SELLER",
        sku,
        styleId,
        replenishmentFc: "",
        replenishmentMp: "",
        saleQty,
        drr,
        actualShipmentQty: 0,
        shipmentQty: 0,
        action: "NONE",
        remark: "Closed",
      });
      return;
    }

    const actualShipmentQty =
      drr > 0 ? Math.ceil(TARGET_DAYS * drr) : 0;

    const totalUniware = uniwareMap[uniwareSku] || 0;
    const allocatableUniware = Math.max(
      0,
      Math.min(
        Math.floor(totalUniware * 0.4),
        uniware40CapRemaining - uniwareUsed
      )
    );

    const sellerShipmentQty = Math.min(
      actualShipmentQty,
      allocatableUniware
    );

    if (sellerShipmentQty <= 0) {
      results.push({
        mp: "SELLER",
        sku,
        styleId,
        replenishmentFc: "",
        replenishmentMp: "",
        saleQty,
        drr,
        actualShipmentQty,
        shipmentQty: 0,
        action: "NONE",
        remark:
          actualShipmentQty > 0
            ? "Reduced due to MP priority"
            : "",
      });
      return;
    }

    /* ======================================================
       1️⃣ MP FC WEIGHTED SPLIT
    ====================================================== */
    const skuMpSales = mpSales.filter(r => r.sku === sku);
    const fcSaleMap = {};

    skuMpSales.forEach(r => {
      fcSaleMap[r.warehouseId] =
        (fcSaleMap[r.warehouseId] || 0) + r.quantity;
    });

    const totalMpSale = Object.values(fcSaleMap).reduce(
      (s, v) => s + v,
      0
    );

    let allocations = [];

    if (totalMpSale > 0) {
      Object.entries(fcSaleMap).forEach(([fc, fcSale]) => {
        allocations.push({
          fc,
          qty: Math.round(
            sellerShipmentQty * (fcSale / totalMpSale)
          ),
          mp: Object.entries(
            skuMpSales
              .filter(r => r.warehouseId === fc)
              .reduce((a, r) => {
                a[r.mp] = (a[r.mp] || 0) + r.quantity;
                return a;
              }, {})
          ).sort((a, b) => b[1] - a[1])[0][0],
        });
      });

      const allocated = allocations.reduce(
        (s, r) => s + r.qty,
        0
      );
      const diff = sellerShipmentQty - allocated;

      if (diff !== 0) {
        allocations.sort((a, b) => b.qty - a.qty)[0].qty += diff;
      }
    }

    /* ======================================================
       2️⃣ FALLBACK TO FC STOCK
    ====================================================== */
    if (allocations.length === 0) {
      const stockFcs = (fcStockBySku[sku] || []).sort(
        (a, b) => b.qty - a.qty
      );

      if (stockFcs.length > 0) {
        allocations.push({
          fc: stockFcs[0].fc,
          qty: sellerShipmentQty,
          mp: "MIXED",
        });
      }
    }

    /* ======================================================
       3️⃣ SYSTEM FALLBACK
    ====================================================== */
    if (allocations.length === 0) {
      allocations.push({
        fc: FALLBACK_FC_PRIORITY[0],
        qty: sellerShipmentQty,
        mp: "SYSTEM",
      });
    }

    /* ======================================================
       PUSH ROWS
    ====================================================== */
    allocations.forEach(a => {
      if (a.qty <= 0) return;

      results.push({
        mp: "SELLER",
        sku,
        styleId,
        replenishmentFc: a.fc,
        replenishmentMp: a.mp,
        saleQty,
        drr,
        actualShipmentQty,
        shipmentQty: a.qty,
        action: "SHIP",
        remark:
          sellerShipmentQty < actualShipmentQty
            ? "Reduced due to MP priority"
            : "",
      });
    });

    uniwareUsed += sellerShipmentQty;
  });

  return {
    rows: results,
    uniwareUsed,
  };
}
