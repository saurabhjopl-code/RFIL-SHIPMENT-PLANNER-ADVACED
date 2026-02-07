import { renderHeader } from "./ui/header.js";
import { renderTabs } from "./ui/tabs.js";
import { loadAllData } from "./core/data-loader.js";
import {
  initProgress,
  updateProgress,
  completeProgress,
} from "./ui/progress.js";

document.addEventListener("DOMContentLoaded", async () => {
  renderHeader();
  initProgress();
  renderTabs();

  try {
    const data = await loadAllData(updateProgress);

    console.group("📦 RAW DATA LOADED");
    console.log("Sales:", data.sales.length);
    console.log("FC Stock:", data.fcStock.length);
    console.log("Uniware Stock:", data.uniwareStock.length);
    console.log("Company Remarks:", data.companyRemarks.length);
    console.groupEnd();

    completeProgress();
  } catch (error) {
    console.error("❌ Data loading failed", error);
  }
});
