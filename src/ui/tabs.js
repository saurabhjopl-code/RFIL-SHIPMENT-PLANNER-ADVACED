import { renderAmazonSummaries } from "./amazon/amazon.summary.js";

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

  // DEFAULT LOAD
  renderAmazonSummaries();

  tabsContainer.querySelectorAll(".tab").forEach(tab => {
    tab.addEventListener("click", () => {
      tabsContainer
        .querySelectorAll(".tab")
        .forEach(t => t.classList.remove("active"));

      tab.classList.add("active");

      if (tab.dataset.mp === "amazon") {
        renderAmazonSummaries();
      } else {
        document.getElementById("tab-content").innerHTML = `
          <div class="placeholder-row">
            ${tab.textContent} UI will be connected later
          </div>
        `;
      }
    });
  });
}
