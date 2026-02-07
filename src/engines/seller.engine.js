/* ======================================================
   SELLER ENGINE – VA-SELLER (FC-WEIGHTED SPLIT)
   - Seller sales identified by Warehouse Id === "SELLER"
   - DRR rounded to 2 decimals
   - Uses remaining Uniware 40% only
   - Splits shipment across FCs using MP demand weights
   - No recall logic
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
  /* --------------------------------------------------
     CLOSED STYLES
  -------------------------------------------------- */
  const closedStyles = new Set(
    companyRemarks
      .filter(r => String(r.remark).toLowerCase() === "closed")
      .map(r => r.styleId)
  );

  /* --------------------------------------------------
     SELLER SALES (WAREHOUSE PRIORITY)
  -------------------------------------------------- */
  const sellerSales = sales.filter(
    r => r.warehouseId === "SELLER"
  );

  const sellerBySku = groupBy(sellerSales, r => r.sku);

  /* --------------------------------------------------
     MP SALES (FOR FC WEIGHTS)
     - Exclude SELLER warehouse
  -------------------------------------------------- */
  const mpSales = sales.filter(
    r => r.warehouseId !== "SELLER"
  );

  /* --------------------------------------------------
     UNIWARE MAP
  -------------------------------------------------- */
  const uniwareMap = Object.fromEntries(
    uniwareStock.map(u => [u.uniwareSku, u.quantity])
  );

  const results = [];
  let uniwareUsed = 0;

  /* ==================================================
     PROCESS EACH SKU
  ================================================== */
  Object.entries(sellerBySku).forEach(([sku, skuRows]) => {
    const saleQty = skuRows.reduce((s, r) => s + r.quantity, 0);
    const styleId = skuRows[0].styleId;
    const uniwareSku = skuRows[0].uniwareSku;

    /* ----- DRR (ROUNDED) ----- */
    const drr = round2(saleQty / 30);

    /* ----- CLOSED STYLE OVERRIDE ----- */
    if (closedStyles.has(styleId)) {
      results.push({
        mp: "SELLER",
        sku,
        styleId,
        warehouseId: "SELLER",
        replenishmentFc: "",
        saleQty,
        drr,
        actualShipmentQty: 0,
        shipmentQty: 0,
        action: "NONE",
        remark: "Closed",
      });
      return;
    }

    /* ----- TARGET SHIPMENT ----- */
    const actualShipmentQty =
      drr > 0 ? Math.ceil(TARGET_DAYS * drr) : 0;

    /* ----- UNIWARE AVAILABILITY ----- */
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
        warehouseId: "SELLER",
        replenishmentFc: "",
        saleQty,
        drr,
        actualShipmentQty,
        shipmentQty: 0,
        action: "NONE",
        remark: actualShipmentQty > 0 ? "Reduced due to MP priority" : "",
      });
      return;
    }

    /* --------------------------------------------------
       BUILD FC DEMAND WEIGHTS (FROM MP SALES)
    -------------------------------------------------- */
    const skuMpSales = mpSales.filter(r => r.sku === sku);

    const fcSaleMap = {};
    skuMpSales.forEach(r => {
      fcSaleMap[r.warehouseId] =
        (fcSaleMap[r.warehouseId] || 0) + r.quantity;
    });

    const totalMpSale = Object.values(fcSaleMap)
      .reduce((s, v) => s + v, 0);

    let fcAllocations = [];

    /* ----- NO MP SALE EDGE CASE ----- */
    if (totalMpSale === 0) {
      fcAllocations.push({
        fc: "DEFAULT_FC",
        qty: sellerShipmentQty,
      });
    } else {
      /* ----- INITIAL SPLIT ----- */
      Object.entries(fcSaleMap).forEach(([fc, fcSale]) => {
        const weight = fcSale / totalMpSale;
        const qty = Math.round(sellerShipmentQty * weight);

        fcAllocations.push({ fc, qty });
      });

      /* ----- ROUNDING FIX ----- */
      const allocated = fcAllocations.reduce(
        (s, r) => s + r.qty,
        0
      );

      const diff = sellerShipmentQty - allocated;

      if (diff !== 0) {
        // Adjust FC with highest sale
        const topFc = Object.entries(fcSaleMap)
          .sort((a, b) => b[1] - a[1])[0][0];

        const target = fcAllocations.find(
          r => r.fc === topFc
        );
        if (target) {
          target.qty += diff;
        }
      }
    }

    /* --------------------------------------------------
       PUSH FC-LEVEL ROWS
    -------------------------------------------------- */
    fcAllocations.forEach(({ fc, qty }) => {
      if (qty <= 0) return;

      results.push({
        mp: "SELLER",
        sku,
        styleId,
        warehouseId: "SELLER",
        replenishmentFc: fc,
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
