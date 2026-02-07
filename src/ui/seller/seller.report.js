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
  let grandActual = 0;
  let grandShip = 0;

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
    grandActual += r.actualShipmentQty;
    grandShip += r.shipmentQty;
  });

  const rowsHtml = Object.values(summaryMap)
    .sort((a, b) => a.mp.localeCompare(b.mp))
    .map(
      s => `
        <tr>
          <td>${s.mp}</td>
          <td>${s.fc}</td>
          <td>${s.actual}</td>
          <td class="ship-col">${s.ship}</td>
        </tr>
      `
    )
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
          <tr class="grand-total">
            <td><b>ALL</b></td>
            <td><b>ALL</b></td>
            <td><b>${grandActual}</b></td>
            <td class="ship-col"><b>${grandShip}</b></td>
          </tr>
        </tbody>
      </table>
    </section>
  `;
}

/* ======================================================
   SELLER REPORT (RETURNS HTML ONLY)
====================================================== */
export function renderSellerReport() {
  const rows = [...getSellerRows()].sort(
    (a, b) => b.saleQty - a.saleQty
  );

  const body = rows.length
    ? rows
        .map(r => {
          const warningBadge =
            r.replenishmentFc === "DEFAULT_FC"
              ? `<span class="warn-badge" title="No MP or FC stock history found. FC not assigned.">⚠ Needs FC Mapping</span>`
              : "";

          return `
            <tr>
              <td>${r.styleId}</td>
              <td>${r.sku}</td>
              <td>SELLER</td>
              <td>${r.replenishmentFc || "-"} ${warningBadge}</td>
              <td>${r.replenishmentMp || "-"}</td>
              <td>${r.saleQty}</td>
              <td>${r.drr.toFixed(2)}</td>
              <td>${r.actualShipmentQty}</td>
              <td class="ship-col">${r.shipmentQty}</td>
              <td>${r.action}</td>
              <td>${r.remark || ""}</td>
            </tr>
          `;
        })
        .join("")
    : `<tr><td colspan="11" class="no-data">No results</td></tr>`;

  // SAFE search binding (overwrite, no assumptions)
  setTimeout(() => {
    const input = document.getElementById("seller-search");
    const tbody = document.getElementById("seller-report-body");
    if (!input || !tbody) return;

    input.onkeyup = () => {
      const q = input.value.toLowerCase();
      Array.from(tbody.rows).forEach(row => {
        row.style.display = row.innerText.toLowerCase().includes(q)
          ? ""
          : "none";
      });
    };
  }, 0);

  return `
    ${renderSellerSummary(rows)}

    <section class="report-section">
      <div class="report-header">
        <h2 class="report-title">Seller Shipment Report</h2>
        <input
          id="seller-search"
          class="table-search"
          placeholder="Search Style / SKU / FC / MP"
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
          ${body}
        </tbody>
      </table>
    </section>
  `;
}
