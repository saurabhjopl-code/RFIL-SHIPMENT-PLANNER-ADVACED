export function renderAmazonReport() {
  return `
    <section class="report-section">

      <!-- REPORT HEADER -->
      <div class="report-header">
        <h2 class="report-title">Shipment & Recall Report</h2>

        <input
          type="text"
          class="report-search"
          placeholder="Search SKU / Style / FC"
          disabled
        />
      </div>

      <!-- REPORT TABLE -->
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
          <tr>
            <td colspan="12" class="placeholder-row">
              Shipment & Recall report data will appear here
            </td>
          </tr>
        </tbody>
      </table>

    </section>
  `;
}
