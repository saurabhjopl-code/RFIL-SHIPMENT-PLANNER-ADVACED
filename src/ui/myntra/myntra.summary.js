import { getMyntraRows } from "../../stores/myntra.store.js";
import { renderMyntraReport } from "./myntra.report.js";
import { loadAllData } from "../../core/data-loader.js";

/* ======================================================
   BUILD MYNTRA FC MAP
====================================================== */
async function buildMyntraFcMap() {
  const rows = getMyntraRows();

  const data = await loadAllData(() => {});
  const myntraFcStock = data.fcStock.filter(
    r => r.mp === "MYNTRA"
  );

  const fcMap = {};

  // STOCK (master)
  myntraFcStock.forEach(r => {
    if (!fcMap[r.warehouseId]) {
      fcMap[r.warehouseId] = {
        fc: r.warehouseId,
        totalStock: 0,
        totalSale: 0,
        actualShip: 0,
        shipQty: 0,
        recallQty: 0,
      };
    }
    fcMap[r.warehouseId].totalStock += r.quantity;
  });

  // SALES + SHIPMENTS
  rows.forEach(r => {
    if (!fcMap[r.warehouseId]) {
      fcMap[r.warehouseId] = {
        fc: r.warehouseId,
        totalStock: 0,
        totalSale: 0,
        actualShip: 0,
        shipQty: 0,
        recallQty: 0,
      };
    }

    const fc = fcMap[r.warehouseId];
    fc.totalSale += r.saleQty;
    fc.actualShip += r.actualShipmentQty;
    fc.shipQty += r.shipmentQty;
    fc.recallQty += r.recallQty;
  });

  return fcMap;
}

/* ======================================================
   FC SUMMARY (SORT: TOTAL SALE ↓)
====================================================== */
function renderFcSummary(fcMap) {
  let gStock = 0;
  let gSale = 0;

  const rows = Object.values(fcMap)
    .sort((a, b) => b.totalSale - a.totalSale);

  let html = "";

  rows.forEach(fc => {
    const drr = fc.totalSale / 30;
    const cover = drr > 0 ? fc.totalStock / drr : 0;

    gStock += fc.totalStock;
    gSale += fc.totalSale;

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
      <td><b>Myntra All FC</b></td>
      <td><b>${gStock}</b></td>
      <td><b>${gSale}</b></td>
      <td><b>${gDrr.toFixed(2)}</b></td>
      <td><b>${gCover.toFixed(1)}</b></td>
    </tr>
  `;

  return html;
}

/* ======================================================
   SHIPMENT & RECALL SUMMARY (SORT: SHIP QTY ↓)
====================================================== */
function renderShipmentSummary(fcMap) {
  let gStock = 0;
  let gSale = 0;
  let gActual = 0;
  let gShip = 0;
  let gRecall = 0;

  const rows = Object.values(fcMap)
    .sort((a, b) => b.shipQty - a.shipQty);

  let html = "";

  rows.forEach(fc => {
    const drr = fc.totalSale / 30;

    gStock += fc.totalStock;
    gSale += fc.totalSale;
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
      <td><b>Myntra All FC</b></td>
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
export async function renderMyntraSummaries() {
  const container = document.getElementById("tab-content");
  const fcMap = await buildMyntraFcMap();

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
          ${renderFcSummary(fcMap)}
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
          ${renderShipmentSummary(fcMap)}
        </tbody>
      </table>
    </section>

    ${renderMyntraReport()}
  `;
}
