/* ======================================================
   EXPORT SERVICE – VA4.3
   GitHub Pages SAFE (uses window.XLSX)
====================================================== */

import { getAmazonRows } from "../stores/amazon.store.js";
import { getFlipkartRows } from "../stores/flipkart.store.js";
import { getMyntraRows } from "../stores/myntra.store.js";
import { getSellerRows } from "../stores/seller.store.js";

function addSheet(workbook, sheetName, rows) {
  const ws = window.XLSX.utils.json_to_sheet(rows);
  window.XLSX.utils.book_append_sheet(workbook, ws, sheetName);
}

export function exportShipmentPlanner() {
  if (!window.XLSX) {
    alert("Export library not loaded");
    return;
  }

  const wb = window.XLSX.utils.book_new();

  /* ================= AMAZON ================= */
  addSheet(
    wb,
    "AMAZON",
    getAmazonRows().map(r => ({
      MP: "AMAZON",
      Style: r.styleId,
      SKU: r.sku,
      FC: r.fc,
      "Sale Qty (30D)": r.saleQty,
      DRR: r.drr,
      "FC Stock": r.fcStock,
      "Stock Cover (Days)": r.stockCover,
      "Actual Shipment Qty": r.actualShipmentQty,
      "Shipment Qty": r.shipmentQty,
      "Recall Qty": r.recallQty,
      Action: r.action,
      Remarks: r.remark || "",
    }))
  );

  /* ================= FLIPKART ================= */
  addSheet(
    wb,
    "FLIPKART",
    getFlipkartRows().map(r => ({
      MP: "FLIPKART",
      Style: r.styleId,
      SKU: r.sku,
      FC: r.fc,
      "Sale Qty (30D)": r.saleQty,
      DRR: r.drr,
      "FC Stock": r.fcStock,
      "Stock Cover (Days)": r.stockCover,
      "Actual Shipment Qty": r.actualShipmentQty,
      "Shipment Qty": r.shipmentQty,
      "Recall Qty": r.recallQty,
      Action: r.action,
      Remarks: r.remark || "",
    }))
  );

  /* ================= MYNTRA ================= */
  addSheet(
    wb,
    "MYNTRA",
    getMyntraRows().map(r => ({
      MP: "MYNTRA",
      Style: r.styleId,
      SKU: r.sku,
      FC: r.fc,
      "Sale Qty (30D)": r.saleQty,
      DRR: r.drr,
      "FC Stock": r.fcStock,
      "Stock Cover (Days)": r.stockCover,
      "Actual Shipment Qty": r.actualShipmentQty,
      "Shipment Qty": r.shipmentQty,
      "Recall Qty": r.recallQty,
      Action: r.action,
      Remarks: r.remark || "",
    }))
  );

  /* ================= SELLER ================= */
  addSheet(
    wb,
    "SELLER",
    getSellerRows()
      .filter(
        r =>
          r.replenishmentFc !== "DEFAULT_FC" &&
          r.shipmentQty > 0
      )
      .map(r => ({
        MP: "SELLER",
        Style: r.styleId,
        SKU: r.sku,
        "Replenishment MP": r.replenishmentMp,
        "Replenishment FC": r.replenishmentFc,
        "Sale Qty (30D)": r.saleQty,
        DRR: r.drr,
        "Actual Shipment Qty": r.actualShipmentQty,
        "Shipment Qty": r.shipmentQty,
        Action: r.action,
        Remarks: r.remark || "",
      }))
  );

  window.XLSX.writeFile(wb, "Shipment_Planner_VA4.3.xlsx");
}
