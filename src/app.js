import { renderHeader } from "./ui/header.js";
import { renderTabs } from "./ui/tabs.js";
import { loadAllData } from "./core/data-loader.js";
import {
  initProgress,
  updateProgress,
  completeProgress,
} from "./ui/progress.js";

/* ================= EXPORT ================= */
import { exportShipmentPlanner } from "./core/export.service.js";

/* ================= AMAZON ================= */
import { runAmazonEngine } from "./engines/amazon.engine.js";
import { setAmazonStore } from "./stores/amazon.store.js";
import { renderAmazonSummaries } from "./ui/amazon/amazon.summary.js";

/* ================= FLIPKART ================= */
import { runFlipkartEngine } from "./engines/flipkart.engine.js";
import { setFlipkartRows } from "./stores/flipkart.store.js";
import { renderFlipkartSummaries } from "./ui/flipkart/flipkart.summary.js";

/* ================= MYNTRA ================= */
import { runMyntraEngine } from "./engines/myntra.engine.js";
import { setMyntraRows } from "./stores/myntra.store.js";
import { renderMyntraSummaries } from "./ui/myntra/myntra.summary.js";

/* ================= SELLER ================= */
import { runSellerEngine } from "./engines/seller.engine.js";
import { setSellerRows } from "./stores/seller.store.js";
import { renderSellerReport } from "./ui/seller/seller.report.js";

/* ======================================================
   GLOBAL STATE
====================================================== */
let cachedData = null;
let uniware40Cap = 0;
let uniwareUsedByMPs = 0;

/* ======================================================
   APP INIT
====================================================== */
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
    uniwareUsedByMPs += amazonResult.uniwareUsed;

    renderAmazonSummaries();

    completeProgress();
  } catch (err) {
    console.error("❌ App initialization failed", err);
  }

  /* ================= EXPORT BUTTON ================= */
  const exportBtn = document.getElementById("export-btn");
  if (exportBtn) {
    exportBtn.addEventListener("click", () => {
      exportShipmentPlanner();
    });
  }
});

/* ======================================================
   TAB LOADERS (LOCKED)
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
    uniware40CapRemaining: uniware40Cap - uniwareUsedByMPs,
  });

  setFlipkartRows(flipkartResult.rows);
  uniwareUsedByMPs += flipkartResult.uniwareUsed;

  renderFlipkartSummaries();
}

export function loadMyntraTab() {
  const myntraResult = runMyntraEngine({
    sales: cachedData.sales,
    fcStock: cachedData.fcStock,
    uniwareStock: cachedData.uniwareStock,
    companyRemarks: cachedData.companyRemarks,
    uniware40CapRemaining: uniware40Cap - uniwareUsedByMPs,
  });

  setMyntraRows(myntraResult.rows);
  uniwareUsedByMPs += myntraResult.uniwareUsed;

  renderMyntraSummaries();
}

export function loadSellerTab() {
  const sellerResult = runSellerEngine({
    sales: cachedData.sales,
    uniwareStock: cachedData.uniwareStock,
    companyRemarks: cachedData.companyRemarks,
    uniware40CapRemaining: uniware40Cap - uniwareUsedByMPs,
  });

  setSellerRows(sellerResult.rows);

  const container = document.getElementById("tab-content");
  container.innerHTML = renderSellerReport();
}
