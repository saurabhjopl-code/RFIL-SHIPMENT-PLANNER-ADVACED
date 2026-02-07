/* ======================================================
   SELLER ENGINE – VA-SELLER (FINAL PERFORMANCE SAFE)
   - SINGLE FC routing per SKU
   - No FC splitting in fallback
   - Fast & deterministic
====================================================== */

const TARGET_DAYS = 45;
const FALLBACK_FC_PRIORITY = ["JPX1", "JPX2", "BLR1", "DEL1"];

function round2(num) {
  return Math.round(num * 100) / 100;
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

  /* ---------------- UNIWARE MAP ---------------- */
  const uniwareMap = {};
  uniwareStock.forEach(u => {
    uniwareMap[u.uniwareSku] = u.quantity;
  });

  /* ---------------- SELLER SALES BY SKU ---------------- */
  const sellerBySku = {};
  sales.forEach(r => {
    if (r.warehouseId !== "SELLER") return;
    if (!sellerBySku[r.sku]) sellerBySku[r.sku] = [];
    sellerBySku[r.sku].push(r);
  });

  /* ---------------- MP SALES MAP: SKU → FC → MP → QTY ---------------- */
  const mpSalesMap = {};
  sales.forEach(r => {
    if (r.warehouseId === "SELLER") return;

    if (!mpSalesMap[r.sku]) mpSalesMap[r.sku] = {};
    if (!mpSalesMap[r.sku][r.warehouseId])
      mpSalesMap[r.sku][r.warehouseId] = {};
    if (!mpSalesMap[r.sku][r.warehouseId][r.mp])
      mpSalesMap[r.sku][r.warehouseId][r.mp] = 0;

    mpSalesMap[r.sku][r.warehouseId][r.mp] += r.quantity;
  });

  /* ---------------- FC STOCK MAP: SKU → [{fc, qty}] ---------------- */
  const fcStockBySku = {};
  fcStock.forEach(r => {
    if (!fcStockBySku[r.sku]) fcStockBySku[r.sku] = [];
    fcStockBySku[r.sku].push({
      fc: r.warehouseId,
      qty: r.quantity,
    });
  });

  /* ======================================================
     MAIN PROCESS
  ====================================================== */

  const results = [];
  let uniwareUsed = 0;

  Object.entries(sellerBySku).forEach(([sku, rows]) => {
    const saleQty = rows.reduce((s, r) => s + r.quantity, 0);
    const styleId = rows[0].styleId;
    const uniwareSku = rows[0].uniwareSku;

    const drr = round2(saleQty / 30);

    /* ----- CLOSED STYLE ----- */
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

    /* ==================================================
       FC SELECTION (SINGLE FC)
    ================================================== */

    let selectedFc = "";
    let replenishmentMp = "";

    const skuMpData = mpSalesMap[sku] || {};

    /* 1️⃣ Highest MP demand FC */
    let maxSale = 0;
    Object.entries(skuMpData).forEach(([fc, mpMap]) => {
      const fcSale = Object.values(mpMap).reduce((s, v) => s + v, 0);
      if (fcSale > maxSale) {
        maxSale = fcSale;
        selectedFc = fc;
        replenishmentMp = Object.entries(mpMap)
          .sort((a, b) => b[1] - a[1])[0][0];
      }
    });

    /* 2️⃣ Fallback to highest FC stock */
    if (!selectedFc) {
      const stockFcs = (fcStockBySku[sku] || []).sort(
        (a, b) => b.qty - a.qty
      );
      if (stockFcs.length > 0) {
        selectedFc = stockFcs[0].fc;
        replenishmentMp = "MIXED";
      }
    }

    /* 3️⃣ System fallback */
    if (!selectedFc) {
      selectedFc = FALLBACK_FC_PRIORITY[0];
      replenishmentMp = "SYSTEM";
    }

    /* ==================================================
       PUSH FINAL ROW
    ================================================== */
    results.push({
      mp: "SELLER",
      sku,
      styleId,
      replenishmentFc: selectedFc,
      replenishmentMp,
      saleQty,
      drr,
      actualShipmentQty,
      shipmentQty: sellerShipmentQty,
      action: "SHIP",
      remark:
        sellerShipmentQty < actualShipmentQty
          ? "Reduced due to MP priority"
          : "",
    });

    uniwareUsed += sellerShipmentQty;
  });

  return {
    rows: results,
    uniwareUsed,
  };
}
