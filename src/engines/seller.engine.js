/* ======================================================
   SELLER ENGINE – VA-SELLER
   - Warehouse Id = SELLER defines seller sale
   - DRR rounded to 2 decimals
   - Uses remaining Uniware 40% only
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
  /* ----- CLOSED STYLES ----- */
  const closedStyles = new Set(
    companyRemarks
      .filter(r => String(r.remark).toLowerCase() === "closed")
      .map(r => r.styleId)
  );

  /* ----- SELLER SALES (WAREHOUSE ID PRIORITY) ----- */
  const sellerSales = sales.filter(
    r => r.warehouseId === "SELLER"
  );

  /* ----- GROUP BY SKU ----- */
  const salesBySku = groupBy(sellerSales, r => r.sku);

  /* ----- UNIWARE MAP ----- */
  const uniwareMap = Object.fromEntries(
    uniwareStock.map(u => [u.uniwareSku, u.quantity])
  );

  const results = [];
  let uniwareUsed = 0;

  /* ======================================================
     PROCESS EACH SKU
  ===================================================== */
  Object.entries(salesBySku).forEach(([sku, skuRows]) => {
    const saleQty = skuRows.reduce((s, r) => s + r.quantity, 0);
    const styleId = skuRows[0].styleId;
    const uniwareSku = skuRows[0].uniwareSku;

    /* ----- DRR (ROUNDED) ----- */
    const rawDRR = saleQty / 30;
    const drr = round2(rawDRR);

    /* ----- CLOSED STYLE OVERRIDE ----- */
    if (closedStyles.has(styleId)) {
      results.push({
        mp: "SELLER",
        sku,
        styleId,
        warehouseId: "SELLER",
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

    const shipmentQty = Math.min(
      actualShipmentQty,
      allocatableUniware
    );

    if (shipmentQty > 0) {
      uniwareUsed += shipmentQty;
    }

    results.push({
      mp: "SELLER",
      sku,
      styleId,
      warehouseId: "SELLER",
      saleQty,
      drr,
      actualShipmentQty,
      shipmentQty,
      action: shipmentQty > 0 ? "SHIP" : "NONE",
      remark:
        shipmentQty < actualShipmentQty
          ? "Reduced due to MP priority"
          : "",
    });
  });

  return {
    rows: results,
    uniwareUsed,
  };
}
