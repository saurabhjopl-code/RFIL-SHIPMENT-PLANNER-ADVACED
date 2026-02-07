import { renderHeader } from "./ui/header.js";
import { renderTabs } from "./ui/tabs.js";
import { loadAllData } from "./core/data-loader.js";

document.addEventListener("DOMContentLoaded", async () => {
  renderHeader();
  renderTabs();

  try {
    const data = await loadAllData();

    console.group("📦 RAW DATA LOADED");
    console.log("Sales (30D):", data.sales);
    console.log("FC Stock:", data.fcStock);
    console.log("Uniware Stock:", data.uniwareStock);
    console.log("Company Remarks:", data.companyRemarks);
    console.groupEnd();

    // DO NOT USE DATA YET
    // This is verification only

  } catch (error) {
    console.error("❌ Data loading failed", error);
  }
});
