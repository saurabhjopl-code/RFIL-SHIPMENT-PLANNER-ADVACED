import { loadAmazonTab, loadFlipkartTab } from "../app.js";

export function renderTabs() {
  const tabsContainer = document.getElementById("mp-tabs");

  tabsContainer.innerHTML = `
    <div class="tabs-container">
      <button class="tab active" data-mp="amazon">Amazon IN</button>
      <button class="tab" data-mp="flipkart">Flipkart</button>
      <button class="tab" data-mp="myntra">Myntra</button>
      <button class="tab" data-mp="seller">SELLER</button>
    </div>
  `;

  tabsContainer.querySelectorAll(".tab").forEach(tab => {
    tab.addEventListener("click", () => {
      tabsContainer
        .querySelectorAll(".tab")
        .forEach(t => t.classList.remove("active"));

      tab.classList.add("active");

      const mp = tab.dataset.mp;

      if (mp === "amazon") {
        loadAmazonTab();
      } else if (mp === "flipkart") {
        loadFlipkartTab();
      } else {
        document.getElementById("tab-content").innerHTML = `
          <div class="placeholder-row">
            ${tab.textContent} will be enabled later
          </div>
        `;
      }
    });
  });
}
