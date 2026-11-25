import { PLAYER_COLORS, LEVEL_CONFIG, TOTAL_ROUNDS, FUNNEL_FLOORS, EVENTS, computePlayerScore, rankPlayers } from "./data.js";

const KEY = "sbs_game_v1";
const $ = (id) => document.getElementById(id);

const defaultState = () => ({
  screen: "home",
  level: 2,
  playerCount: 3,
  playerNames: ["", "", "", ""],
  round: 1,
  eventDrawn: false,
  drawnEventIds: [],
  currentEventId: null,
  scores: Array.from({ length: 4 }, () => ({ market: "", interest: "", conversion: "", coins: "", mission: false })),
});

let state = load();
let onConfirm = null;

function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "null");
    const base = defaultState();
    if (!raw) return base;
    return {
      ...base,
      ...raw,
      level: raw.level === 1 ? 1 : 2,
      playerCount: [2, 3, 4].includes(raw.playerCount) ? raw.playerCount : 3,
      playerNames: [0, 1, 2, 3].map((i) => String(raw.playerNames?.[i] ?? "")),
      round: Math.min(TOTAL_ROUNDS, Math.max(1, Number(raw.round) || 1)),
      drawnEventIds: Array.isArray(raw.drawnEventIds) ? raw.drawnEventIds : [],
      scores: [0, 1, 2, 3].map((i) => ({ ...base.scores[i], ...(raw.scores?.[i] || {}) })),
    };
  } catch {
    return defaultState();
  }
}

const save = () => localStorage.setItem(KEY, JSON.stringify(state));
const setBadge = (el) => { if (el) el.textContent = `L${state.level}`; };

function go(screen) {
  state.screen = screen;
  save();
  render();
}

function render() {
  ["home", "players", "round", "scores", "results"].forEach((s) => {
    $(`screen-${s}`).classList.toggle("hidden", state.screen !== s);
  });

  document.querySelectorAll(".lvl-btn").forEach((b) => {
    b.classList.toggle("is-on", Number(b.dataset.level) === state.level);
  });
  $("btn-new-game").textContent = state.screen !== "home" ? "Resume game" : "New game";

  if (state.screen === "players") {
    setBadge($("players-level-badge"));
    document.querySelectorAll(".seg-btn").forEach((b) => b.classList.toggle("is-on", Number(b.dataset.count) === state.playerCount));
    $("player-inputs").innerHTML = "";
    for (let i = 0; i < state.playerCount; i++) {
      const row = document.createElement("div");
      row.className = "player-row";
      row.innerHTML = `<span class="dot" style="background:${PLAYER_COLORS[i].hex}"></span><input class="inp" maxlength="20" placeholder="Player ${i + 1}" value="${state.playerNames[i] || ""}">`;
      row.querySelector("input").addEventListener("input", (e) => {
        state.playerNames[i] = e.target.value;
        $("players-error").classList.add("hidden");
        save();
      });
      $("player-inputs").append(row);
    }
  }

  if (state.screen === "round") {
    setBadge($("round-level-badge"));
    $("round-eyebrow").textContent = state.round === TOTAL_ROUNDS ? "FINAL ROUND" : "ROUND";
    $("round-counter").textContent = `${state.round}/${TOTAL_ROUNDS}`;
    $("round-bars").innerHTML = Array.from({ length: TOTAL_ROUNDS }, (_, i) => `<span class="bar-seg ${i + 1 <= state.round ? "is-on" : ""}"></span>`).join("");

    if (!state.eventDrawn) {
      $("event-slot").innerHTML = `<div class="event-box"><p class="body-copy">Draw the event for round ${state.round}.</p></div>`;
      $("btn-round-action").textContent = "Draw event";
    } else {
      const ev = EVENTS.find((e) => e.id === state.currentEventId) || EVENTS[0];
      const floor = FUNNEL_FLOORS[ev.floor]?.label || "";
      $("event-slot").innerHTML = `<div class="event-box"><span class="stage-tag" style="background:${FUNNEL_FLOORS[ev.floor]?.color || "#FF5FC8"}">${floor}</span><h2 class="event-title">${ev.title}</h2><p class="body-copy">${ev.effect}</p></div>`;
      $("btn-round-action").textContent = state.round === TOTAL_ROUNDS ? "Enter scores" : `Next round (${state.round + 1}/${TOTAL_ROUNDS})`;
    }
  }

  if (state.screen === "scores") {
    setBadge($("scores-level-badge"));
    $("score-cards").innerHTML = "";
    for (let i = 0; i < state.playerCount; i++) {
      const sc = state.scores[i];
      const name = (state.playerNames[i] || "").trim() || `Player ${i + 1}`;
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <div class="bar"><span class="player-row" style="padding:0;background:none"><span class="dot" style="background:${PLAYER_COLORS[i].hex}"></span><strong>${name}</strong></span>${state.level === 2 ? `<label class="mono"><input type="checkbox" data-f="mission" ${sc.mission ? "checked" : ""}> Mission +5</label>` : ""}</div>
        <div class="grid-2">
          <div class="field"><label>Market</label><input type="number" min="0" data-f="market" value="${sc.market}"></div>
          <div class="field"><label>Interest</label><input type="number" min="0" data-f="interest" value="${sc.interest}"></div>
          <div class="field"><label>Conversion</label><input type="number" min="0" data-f="conversion" value="${sc.conversion}"></div>
          <div class="field"><label>Coins</label><input type="number" min="0" data-f="coins" value="${sc.coins}"></div>
        </div>
        <p class="err hidden" data-err></p>`;
      card.querySelectorAll("input").forEach((inp) => {
        inp.addEventListener("input", () => {
          const f = inp.dataset.f;
          state.scores[i][f] = f === "mission" ? inp.checked : inp.value;
          card.querySelector("[data-err]").classList.add("hidden");
          save();
        });
      });
      $("score-cards").append(card);
    }
  }

  if (state.screen === "results") {
    setBadge($("results-level-badge"));
    const list = Array.from({ length: state.playerCount }, (_, i) => ({
      name: (state.playerNames[i] || "").trim() || `Player ${i + 1}`,
      color: PLAYER_COLORS[i],
      ...computePlayerScore(state.scores[i], state.level),
    }));
    const [winner, ...runners] = rankPlayers(list);
    if (!winner) return;
    $("winner-banner").innerHTML = `<div class="winner-box"><div><span class="mono">WINNER</span><div class="event-title" style="margin:2px 0"><span class="dot" style="display:inline-block;vertical-align:middle;margin-right:8px;background:${winner.color.hex}"></span>${winner.name}</div><div class="mono">Conv. ${Math.round(winner.conversionRate * 100)}%${winner.hasConversionBonus ? " · +3" : ""}</div></div><div class="pts-badge">${winner.totalPoints} pts</div></div>`;
    $("runners-list").innerHTML = runners.map((p, idx) => `<div class="runner-box"><span><strong style="margin-right:8px">${idx + 2}.</strong>${p.name}</span><span class="pts-badge" style="font-size:1.1rem">${p.totalPoints} pts</span></div>`).join("");
  }
}

function openModal(id, title, desc, fn) {
  onConfirm = fn;
  if (id === "modal-round") {
    $("modal-round-title").textContent = title;
    $("modal-round-desc").textContent = desc;
  }
  $(id).classList.remove("hidden");
}

function closeModal(id) {
  $(id).classList.add("hidden");
  onConfirm = null;
}

document.querySelectorAll(".lvl-btn").forEach((b) => b.addEventListener("click", () => {
  state.level = Number(b.dataset.level) === 1 ? 1 : 2;
  save();
  render();
}));

$("btn-new-game").addEventListener("click", () => {
  if (state.screen !== "home") return render();
  const coins = String(LEVEL_CONFIG[state.level].startingCoins);
  state.scores = Array.from({ length: 4 }, () => ({ market: "", interest: "", conversion: "", coins, mission: false }));
  go("players");
});

document.querySelectorAll(".seg-btn").forEach((b) => b.addEventListener("click", () => {
  state.playerCount = Number(b.dataset.count);
  save();
  render();
}));

$("btn-start-game").addEventListener("click", () => {
  const names = [...$("player-inputs").querySelectorAll("input")].map((i) => i.value.trim());
  if (names.some((n) => !n)) {
    $("players-error").textContent = "Enter every player name.";
    $("players-error").classList.remove("hidden");
    return;
  }
  names.forEach((n, i) => (state.playerNames[i] = n));
  state.round = 1;
  state.eventDrawn = false;
  state.drawnEventIds = [];
  state.currentEventId = null;
  go("round");
});

$("btn-round-action").addEventListener("click", () => {
  if (!state.eventDrawn) {
    const pool = EVENTS.filter((e) => !state.drawnEventIds.includes(e.id));
    const chosen = (pool.length ? pool : EVENTS)[Math.floor(Math.random() * (pool.length || EVENTS.length))];
    state.currentEventId = chosen.id;
    state.eventDrawn = true;
    if (!state.drawnEventIds.includes(chosen.id)) state.drawnEventIds.push(chosen.id);
    save();
    return render();
  }
  if (state.round < TOTAL_ROUNDS) {
    openModal("modal-round", "Next round?", `Move to round ${state.round + 1}/${TOTAL_ROUNDS}?`, () => {
      state.round += 1;
      state.eventDrawn = false;
      state.currentEventId = null;
      save();
      render();
    });
  } else {
    openModal("modal-round", "Finish game?", "Enter final scores?", () => go("scores"));
  }
});

$("scores-form").addEventListener("submit", (e) => {
  e.preventDefault();
  let ok = true;
  for (let i = 0; i < state.playerCount; i++) {
    const sc = state.scores[i];
    const invalid = [sc.market, sc.interest, sc.conversion, sc.coins].some((v) => v === "" || Number(v) < 0 || Number.isNaN(Number(v)));
    const err = $("score-cards").children[i]?.querySelector("[data-err]");
    if (invalid) {
      ok = false;
      if (err) { err.textContent = "Enter valid numbers."; err.classList.remove("hidden"); }
    }
  }
  if (ok) go("results");
});

$("btn-results-new-game").addEventListener("click", () => openModal("modal-reset", "Erase game?", "", () => {
  localStorage.removeItem(KEY);
  state = defaultState();
  go("home");
}));

$("modal-round-cancel").addEventListener("click", () => closeModal("modal-round"));
$("modal-round-confirm").addEventListener("click", () => { const fn = onConfirm; closeModal("modal-round"); fn?.(); });
$("modal-reset-cancel").addEventListener("click", () => closeModal("modal-reset"));
$("modal-reset-confirm").addEventListener("click", () => { const fn = onConfirm; closeModal("modal-reset"); fn?.(); });

render();