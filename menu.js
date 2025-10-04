export function createMenu() {
  // Tab switching logic
  const tabButtons = document.querySelectorAll(".tab-button");
  const tabContents = document.querySelectorAll(".tab-content");

  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const tabId = btn.dataset.tab;
      tabButtons.forEach(b => b.classList.remove("active"));
      tabContents.forEach(c => c.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById("tab-" + tabId).classList.add("active");
    });
  });

  // Return the items panel for events.js to populate
  const itemsPanel = document.getElementById("tab-items");
  return itemsPanel;
}
