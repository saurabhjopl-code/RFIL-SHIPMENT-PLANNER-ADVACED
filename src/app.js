import { renderHeader } from "./ui/header.js";
import { renderTabs } from "./ui/tabs.js";
import { loadAllData } from "./core/data-loader.js";
import {
  initProgress,
  updateProgress,
  completeProgress,
} from "./ui/progress.js";
import { runAmazonEngine } from "./engines/amazon.engine.js";
import { setAmazonStore } from "./stores/amazon.store.js";
import { renderAmazonSummaries } from "./ui/amazon/amazon.summary.js";

document.addEventListener("DOMContentLoaded", async () => {
  renderHeader();
  initProgress();
  renderTabs(); // initial shell only (no data)

  try {
    const data = await loadAllData(updateProgress);

    // 🔒 GLOBAL UNIWARE 40% CAP
    const totalUniware = data.uniwareStock.reduce(
      (s, u) => s + u.quantity,
      0
    );
    const uniware40Cap = Math.floor(totalUniware * 0.4);

    // 🔵 AMAZON ENGINE
    const amazonResult = runAmazonEngine({
      sales: data.sales,
      fcStock: data.fcStock,
      uniwareStock: data.uniwareStock,
      companyRemarks: data.companyRemarks,
      uniware40CapRemaining: uniware40Cap,
    });

    setAmazonStore(amazonResult);

    // ✅ 🔥 THIS IS THE MISSING LINE
    renderAmazonSummaries();

    console.group("🟦 AMAZON FINAL CONFIRMATION");
    console.log("Rows:", amazonResult.rows.length);
    console.groupEnd();

    completeProgress();
  } catch (err) {
    console.error("❌ Amazon calculation failed", err);
  }
});
