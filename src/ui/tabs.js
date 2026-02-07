import { renderAmazonSummaries } from "./amazon/amazon.summary.js";

export function renderTabs() {
  const tabsContainer = document.getElementById("mp-tabs");
  const content = document.getElementById("tab-content");

  tabsContainer.innerHTML = `
    <div class="tabs-container">
      <button class="tab active" data-mp="amazon">Amazon IN</button>
      <button class="tab" data-mp="flipkart">Flipkart</button>
      <button class="tab" data-mp="myntra">Myntra</button>
      <button class="tab" data-mp="seller">SELLER</button>
    </div>
  `;

  // Default load
  renderAmazonSummaries();

  const tabs = tabsContainer.querySelectorAll(".tab");

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");

      const mp = tab.dataset.mp;

      if (mp === "amazon") {
        renderAmazonSummaries();
      } else {
        content.innerHTML = `
          <div class="placeholder">
            ${tab.textContent} UI will be added next
          </div>
        `;
      }
    });
  });
}
