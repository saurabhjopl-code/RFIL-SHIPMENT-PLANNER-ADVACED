import { getAmazonStore } from "../../stores/amazon.store.js";
import { renderAmazonReport } from "./amazon.report.js";

function buildFcSummary(rows) {
  const fcMap = {};
  let grandSale = 0;
  let grandStock = 0;

  rows.forEach(r => {
    if (!fcMap[r.warehouseId]) {
      fcMap[r.warehouseId] = {
        fc: r.warehouseId,
        totalSale: 0,
        totalStock: 0,
      };
    }

    fcMap[r.warehouseId].totalSale += r.saleQty;
    fcMap[r.warehouseId].totalStock += r.fcStock;
    grandSale += r.saleQty;
    grandStock += r.fcStock;
  });

  const bodyRows = Object.values(fcMap)
    .map(fc => {
      const drr = fc.totalSale / 30;
      const cover = drr > 0 ? fc.totalStock / drr : 0;

      return `
        <tr>
          <td>${fc.fc}</td>
          <td>${fc.totalStock}</td>
          <td>${fc.totalSale}</td>
          <td>${drr.toFixed(2)}</td>
          <td>${cover.toFixed(1)}</td>
        </tr>
      `;
    })
    .join("");

  const grandDrr = grandSale / 30;
  const grandCover = grandDrr > 0 ? grandStock / grandDrr : 0;

  const grandRow = `
    <tr class="grand-total">
      <td><b>Grand Total</b></td>
      <td><b>${grandStock}</b></td>
      <td><b>${grandSale}</b></td>
      <td><b>${grandDrr.toFixed(2)}</b></td>
      <td><b>${grandCover.toFixed(1)}</b></td>
    </tr>
  `;

  return bodyRows + grandRow;
}

export function renderAmazonSummaries() {
  const container = document.getElementById("tab-content");
  const store = getAmazonStore();
  const rows = store?.rows || [];

  const fcSummaryHtml = rows.length
    ? buildFcSummary(rows)
    : `
      <tr>
        <td colspan="5" class="placeholder-row">
          No data available
        </td>
      </tr>
    `;

  container.innerHTML = `
    <!-- FC SUMMARY -->
    <section class="summary-section">
      <h2 class="summary-title">FC Summary</h2>
      <table class="summary-table">
        <thead>
          <tr>
            <th>FC</th>
            <th>Total Stock</th>
            <th>Total Sale</th>
            <th>DRR</th>
            <th>Stock Cover</th>
          </tr>
        </thead>
        <tbody>
          ${fcSummaryHtml}
        </tbody>
      </table>
    </section>

    <!-- SHIPMENT & RECALL SUMMARY (NEXT STEP) -->
    <section class="summary-section">
      <h2 class="summary-title">Shipment & Recall Summary</h2>
      <table class="summary-table">
        <thead>
          <tr>
            <th>FC</th>
            <th>Total Stock</th>
            <th>Total Sale</th>
            <th>DRR</th>
            <th>Actual Shipment Qty</th>
            <th class="ship-col">Shipment Qty (Allocated)</th>
            <th class="recall-col">Recall Qty</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colspan="7" class="placeholder-row">
              Shipment & Recall summary data will appear here
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    ${renderAmazonReport()}
  `;
}
