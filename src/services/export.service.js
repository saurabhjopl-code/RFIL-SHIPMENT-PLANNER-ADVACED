/* ======================================================
   SIMPLE TABLE EXPORT – FINAL & SAFE
   - Exports Shipment & Recall Report as-is
   - No recalculation
   - No regrouping
====================================================== */

export function exportCurrentReportTable() {
  if (!window.XLSX) {
    alert("Export library not loaded");
    return;
  }

  // Shipment & Recall Report table
  const table = document.querySelector(".report-table");

  if (!table) {
    alert("Shipment & Recall Report table not found");
    return;
  }

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.table_to_sheet(table);

  XLSX.utils.book_append_sheet(wb, ws, "Shipment & Recall Report");

  XLSX.writeFile(
    wb,
    `Shipment_Recall_Report_${new Date()
      .toISOString()
      .slice(0, 10)}.xlsx`
  );
}
