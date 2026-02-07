export function renderHeader() {
  const header = document.getElementById("app-header");

  header.innerHTML = `
    <div class="header-container">

      <!-- LEFT: LOGO -->
      <div class="header-left">
        <img 
          src="/RFIL-SHIPMENT-PLANNER-ADVACED/src/assets/logo/your-logo.png" 
          alt="Company Logo" 
          class="app-logo"
        />
      </div>

      <!-- CENTER: TITLE -->
      <div class="header-center">
        <h1 class="app-title">Shipment Planner</h1>
        <p class="app-subtitle">
          Automated allocation for Amazon, Flipkart, Myntra & Seller
        </p>
      </div>

      <!-- RIGHT: EXPORT -->
      <div class="header-right">
        <button class="export-btn">
          Export
        </button>
      </div>

    </div>
  `;
}

