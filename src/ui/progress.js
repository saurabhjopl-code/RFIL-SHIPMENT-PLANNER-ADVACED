let progressBar;
let progressText;

export function initProgress() {
  const container = document.getElementById("loading-progress");

  container.innerHTML = `
    <div class="progress-wrapper">
      <div class="progress-text">Initializing…</div>
      <div class="progress-bar-bg">
        <div class="progress-bar-fill" style="width: 0%"></div>
      </div>
    </div>
  `;

  progressBar = container.querySelector(".progress-bar-fill");
  progressText = container.querySelector(".progress-text");
}

export function updateProgress(percent, message) {
  if (!progressBar) return;

  progressBar.style.width = `${percent}%`;
  progressText.textContent = message;
}

export function completeProgress() {
  const container = document.getElementById("loading-progress");
  if (!container) return;

  updateProgress(100, "Load complete");

  setTimeout(() => {
    container.style.display = "none";
  }, 600);
}
