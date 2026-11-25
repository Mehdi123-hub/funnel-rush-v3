import { FLOORS, CARDS } from "./data.js";

const $ = (id) => document.getElementById(id);
let currentId = null;

function renderList() {
  $("guide-groups").innerHTML = FLOORS.map((f) => {
    const items = CARDS.filter((c) => c.floor === f.id);
    if (!items.length) return "";
    return `
      <div class="stack">
        <span class="stage-tag" style="background:${f.color}">${f.name}</span>
        ${items.map((c) => `
          <button type="button" class="card-btn" style="--stage:${f.color}" data-id="${c.id}">
            <span>${c.name}</span>
            <span class="card-meta">${c.level === 2 ? "<span>L2</span>" : ""}<span class="coin-pill">${c.cost}</span><span>&rsaquo;</span></span>
          </button>`).join("")}
      </div>`;
  }).join("");

  document.querySelectorAll("[data-id]").forEach((btn) => btn.addEventListener("click", () => openDetail(btn.dataset.id)));
}

function openDetail(id) {
  const c = CARDS.find((x) => x.id === id) || CARDS[0];
  currentId = c.id;
  const f = FLOORS.find((x) => x.id === c.floor) || FLOORS[0];
  $("guide-detail-content").innerHTML = `
    <div class="detail-box" style="border-color:${f.color}">
      <div class="bar"><span class="stage-tag" style="background:${f.color}">${f.name}</span><span class="coin-pill">${c.cost} coins</span></div>
      <h1 class="card-name">${c.name}</h1>
      <p class="body-copy"><strong>Effect:</strong> ${c.effect}</p>
      <p class="body-copy" style="margin-top:8px"><strong>What is it?</strong> ${c.definition}</p>
      <p class="mono" style="text-align:left;margin-top:8px">Example: ${c.example}</p>
    </div>`;
  $("guide-list-view").classList.add("hidden");
  $("guide-detail-view").classList.remove("hidden");
}

$("btn-back-to-list").addEventListener("click", () => {
  $("guide-detail-view").classList.add("hidden");
  $("guide-list-view").classList.remove("hidden");
});

$("btn-next-card").addEventListener("click", () => {
  const i = CARDS.findIndex((c) => c.id === currentId);
  openDetail(CARDS[(i + 1) % CARDS.length].id);
});

renderList();