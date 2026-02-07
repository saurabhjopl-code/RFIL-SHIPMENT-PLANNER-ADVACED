import { getSellerRows } from "../../stores/seller.store.js";

/* ======================================================
   SELLER SUMMARY
====================================================== */
function renderSellerSummary(rows) {
  const totalSale = rows.reduce((s, r) => s + r.saleQty, 0);
  const totalActual = rows.reduce((s, r) => s + r.actualShipmentQty, 0);
  const totalShip = rows.reduce((s, r) => s + r.shipmentQty, 0);

  return `
    <section class="summary-section">
      <h2 class="summary-title">Seller Summary</h2>
      <table class="summary-table">
        <thead>
          <tr>
            <th>Total Sale</th>
            <th>Actual Shipment Qty</th>
            <th>Shipment Qty</th>
          </tr>
        </thead>
        <tbody>
          <tr class="grand-total">
            <td><b>${totalSale}</b></td>
            <td><b>${totalActual}</b></td>
            <td><b>${totalShip}</b></td>
          </tr>
        </tbody>
      </table>
    </section>
  `;
}

/* ======================================================
   SELLER SHIPMENT REPORT
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
          <td>${r.replenishmentFc || "-"}</td>
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
      `).join("")
    : `
        <tr>
          <td colspan="11" class="no-data">No results</td>
        </tr>
      `;

  return `
    ${renderSellerSummary(rows)}

    <section class="report-section">
      <div class="report-header">
        <h2 class="report-title">Seller Shipment Report</h2>
        <input
          id="seller-search"
          type="text"
          placeholder="Search SKU / Style / FC / MP"
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
        <tbody>
          ${body}
        </tbody>
      </table>
    </section>
  `;
}
