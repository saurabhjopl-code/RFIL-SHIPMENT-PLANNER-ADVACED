import { exportAllMPs } from "../services/export.service.js";

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

  const btn = document.getElementById("export-btn");
  btn.onclick = () => exportAllMPs();
}
