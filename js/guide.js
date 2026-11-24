import { FLOORS, CARDS } from "./data.js";

let activeFloor = "all";

function escapeHTML(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[c]));
}

function renderFilters() {
  const container = document.getElementById("guide-filters");
  const items = [{ id: "all", name: "Toutes" }, ...FLOORS];
  container.innerHTML = items.map((f) => `
    <button type="button" class="filter-pill ${activeFloor === f.id ? "is-active" : ""}" data-floor="${f.id}">
      ${escapeHTML(f.name)}
    </button>
  `).join("");

  container.querySelectorAll("[data-floor]").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeFloor = btn.dataset.floor;
      renderFilters();
      renderCards();
    });
  });
}

function renderCards() {
  const list = document.getElementById("guide-list");
  const floorMap = Object.fromEntries(FLOORS.map((f) => [f.id, f]));
  const filtered = activeFloor === "all"
    ? CARDS
    : CARDS.filter((c) => c.floor === activeFloor);

  list.innerHTML = filtered.map((card) => {
    const fl = floorMap[card.floor] || { name: card.floor, color: "#ebe7fb" };
    return `
      <article class="guide-card" id="${escapeHTML(card.id)}">
        <div class="guide-card-top">
          <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
            <span class="floor-tag" style="background:${fl.color}">${escapeHTML(fl.name)}</span>
            ${card.level === 2 ? `<span class="lvl2-tag">Niveau 2</span>` : ""}
          </div>
          <span class="cost-tag">Coût : ${card.cost}</span>
        </div>
        <h2 style="font-size:1.15rem;font-weight:900;margin-bottom:6px;">${escapeHTML(card.name)}</h2>
        <p style="font-weight:700;margin-bottom:8px;">${escapeHTML(card.effect)}</p>
        <p style="color:var(--muted);font-size:0.9rem;margin-bottom:8px;">${escapeHTML(card.definition)}</p>
        <p style="font-size:0.84rem;margin:0;color:var(--ink);"><strong>Exemple :</strong> ${escapeHTML(card.example)}</p>
      </article>
    `;
  }).join("");
}

renderFilters();
renderCards();