import { getSellerRows } from "../../stores/seller.store.js";

/* ======================================================
   SELLER SHIPMENT REPORT
   - No Recall
   - No FC stock
   - Sorted by Sale Qty (High → Low)
====================================================== */

export function renderSellerReport() {
  const rows = [...getSellerRows()]
    .sort((a, b) => b.saleQty - a.saleQty);

  const body = rows.length
    ? rows.map(r => `
        <tr>
          <td>${r.styleId}</td>
          <td>${r.sku}</td>
          <td>SELLER</td>
          <td>${r.saleQty}</td>
          <td>${r.drr.toFixed(2)}</td>
          <td>${r.actualShipmentQty}</td>
          <td class="ship-col">${r.shipmentQty}</td>
          <td>
            <span class="action ${r.action.toLowerCase()}">
              ${r.action}
            </span>
          </td>
          <td>${r.remark || ""}</td>
        </tr>
      `).join("")
    : `
        <tr>
          <td colspan="9" class="no-data">No results</td>
        </tr>
      `;

  return `
    <section class="report-section">
      <div class="report-header">
        <h2 class="report-title">Seller Shipment Report</h2>
        <input
          id="seller-search"
          type="text"
          placeholder="Search SKU / Style"
          class="table-search"
        />
      </div>

      <table class="report-table">
        <thead>
          <tr>
            <th>Style</th>
            <th>SKU</th>
            <th>MP</th>
            <th>Sale Qty</th>
            <th>DRR</th>
            <th>Actual Shipment Qty</th>
            <th class="ship-col">Shipment Qty</th>
            <th>Action</th>
            <th>Remarks</th>
          </tr>
        </thead>
        <tbody>
          ${body}
        </tbody>
      </table>
    </section>
  `;
}
