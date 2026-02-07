import { exportMp } from "../services/export.service.js";

export function renderHeader() {
  const header = document.getElementById("app-header");

  header.innerHTML = `
    <div class="header-container">

      <div class="header-left">
        <img
          src="assets/logo/logo.png"
          alt="Company Logo"
          class="app-logo"
        />
      </div>

      <div class="header-center">
        <h1 class="app-title">Shipment Planner</h1>
        <p class="app-subtitle">
          Automated allocation for Amazon, Flipkart, Myntra & Seller
        </p>
      </div>

      <div class="header-right">
        <button id="export-btn" class="export-btn">
          Export
        </button>
      </div>

    </div>
  `;

  document.getElementById("export-btn").onclick = () => {
    const activeTab =
      document.querySelector(".mp-tab.active")?.dataset?.mp;

    if (!activeTab || activeTab === "SELLER") {
      alert("Export available only for Amazon / Flipkart / Myntra");
      return;
    }

    exportMp(activeTab);
  };
}
