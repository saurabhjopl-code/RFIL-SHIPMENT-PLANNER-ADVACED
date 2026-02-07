import { getAmazonStore } from "../../stores/amazon.store.js";
import { renderAmazonReport } from "./amazon.report.js";

/* ======================================================
   HELPERS
====================================================== */

function buildFcMaps(rows) {
  const fcMap = {};
  const stockSeen = new Set(); // FC|SKU dedupe for stock

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

    // ✅ Sale is row-based
    fc.totalSale += r.saleQty;

    // ✅ Stock is FC+SKU unique
    const stockKey = `${r.warehouseId}__${r.sku}`;
    if (!stockSeen.has(stockKey)) {
      fc.totalStock += r.fcStock;
      stockSeen.add(stockKey);
    }

    // Shipment metrics
    fc.actualShip += r.actualShipmentQty;
    fc.shipQty += r.shipmentQty;
    fc.recallQty += r.recallQty;
  });

  return fcMap;
}

/* ======================================================
   FC SUMMARY
====================================================== */

function renderFcSummary(fcMap) {
  let grandSale = 0;
  let grandStock = 0;

  const rowsHtml = Object.values(fcMap)
    .map(fc => {
      const drr = fc.totalSale / 30;
      const cover = drr > 0 ? fc.totalStock / drr : 0;

      grandSale += fc.totalSale;
      grandStock += fc.totalStock;

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

  return (
    rowsHtml +
    `
    <tr class="grand-total">
      <td><b>Amazon All FC</b></td>
      <td><b>${grandStock}</b></td>
      <td><b>${grandSale}</b></td>
      <td><b>${grandDrr.toFixed(2)}</b></td>
      <td><b>${grandCover.toFixed(1)}</b></td>
    </tr>
  `
  );
}

/* ======================================================
   SHIPMENT & RECALL SUMMARY
====================================================== */

function renderShipmentSummary(fcMap) {
  let gSale = 0;
  let gStock = 0;
  let gActual = 0;
  let gShip = 0;
  let gRecall = 0;

  const rowsHtml = Object.values(fcMap)
    .map(fc => {
      const drr = fc.totalSale / 30;

      gSale += fc.totalSale;
      gStock += fc.totalStock;
      gActual += fc.actualShip;
      gShip += fc.shipQty;
      gRecall += fc.recallQty;

      return `
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
    })
    .join("");

  const gDrr = gSale / 30;

  return (
    rowsHtml +
    `
    <tr class="grand-total">
      <td><b>Amazon All FC</b></td>
      <td><b>${gStock}</b></td>
      <td><b>${gSale}</b></td>
      <td><b>${gDrr.toFixed(2)}</b></td>
      <td><b>${gActual}</b></td>
      <td class="ship-col"><b>${gShip}</b></td>
      <td class="recall-col"><b>${gRecall}</b></td>
    </tr>
  `
  );
}

/* ======================================================
   MAIN RENDER
====================================================== */

export function rende
