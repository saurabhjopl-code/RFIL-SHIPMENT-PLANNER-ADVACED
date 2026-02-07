import { getAmazonStore } from "../../stores/amazon.store.js";

export function renderAmazonReport() {
  const store = getAmazonStore();
  const rows = store?.rows || [];

  if (!rows.length) {
    return `
      <section class="report-section">
        <div class="report-header">
          <h2 class="report-title">Shipment & Recall Report</h2>
          <input
            type="text"
            class="report-search"
            placeholder="Search SKU / Style / FC"
            disabled
          />
        </div>

        <table class="report-table">
          <tbody>
            <tr>
              <td class="placeholder-row">
                No data available
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    `;
  }

  const bodyRows = rows
    .map(r => {
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
    })
    .join("");

  return `
    <section class="report-section">
      <div class="report-header">
        <h2 class="report-title">Shipment & Recall Report</h2>
        <input
          type="text"
          class="report-search"
          placeholder="Search SKU / Style / FC"
          disabled
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
          ${bodyRows}
        </tbody>
      </table>
    </section>
  `;
}
