import { getAmazonStore } from "../../stores/amazon.store.js";

export function renderAmazonReport(filter = "") {
  const store = getAmazonStore();
  let rows = store?.rows || [];

  if (filter) {
    const q = filter.toLowerCase();
    rows = rows.filter(r =>
      r.sku.toLowerCase().includes(q) ||
      r.styleId.toLowerCase().includes(q) ||
      r.warehouseId.toLowerCase().includes(q)
    );
  }

  const bodyRows = rows.map(r => {
    const actionClass =
      r.action === "SHIP"
        ? "action-ship"
        : r.action === "RECALL"
        ? "action-recall"
        : "action-none";

    return `
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
          <span class="action-pill ${actionClass}">
            ${r.action}
          </span>
        </td>
        <td>${r.remark || ""}</td>
      </tr>
    `;
  }).join("");

  setTimeout(() => {
    const input = document.querySelector(".report-search");
    if (input) {
      input.oninput = e => {
        renderAmazonReport(e.target.value);
      };
    }
  }, 0);

  return `
    <section class="report-section">
      <div class="report-header">
        <h2 class="report-title">Shipment & Recall Report</h2>
        <input
          type="text"
          class="report-search"
          placeholder="Search SKU / Style / FC"
          value="${filter}"
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
          ${bodyRows || `<tr><td colspan="12">No results</td></tr>`}
        </tbody>
      </table>
    </section>
  `;
}
