import { renderAmazonReport } from "./amazon.report.js";

export function renderAmazonSummaries() {
  const container = document.getElementById("tab-content");

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
          <tr>
            <td colspan="5" class="placeholder-row">
              FC Summary data will appear here
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <!-- SHIPMENT & RECALL SUMMARY -->
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
