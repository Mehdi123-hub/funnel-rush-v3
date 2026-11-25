import { FLOORS, CARDS } from "./data.js";

// Raccourci de sélection par ID
const $ = (id) => document.getElementById(id);
let currentId = null;

// Affiche la liste des cartes groupées par étape du funnel
function renderList() {
  $("guide-groups").innerHTML = FLOORS.map((f) => {
    const items = CARDS.filter((c) => c.floor === f.id);
    if (!items.length) return "";
    return `
      <div class="stack">
        <span class="stage-chip" style="background:${f.color}">${f.name}</span>
        ${items.map((c) => `
          <button type="button" class="card-row-btn" style="--accent:${f.color}" data-id="${c.id}">
            <span>${c.name}</span>
            <span class="player-row" style="gap:8px">${c.level === 2 ? `<span class="detail-label" style="opacity:1">L2</span>` : ""}<span class="cost-badge">${c.cost}</span><span>&rsaquo;</span></span>
          </button>`).join("")}
      </div>`;
  }).join("");

  document.querySelectorAll("[data-id]").forEach((btn) => btn.addEventListener("click", () => openDetail(btn.dataset.id)));
}

// Affiche le détail d'une carte sélectionnée
function openDetail(id) {
  const c = CARDS.find((x) => x.id === id) || CARDS[0];
  currentId = c.id;
  const f = FLOORS.find((x) => x.id === c.floor) || FLOORS[0];
  $("guide-detail-content").innerHTML = `
    <div class="detail-card">
      <div class="top-bar"><span class="stage-chip" style="background:${f.color}">${f.name}</span><span class="cost-badge">${c.cost} coins</span></div>
      <h1 class="detail-title">${c.name}</h1>
      <div class="detail-block"><span class="detail-label">Effect</span><span>${c.effect}</span></div>
      <div class="detail-block"><span class="detail-label">What is it?</span><span>${c.definition}</span></div>
      <div class="detail-block"><span class="detail-label">Example</span><span>${c.example}</span></div>
    </div>`;
  $("guide-list-view").classList.add("hidden");
  $("guide-detail-view").classList.remove("hidden");
}

// Retour à la liste complète des cartes
$("btn-back-to-list").addEventListener("click", () => {
  $("guide-detail-view").classList.add("hidden");
  $("guide-list-view").classList.remove("hidden");
});

// Passage à la carte suivante dans la vue détail
$("btn-next-card").addEventListener("click", () => {
  const i = CARDS.findIndex((c) => c.id === currentId);
  openDetail(CARDS[(i + 1) % CARDS.length].id);
});

// Chargement initial de la liste
renderList();