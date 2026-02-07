import { renderHeader } from "./ui/header.js";
import { renderTabs } from "./ui/tabs.js";
import { loadAllData } from "./core/data-loader.js";
import {
  initProgress,
  updateProgress,
  completeProgress,
} from "./ui/progress.js";

/* AMAZON */
import { runAmazonEngine } from "./engines/amazon.engine.js";
import { setAmazonStore } from "./stores/amazon.store.js";
import { renderAmazonSummaries } from "./ui/amazon/amazon.summary.js";

/* FLIPKART */
import { runFlipkartEngine } from "./engines/flipkart.engine.js";
import { setFlipkartRows } from "./stores/flipkart.store.js";
import { renderFlipkartSummaries } from "./ui/flipkart/flipkart.summary.js";

let cachedData = null;
let uniware40Cap = 0;

document.addEventListener("DOMContentLoaded", async () => {
  renderHeader();
  renderTabs();
  initProgress();

  try {
    cachedData = await loadAllData(updateProgress);

    /* GLOBAL UNIWARE 40% CAP (LOCKED) */
    const totalUniware = cachedData.uniwareStock.reduce(
      (s, u) => s + u.quantity,
      0
    );
    uniware40Cap = Math.floor(totalUniware * 0.4);

    /* ================= AMAZON (DEFAULT LOAD) ================= */
    const amazonResult = runAmazonEngine({
      sales: cachedData.sales,
      fcStock: cachedData.fcStock,
      uniwareStock: cachedData.uniwareStock,
      companyRemarks: cachedData.companyRemarks,
      uniware40CapRemaining: uniware40Cap,
    });

    setAmazonStore(amazonResult);
    renderAmazonSummaries();

    completeProgress();
  } catch (err) {
    console.error("❌ App initialization failed", err);
  }
});

/* ======================================================
   TAB SWITCH HANDLERS (CALLED FROM tabs.js)
====================================================== */

export function loadAmazonTab() {
  renderAmazonSummaries();
}

export function loadFlipkartTab() {
  const flipkartResult = runFlipkartEngine({
    sales: cachedData.sales,
    fcStock: cachedData.fcStock,
    uniwareStock: cachedData.uniwareStock,
    companyRemarks: cachedData.companyRemarks,
    uniware40CapRemaining: uniware40Cap,
  });

  setFlipkartRows(flipkartResult.rows);
  renderFlipkartSummaries();
}
