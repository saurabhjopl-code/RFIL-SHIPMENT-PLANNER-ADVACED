import { getAmazonStore } from "../../stores/amazon.store.js";
import { renderAmazonReport } from "./amazon.report.js";

/* ======================================================
   BUILD FC MAP (DEDUP STOCK BY FC+SKU)
====================================================== */
function buildFcMap(rows) {
  const fcMap = {};
  const stockSeen = new Set();

  rows.forEach(r => {
    if (!fcMap[r.warehouseId]) {
      fcMap[r.warehouseId] = {
        fc: r.warehouseId,
        totalSale: 0,
        totalStock: 0,
        actualShip: 0,
        shipQty: 0,
        recallQty: 0,
      };
    }

    const fc = fcMap[r.warehouseId];

    // Sale (row based)
    fc.totalSale += r.saleQty;

    // Stock (unique FC+SKU)
    const stockKey = `${r.warehouseId}__${r.sku}`;
    if (!stockSeen.has(stockKey)) {
      fc.totalStock += r.fcStock;
      stockSeen.add(stockKey);
    }

    // Shipment
    fc.actualShip += r.actualShipmentQty;
    fc.shipQty += r.shipmentQty;
    fc.recallQty += r.recallQty;
  });

  return fcMap;
}

/* ======================================================
   FC SUMMARY HTML
====================================================== */
function buildFcSummaryHtml(fcMap) {
  let gSale = 0;
  let gStock = 0;

  let html = "";

  Object.values(fcMap).forEach(fc => {
    const drr = fc.totalSale / 30;
    const cover = drr > 0 ? fc.totalStock / drr : 0;

    gSale += fc.totalSale;
    gStock += fc.totalStock;

    html += `
      <tr>
        <td>${fc.fc}</td>
        <td>${fc.totalStock}</td>
        <td>${fc.totalSale}</td>
        <td>${drr.toFixed(2)}</td>
        <td>${cover.toFixed(1)}</td>
      </tr>
    `;
  });

  const gDrr = gSale / 30;
  const gCover = gDrr > 0 ? gStock / gDrr : 0;

  html += `
    <tr class="grand-total">
      <td><b>Amazon All FC</b></td>
      <td><b>${gStock}</b></td>
      <td><b>${gSale}</b></td>
      <td><b>${gDrr.toFixed(2)}</b></td>
      <td><b>${gCover.toFixed(1)}</b></td>
    </tr>
  `;

  return html;
}

/* ======================================================
   SHIPMENT & RECALL SUMMARY HTML
====================================================== */
function buildShipmentSummaryHtml(fcMap) {
  let gSale = 0;
  let gStock = 0;
  let gActual = 0;
  let gShip = 0;
  let gRecall = 0;

  let html = "";

  Object.values(fcMap).forEach(fc => {
    const drr = fc.totalSale / 30;

    gSale += fc.totalSale;
    gStock += fc.totalStock;
    gActual += fc.actualShip;
    gShip += fc.shipQty;
    gRecall += fc.recallQty;

    html += `
      <tr>
        <td>${fc.fc}</td>
        <td>${fc.totalStock}</td>
        <td>${fc.totalSale}</td>
        <td>${drr.toFixed(2)}</td>
        <td>${fc.actualShip}</td>
        <td class="ship-col">${fc.shipQty}</td>
        <td class="recall-col">${fc.recallQty}</td>
      </tr>
    `;
  });

  const gDrr = gSale / 30;

  html += `
    <tr class="grand-total">
      <td><b>Amazon All FC</b></td>
      <td><b>${gStock}</b></td>
      <td><b>${gSale}</b></td>
      <td><b>${gDrr.toFixed(2)}</b></td>
      <td><b>${gActual}</b></td>
      <td class="ship-col"><b>${gShip}</b></td>
      <td class="recall-col"><b>${gRecall}</b></td>
    </tr>
  `;

  return html;
}

/* ======================================================
   MAIN RENDER
====================================================== */
export function renderAmazonSummaries() {
  const container = document.getElementById("tab-content");
  const store = getAmazonStore();
  const rows = store?.rows || [];

  if (!rows.length) {
    container.innerHTML = `<div class="placeholder-row">No data</div>`;
    return;
  }

  const fcMap = buildFcMap(rows);

  container.innerHTML = `
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
          ${buildFcSummaryHtml(fcMap)}
        </tbody>
      </table>
    </section>

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
          ${buildShipmentSummaryHtml(fcMap)}
        </tbody>
      </table>
    </section>

    ${renderAmazonReport()}
  `;
}
