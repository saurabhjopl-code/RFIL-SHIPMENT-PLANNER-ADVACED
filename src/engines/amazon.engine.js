/* ======================================================
   AMAZON ENGINE – VA4.3 (LOCKED)
   - DW = MP → SKU
   - Seller via Warehouse Id === "SELLER"
   - Closed override
   - Uniware 40% global cap (applied upstream)
====================================================== */

const TARGET_DAYS = 45;
const RECALL_DAYS = 90;

/* ---------- HELPERS ---------- */
function groupBy(arr, keyFn) {
  return arr.reduce((acc, item) => {
    const key = keyFn(item);
    acc[key] = acc[key] || [];
    acc[key].push(item);
    return acc;
  }, {});
}

/* ---------- ENGINE ---------- */
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

  /* ----- AMAZON SALES (SELLER FILTERED OUT) ----- */
  const amazonSales = sales.filter(
    r =>
      r.mp === "Amazon" &&
      r.warehouseId !== "SELLER" &&
      !closedStyles.has(r.styleId)
  );

  /* ----- GROUP SALES BY SKU ----- */
  const salesBySku = groupBy(amazonSales, r => r.sku);

  /* ----- FC STOCK (AMAZON) ----- */
  const amazonFcStock = fcStock.filter(r => r.mp === "Amazon");
  const fcStockBySkuFc = groupBy(
    amazonFcStock,
    r => `${r.sku}__${r.warehouseId}`
  );

  /* ----- UNIWARE MAP ----- */
  const uniwareMap = Object.fromEntries(
    uniwareStock.map(u => [u.uniwareSku, u.quantity])
  );

  const results = [];
  let uniwareUsed = 0;

  /* ----- PROCESS EACH SKU ----- */
  Object.entries(salesBySku).forEach(([sku, rows]) => {
    const totalSkuSale = rows.reduce((s, r) => s + r.quantity, 0);
    const drr = totalSkuSale / 30;

    // DW = MP → SKU (Amazon share vs total MP sales)
    // Since this is Amazon-only engine, DW is computed upstream later.
    // Here we assume Amazon DW = 1 for its own engine slice.
    const amazonDW = 1;

    // Uniware allocatable for this SKU
    const uniwareSku = rows[0].uniwareSku;
    const totalUniware = uniwareMap[uniwareSku] || 0;

    const allocatableUniware = Math.max(
      0,
      Math.min(
        Math.floor(totalUniware * 0.4),
        uniware40CapRemaining - uniwareUsed
      )
    );

    /* ----- FC LEVEL ----- */
    Object.values(
      groupBy(rows, r => r.warehouseId)
    ).forEach(fcRows => {
      const warehouseId = fcRows[0].warehouseId;

      const saleQty = fcRows.reduce((s, r) => s + r.quantity, 0);
      const fcKey = `${sku}__${warehouseId}`;
      const fcQty =
        fcStockBySkuFc[fcKey]?.[0]?.quantity || 0;

      const stockCover = drr > 0 ? fcQty / drr : 0;

      // Closed style safety (double guard)
      if (closedStyles.has(fcRows[0].styleId)) {
        results.push({
          mp: "Amazon",
          sku,
          styleId: fcRows[0].styleId,
          warehouseId,
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

      /* ----- RECALL CHECK ----- */
      let recallQty = 0;
      if (stockCover > RECALL_DAYS && drr > 0) {
        recallQty = Math.max(
          0,
          Math.floor(fcQty - RECALL_DAYS * drr)
        );
      }

      /* ----- ACTUAL SHIPMENT ----- */
      const actualShipmentQty = Math.max(
        0,
        Math.ceil(TARGET_DAYS * drr - fcQty)
      );

      /* ----- FINAL SHIPMENT (CAPPED) ----- */
      const shipmentQty = Math.min(
        actualShipmentQty,
        allocatableUniware
      );

      if (shipmentQty > 0) {
        uniwareUsed += shipmentQty;
      }

      results.push({
        mp: "Amazon",
        sku,
        styleId: fcRows[0].styleId,
        warehouseId,
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
