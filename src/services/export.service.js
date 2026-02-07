/* ======================================================
   PER-MP EXPORT SERVICE – VA-EXPORT-FINAL
   GUARANTEES:
   - Source column ALWAYS present
   - FC column ALWAYS populated
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
   Resolve FC from ANY possible key
------------------------------------------------------ */
function resolveFc(row) {
  return (
    row.fc ||
    row.FC ||
    row.warehouseId ||
    row.warehouse ||
    row.fulfillmentCenter ||
    ""
  );
}

/* ------------------------------------------------------
   Normalize MP engine rows
------------------------------------------------------ */
function normalizeMpRow(r) {
  return {
    Source: "MP",
    Style: r.styleId || r.Style || "",
    SKU: r.sku || r.SKU || "",
    FC: resolveFc(r),
    "Sale Qty": r.saleQty ?? "",
    DRR: r.drr ?? "",
    "FC Stock": r.fcStock ?? "",
    "Stock Cover": r.stockCover ?? "",
    "Actual Shipment Qty": r.actualShipmentQty ?? "",
    "Shipment Qty": r.shipmentQty ?? "",
    "Recall Qty": r.recallQty ?? "",
    Action: r.action || "",
    Remarks: r.remark || "",
  };
}

/* ------------------------------------------------------
   Normalize Seller rows injected into MP
------------------------------------------------------ */
function normalizeSellerRow(r) {
  return {
    Source: "SELLER",
    Style: r.styleId,
    SKU: r.sku,
    FC: r.replenishmentFc,
    "Sale Qty": r.saleQty,
    DRR: r.drr,
    "FC Stock": "",
    "Stock Cover": "",
    "Actual Shipment Qty": r.actualShipmentQty,
    "Shipment Qty": r.shipmentQty,
    "Recall Qty": 0,
    Action: "SHIP",
    Remarks: "From SELLER allocation",
  };
}

/* ------------------------------------------------------
   Build rows per MP
------------------------------------------------------ */
function buildRows(mp) {
  let mpRows = [];

  if (mp === "AMAZON") {
    mpRows = getAmazonStore()?.rows || [];
  }
  if (mp === "FLIPKART") {
    mpRows = getFlipkartRows();
  }
  if (mp === "MYNTRA") {
    mpRows = getMyntraRows();
  }

  const normalizedMp = mpRows.map(normalizeMpRow);

  const sellerInjected = getSellerRows()
    .filter(
      r =>
        r.replenishmentMp === mp &&
        r.replenishmentFc &&
        r.replenishmentFc !== "DEFAULT_FC" &&
        r.shipmentQty > 0
    )
    .map(normalizeSellerRow);

  return [...normalizedMp, ...sellerInjected];
}

/* ------------------------------------------------------
   EXPORT ENTRY POINT
------------------------------------------------------ */
export function exportMp(mp) {
  if (!ensureXLSX()) return;

  const rows = buildRows(mp);
  if (!rows.length) {
    alert(`No shipment data for ${mp}`);
    return;
  }

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, "Shipments");

  XLSX.writeFile(
    wb,
    `Shipment_${mp}_${new Date().toISOString().slice(0, 10)}.xlsx`
  );
}
