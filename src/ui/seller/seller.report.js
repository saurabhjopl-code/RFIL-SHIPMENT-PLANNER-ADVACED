import { getSellerRows } from "../../stores/seller.store.js";

/* ======================================================
   SELLER SUMMARY (EXECUTABLE ONLY)
====================================================== */
function renderSellerSummary(rows) {
  const validRows = rows.filter(
    r =>
      r.replenishmentFc &&
      r.replenishmentFc !== "DEFAULT_FC" &&
      r.replenishmentMp &&
      r.replenishmentMp !== "N/A" &&
      r.shipmentQty > 0
  );

  if (validRows.length === 0) {
    return `
      <section class="summary-section">
        <h2 class="summary-title">Seller Summary</h2>
        <div class="no-data">No executable seller shipments</div>
      </section>
    `;
  }

  const summaryMap = {};

  validRows.forEach(r => {
    const key = `${r.replenishmentMp}__${r.replenishmentFc}`;
    if (!summaryMap[key]) {
      summaryMap[key] = {
        mp: r.replenishmentMp,
        fc: r.replenishmentFc,
        actual: 0,
        ship: 0,
      };
    }
    summaryMap[key].actual += r.actualShipmentQty;
    summaryMap[key].ship += r.shipmentQty;
  });

  const rowsHtml = Object.values(summaryMap)
    .map(s => `
      <tr>
        <td>${s.mp}</td>
        <td>${s.fc}</td>
        <td>${s.actual}</td>
        <td class="ship-col">${s.ship}</td>
      </tr>
    `)
    .join("");

  return `
    <section class="summary-section">
      <h2 class="summary-title">Seller Summary</h2>
      <table class="summary-table">
        <thead>
          <tr>
            <th>Replenishment MP</th>
            <th>Replenishment FC</th>
            <th>Actual Shipment Qty</th>
            <th class="ship-col">Shipment Qty</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    </section>
  `;
}

/* ======================================================
   SELLER REPORT
====================================================== */
export function renderSellerReport() {
  const rows = [...getSellerRows()].sort(
    (a, b) => b.saleQty - a.saleQty
  );

  const body = rows
    .map(r => {
      const isDefaultFc = r.replenishmentFc === "DEFAULT_FC";

      const warningBadge = isDefaultFc
        ? `<span class="warn-badge" title="No MP or FC stock history found. FC not assigned.">⚠ Needs FC Mapping</span>`
        : "";

      return `
        <tr>
          <td>${r.styleId}</td>
          <td>${r.sku}</td>
          <td>SELLER</td>
          <td>
            ${r.replenishmentFc || "-"}
            ${warningBadge}
          </td>
          <td>${r.replenishmentMp || "-"}</td>
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
      `;
    })
    .join("");

  const html = `
    ${renderSellerSummary(rows)}

    <section class="report-section">
      <div class="report-header">
        <h2 class="report-title">Seller Shipment Report</h2>
        <input
          id="seller-search"
          type="text"
          placeholder="Search Style / SKU / FC / MP"
          class="table-search"
        />
      </div>

      <table class="report-table">
        <thead>
          <tr>
            <th>Style</th>
            <th>SKU</th>
            <th>MP</th>
            <th>Replenishment FC</th>
            <th>Replenishment MP</th>
            <th>Sale Qty</th>
            <th>DRR</th>
            <th>Actual Shipment Qty</th>
            <th class="ship-col">Shipment Qty</th>
            <th>Action</th>
            <th>Remarks</th>
          </tr>
        </thead>
        <tbody id="seller-report-body">
          ${body || `<tr><td colspan="11" class="no-data">No results</td></tr>`}
        </tbody>
      </table>
    </section>
  `;

  // Render
  const container = document.getElementById("tab-content");
  container.innerHTML = html;

  /* ======================================================
     SEARCH HANDLER (REPORT ONLY)
  ====================================================== */
  const searchInput = document.getElementById("seller-search");
  const tbody = document.getElementById("seller-report-body");

  searchInput.addEventListener("keyup", () => {
    const q = searchInput.value.toLowerCase();

    Array.from(tbody.querySelectorAll("tr")).forEach(tr => {
      const text = tr.innerText.toLowerCase();
      tr.style.display = text.includes(q) ? "" : "none";
    });
  });
}
