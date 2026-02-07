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

document.addEventListener("DOMContentLoaded", async () => {
  renderHeader();
  initProgress();
  renderTabs();

  try {
    const data = await loadAllData(updateProgress);

    // 🔒 GLOBAL UNIWARE 40% CAP
    const totalUniware = data.uniwareStock.reduce(
      (s, u) => s + u.quantity,
      0
    );
    const uniware40Cap = Math.floor(totalUniware * 0.4);

    const amazonResult = runAmazonEngine({
      sales: data.sales,
      fcStock: data.fcStock,
      uniwareStock: data.uniwareStock,
      companyRemarks: data.companyRemarks,
      uniware40CapRemaining: uniware40Cap,
    });

    setAmazonStore(amazonResult);

    console.group("🟦 AMAZON ENGINE VALIDATION");
    console.log("Total Amazon Rows:", amazonResult.rows.length);
    console.table(amazonResult.rows.slice(0, 10)); // 👈 show first 10 rows
    console.log("Uniware Used:", amazonResult.uniwareUsed);
    console.groupEnd();

    completeProgress();
  } catch (err) {
    console.error("❌ Amazon calculation failed", err);
  }
});
