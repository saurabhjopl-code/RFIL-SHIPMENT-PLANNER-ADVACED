/* ======================================================
   PER-MP EXPORT SERVICE – VA-EXPORT
   - Export per MP tab
   - Seller rows merged into MP
   - DEFAULT_FC excluded
====================================================== */

import { getAmazonStore } from "../stores/amazon.store.js";
import { getFlipkartRows } from "../stores/flipkart.store.js";
import { getMyntraRows } from "../stores/myntra.store.js";
import { getSellerRows } from "../stores/seller.store.js";

/* ------------------------------------------------------
   Safety
------------------------------------------------------ */
function ensureXLSX() {
  if (!window.XLSX) {
    alert("Export library not loaded");
    return false;
  }
  return true;
}

/* ------------------------------------------------------
   Build unified shipment rows
------------------------------------------------------ */
function buildMpExportRows(mp) {
  let mpRows = [];

  if (mp === "AMAZON") {
    const store = getAmazonStore();
    mpRows = store?.rows || [];
  }
  if (mp === "FLIPKART") {
    mpRows = getFlipkartRows();
  }
  if (mp === "MYNTRA") {
    mpRows = getMyntraRows();
  }

  const sellerRows = getSellerRows()
    .filter(
      r =>
        r.replenishmentMp === mp &&
        r.replenishmentFc &&
        r.replenishmentFc !== "DEFAULT_FC" &&
        r.shipmentQty > 0
    )
    .map(r => ({
      styleId: r.styleId,
      sku: r.sku,
      fc: r.replenishmentFc,
      saleQty: r.saleQty,
      drr: r.drr,
      fcStock: "",
      stockCover: "",
      actualShipmentQty: r.actualShipmentQty,
      shipmentQty: r.shipmentQty,
      recallQty: 0,
      action: "SHIP",
      remark: "From SELLER allocation",
    }));

  return [...mpRows, ...sellerRows];
}

/* ------------------------------------------------------
   Export handler
------------------------------------------------------ */
export function exportMp(mp) {
  if (!ensureXLSX()) return;

  const rows = buildMpExportRows(mp);
  if (!rows.length) {
    alert(`No shipment data available for ${mp}`);
    return;
  }

  const sheetData = rows.map(r => ({
    Style: r.styleId,
    SKU: r.sku,
    FC: r.fc,
    "Sale Qty": r.saleQty,
    DRR: r.drr,
    "FC Stock": r.fcStock,
    "Stock Cover": r.stockCover,
    "Actual Shipment Qty": r.actualShipmentQty,
    "Shipment Qty": r.shipmentQty,
    "Recall Qty": r.recallQty,
    Action: r.action,
    Remarks: r.remark || "",
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(sheetData);
  XLSX.utils.book_append_sheet(wb, ws, "Shipments");

  XLSX.writeFile(
    wb,
    `Shipment_${mp}_${new Date().toISOString().slice(0, 10)}.xlsx`
  );
}
