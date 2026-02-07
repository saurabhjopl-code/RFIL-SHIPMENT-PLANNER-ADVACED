/* ======================================================
   EXPORT SERVICE – VA-EXPORT
   - One Excel file
   - Separate sheet per MP
   - DEFAULT_FC excluded
====================================================== */

import { getAmazonStore } from "../stores/amazon.store.js";
import { getFlipkartRows } from "../stores/flipkart.store.js";
import { getMyntraRows } from "../stores/myntra.store.js";
import { getSellerRows } from "../stores/seller.store.js";

function ensureXLSX() {
  if (!window.XLSX) {
    alert("Export library not loaded");
    return false;
  }
  return true;
}

function sheetFromRows(rows, columns) {
  return XLSX.utils.json_to_sheet(
    rows.map(r => {
      const obj = {};
      columns.forEach(c => (obj[c] = r[c] ?? ""));
      return obj;
    })
  );
}

export function exportAllMPs() {
  if (!ensureXLSX()) return;

  const wb = XLSX.utils.book_new();

  /* ================= AMAZON ================= */
  const amazonStore = getAmazonStore();
  if (amazonStore?.rows?.length) {
    const rows = amazonStore.rows;
    const sheet = sheetFromRows(rows, [
      "styleId",
      "sku",
      "warehouseId",
      "saleQty",
      "drr",
      "fcStock",
      "stockCover",
      "actualShipmentQty",
      "shipmentQty",
      "recallQty",
      "action",
      "remark",
    ]);
    XLSX.utils.book_append_sheet(wb, sheet, "Amazon");
  }

  /* ================= FLIPKART ================= */
  const flipkartRows = getFlipkartRows();
  if (flipkartRows.length) {
    const sheet = sheetFromRows(flipkartRows, [
      "styleId",
      "sku",
      "warehouseId",
      "saleQty",
      "drr",
      "fcStock",
      "stockCover",
      "actualShipmentQty",
      "shipmentQty",
      "recallQty",
      "action",
      "remark",
    ]);
    XLSX.utils.book_append_sheet(wb, sheet, "Flipkart");
  }

  /* ================= MYNTRA ================= */
  const myntraRows = getMyntraRows();
  if (myntraRows.length) {
    const sheet = sheetFromRows(myntraRows, [
      "styleId",
      "sku",
      "warehouseId",
      "saleQty",
      "drr",
      "fcStock",
      "stockCover",
      "actualShipmentQty",
      "shipmentQty",
      "recallQty",
      "action",
      "remark",
    ]);
    XLSX.utils.book_append_sheet(wb, sheet, "Myntra");
  }

  /* ================= SELLER ================= */
  const sellerRows = getSellerRows().filter(
    r => r.replenishmentFc && r.replenishmentFc !== "DEFAULT_FC"
  );

  if (sellerRows.length) {
    const sheet = sheetFromRows(sellerRows, [
      "styleId",
      "sku",
      "replenishmentMp",
      "replenishmentFc",
      "saleQty",
      "drr",
      "actualShipmentQty",
      "shipmentQty",
      "action",
      "remark",
    ]);
    XLSX.utils.book_append_sheet(wb, sheet, "Seller");
  }

  XLSX.writeFile(wb, "Shipment_Planner_Export.xlsx");
}

