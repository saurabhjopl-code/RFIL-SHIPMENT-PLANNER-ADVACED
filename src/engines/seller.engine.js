/* ======================================================
   SELLER ENGINE – VA-SELLER (FC + MP WEIGHTED SPLIT)
====================================================== */

const TARGET_DAYS = 45;

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
  const sellerSales = sales.filter(
    r => r.warehouseId === "SELLER"
  );
  const sellerBySku = groupBy(sellerSales, r => r.sku);

  /* ---------------- MP SALES (FOR FC + MP MAP) ---------------- */
  const mpSales = sales.filter(
    r => r.warehouseId !== "SELLER"
  );

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

    /* ---------------- FC DEMAND MAP ---------------- */
    const skuMpSales = mpSales.filter(r => r.sku === sku);

    const fcSaleMap = {};
    skuMpSales.forEach(r => {
      fcSaleMap[r.warehouseId] =
        (fcSaleMap[r.warehouseId] || 0) + r.quantity;
    });

    const totalMpSale = Object.values(fcSaleMap)
      .reduce((s, v) => s + v, 0);

    let fcAllocations = [];

    if (totalMpSale === 0) {
      fcAllocations.push({
        fc: "DEFAULT_FC",
        qty: sellerShipmentQty,
      });
    } else {
      Object.entries(fcSaleMap).forEach(([fc, fcSale]) => {
        const qty = Math.round(
          sellerShipmentQty * (fcSale / totalMpSale)
        );
        fcAllocations.push({ fc, qty });
      });

      const allocated = fcAllocations.reduce(
        (s, r) => s + r.qty,
        0
      );
      const diff = sellerShipmentQty - allocated;

      if (diff !== 0) {
        const topFc = Object.entries(fcSaleMap)
          .sort((a, b) => b[1] - a[1])[0][0];

        const target = fcAllocations.find(r => r.fc === topFc);
        if (target) target.qty += diff;
      }
    }

    /* ---------------- PUSH FC + MP ROWS ---------------- */
    fcAllocations.forEach(({ fc, qty }) => {
      if (qty <= 0) return;

      const mpForFc = skuMpSales
        .filter(r => r.warehouseId === fc)
        .reduce((acc, r) => {
          acc[r.mp] = (acc[r.mp] || 0) + r.quantity;
          return acc;
        }, {});

      const replenishmentMp =
        Object.entries(mpForFc).length
          ? Object.entries(mpForFc).sort((a, b) => b[1] - a[1])[0][0]
          : "N/A";

      results.push({
        mp: "SELLER",
        sku,
        styleId,
        replenishmentFc: fc,
        replenishmentMp,
        saleQty,
        drr,
        actualShipmentQty,
        shipmentQty: qty,
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
