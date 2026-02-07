/* ======================================================
   FC-WISE EXPORT SERVICE – FINAL
   - One Excel file per FC
   - MP + SELLER merged naturally
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
   Resolve FC robustly
------------------------------------------------------ */
function resolveFc(row) {
  return (
    row.fc ||
    row.FC ||
    row.warehouseId ||
    row.warehouse ||
    ""
  );
}

/* ------------------------------------------------------
   Collect ALL rows grouped by FC
------------------------------------------------------ */
function collectRowsByFc() {
  const fcMap = {};

  /* ---------- AMAZON ---------- */
  const amazonRows = getAmazonStore()?.rows || [];
  amazonRows.forEach(r => {
    const fc = resolveFc(r);
    if (!fc || fc === "DEFAULT_FC") return;

    fcMap[fc] = fcMap[fc] || [];
    fcMap[fc].push({
      Source: "MP",
      MP: "AMAZON",
      Style: r.styleId,
      SKU: r.sku,
      FC: fc,
      "Sale Qty": r.saleQty,
      DRR: r.drr,
      "Actual Shipment Qty": r.actualShipmentQty,
      "Shipment Qty": r.shipmentQty,
      Action: r.action,
      Remarks: r.remark || "",
    });
  });

  /* ---------- FLIPKART ---------- */
  getFlipkartRows().forEach(r => {
    const fc = resolveFc(r);
    if (!fc || fc === "DEFAULT_FC") return;

    fcMap[fc] = fcMap[fc] || [];
    fcMap[fc].push({
      Source: "MP",
      MP: "FLIPKART",
      Style: r.styleId,
      SKU: r.sku,
      FC: fc,
      "Sale Qty": r.saleQty,
      DRR: r.drr,
      "Actual Shipment Qty": r.actualShipmentQty,
      "Shipment Qty": r.shipmentQty,
      Action: r.action,
      Remarks: r.remark || "",
    });
  });

  /* ---------- MYNTRA ---------- */
  getMyntraRows().forEach(r => {
    const fc = resolveFc(r);
    if (!fc || fc === "DEFAULT_FC") return;

    fcMap[fc] = fcMap[fc] || [];
    fcMap[fc].push({
      Source: "MP",
      MP: "MYNTRA",
      Style: r.styleId,
      SKU: r.sku,
      FC: fc,
      "Sale Qty": r.saleQty,
      DRR: r.drr,
      "Actual Shipment Qty": r.actualShipmentQty,
      "Shipment Qty": r.shipmentQty,
      Action: r.action,
      Remarks: r.remark || "",
    });
  });

  /* ---------- SELLER ---------- */
  getSellerRows()
    .filter(
      r =>
        r.replenishmentFc &&
        r.replenishmentFc !== "DEFAULT_FC" &&
        r.shipmentQty > 0
    )
    .forEach(r => {
      const fc = r.replenishmentFc;

      fcMap[fc] = fcMap[fc] || [];
      fcMap[fc].push({
        Source: "SELLER",
        MP: r.replenishmentMp,
        Style: r.styleId,
        SKU: r.sku,
        FC: fc,
        "Sale Qty": r.saleQty,
        DRR: r.drr,
        "Actual Shipment Qty": r.actualShipmentQty,
        "Shipment Qty": r.shipmentQty,
        Action: "SHIP",
        Remarks: "From SELLER allocation",
      });
    });

  return fcMap;
}

/* ------------------------------------------------------
   EXPORT ENTRY POINT (GLOBAL)
------------------------------------------------------ */
export function exportByFc() {
  if (!ensureXLSX()) return;

  const fcMap = collectRowsByFc();
  const fcs = Object.keys(fcMap);

  if (!fcs.length) {
    alert("No FC shipment data available");
    return;
  }

  const today = new Date().toISOString().slice(0, 10);

  fcs.forEach(fc => {
    const rows = fcMap[fc];
    if (!rows.length) return;

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, "Shipments");

    XLSX.writeFile(
      wb,
      `Shipment_FC_${fc}_${today}.xlsx`
    );
  });
}
