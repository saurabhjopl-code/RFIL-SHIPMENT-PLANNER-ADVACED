import { getMyntraRows } from "../../stores/myntra.store.js";

export function renderMyntraReport() {
  const rows = [...getMyntraRows()]
    .sort((a, b) => b.saleQty - a.saleQty);

  const body = rows.length
    ? rows.map(r => `
        <tr>
          <td>${r.styleId}</td>
          <td>${r.sku}</td>
          <td>${r.warehouseId}</td>
          <td>${r.saleQty}</td>
          <td>${r.drr.toFixed(2)}</td>
          <td>${r.fcStock}</td>
          <td>${r.stockCover.toFixed(1)}</td>
          <td>${r.actualShipmentQty}</td>
          <td class="ship-col">${r.shipmentQty}</td>
          <td class="recall-col">${r.recallQty}</td>
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
          <td colspan="12" class="no-data">No results</td>
        </tr>
      `;

  return `
    <section class="report-section">
      <div class="report-header">
        <h2 class="report-title">Shipment & Recall Report</h2>
        <input
          id="myntra-search"
          type="text"
          placeholder="Search SKU / Style / FC"
          class="table-search"
        />
      </div>

      <table class="report-table">
        <thead>
          <tr>
            <th>Style</th>
            <th>SKU</th>
            <th>FC</th>
            <th>Sale Qty</th>
            <th>DRR</th>
            <th>FC Stock</th>
            <th>Cover</th>
            <th>Actual Shipment Qty</th>
            <th class="ship-col">Shipment Qty</th>
            <th class="recall-col">Recall Qty</th>
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
