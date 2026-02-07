/* ======================================================
   AMAZON ENGINE – VA4.3 (DRR ROUNDED VERSION)
   🔒 DRR is rounded to 2 decimals and used everywhere
====================================================== */

const TARGET_DAYS = 45;
const RECALL_DAYS = 90;

function groupBy(arr, keyFn) {
  return arr.reduce((acc, item) => {
    const key = keyFn(item);
    acc[key] = acc[key] || [];
    acc[key].push(item);
    return acc;
  }, {});
}

function round2(num) {
  return Math.round(num * 100) / 100;
}

export function runAmazonEngine({
  sales,
  fcStock,
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

  /* ----- AMAZON SALES ONLY ----- */
  const amazonSales = sales.filter(r => r.mp === "AMAZON IN");

  /* ----- GROUP SALES BY SKU (FOR UNIWARE ONLY) ----- */
  const salesBySku = groupBy(amazonSales, r => r.sku);

  /* ----- AMAZON FC STOCK MAP ----- */
  const amazonFcStock = fcStock.filter(r => r.mp === "AMAZON IN");
  const fcStockMap = {};
  amazonFcStock.forEach(r => {
    fcStockMap[`${r.sku}__${r.warehouseId}`] = r.quantity;
  });

  /* ----- UNIWARE MAP ----- */
  const uniwareMap = Object.fromEntries(
    uniwareStock.map(u => [u.uniwareSku, u.quantity])
  );

  const results = [];
  let uniwareUsed = 0;

  Object.entries(salesBySku).forEach(([sku, skuRows]) => {
    const totalSkuSale = skuRows.reduce((s, r) => s + r.quantity, 0);
    const uniwareSku = skuRows[0].uniwareSku;
    const totalUniware = uniwareMap[uniwareSku] || 0;

    const allocatableUniware = Math.max(
      0,
      Math.min(
        Math.floor(totalUniware * 0.4),
        uniware40CapRemaining - uniwareUsed
      )
    );

    Object.values(groupBy(skuRows, r => r.warehouseId)).forEach(fcRows => {
      const r0 = fcRows[0];
      const saleQty = fcRows.reduce((s, r) => s + r.quantity, 0);

      /* ✅ DRR FORCED TO 2 DECIMALS */
      const rawDRR = saleQty / 30;
      const drr = round2(rawDRR);

      const fcKey = `${sku}__${r0.warehouseId}`;
      const fcQty = fcStockMap[fcKey] || 0;

      const stockCover = drr > 0 ? round2(fcQty / drr) : 0;

      /* ----- CLOSED ----- */
      if (closedStyles.has(r0.styleId)) {
        results.push({
          mp: "AMAZON IN",
          sku,
          styleId: r0.styleId,
          warehouseId: r0.warehouseId,
          saleQty,
          drr,
          fcStock: fcQty,
          stockCover,
          actualShipmentQty: 0,
          shipmentQty: 0,
          recallQty: fcQty,
          action: "RECALL",
          remark: "Closed",
        });
        return;
      }

      /* ----- RECALL ----- */
      let recallQty = 0;
      if (stockCover > RECALL_DAYS && drr > 0) {
        recallQty = Math.max(
          0,
          Math.floor(fcQty - RECALL_DAYS * drr)
        );
      }

      /* ----- ACTUAL SHIPMENT ----- */
      const actualShipmentQty =
        drr > 0
          ? Math.max(0, Math.ceil(TARGET_DAYS * drr - fcQty))
          : 0;

      const shipmentQty = Math.min(
        actualShipmentQty,
        allocatableUniware
      );

      if (shipmentQty > 0) {
        uniwareUsed += shipmentQty;
      }

      results.push({
        mp: "AMAZON IN",
        sku,
        styleId: r0.styleId,
        warehouseId: r0.warehouseId,
        saleQty,
        drr,
        fcStock: fcQty,
        stockCover,
        actualShipmentQty,
        shipmentQty,
        recallQty,
        action:
          recallQty > 0
            ? "RECALL"
            : shipmentQty > 0
            ? "SHIP"
            : "NONE",
        remark:
          shipmentQty < actualShipmentQty
            ? "40% Uniware constrained"
            : "",
      });
    });
  });

  return {
    rows: results,
    uniwareUsed,
  };
}
