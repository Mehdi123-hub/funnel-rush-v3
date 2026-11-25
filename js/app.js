import { PLAYER_COLORS, LEVEL_CONFIG, TOTAL_ROUNDS, FUNNEL_FLOORS, EVENTS, computePlayerScore, rankPlayers } from "./data.js";

// Clé de sauvegarde locale pour conserver la partie en cours
const KEY = "sbs_game_v1";
// Raccourci de sélection par ID
const $ = (id) => document.getElementById(id);

// État par défaut avec le niveau 1 sélectionné
const defaultState = () => ({
  screen: "home",
  level: 1,
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

// Charge l'état sauvegardé dans localStorage
function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "null");
    const base = defaultState();
    if (!raw) return base;
    return {
      ...base,
      ...raw,
      level: raw.level === 2 ? 2 : 1,
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

// Sauvegarde l'état courant
const save = () => localStorage.setItem(KEY, JSON.stringify(state));

// Met à jour le badge de niveau dans l'en-tête
const setBadge = (el) => {
  if (!el) return;
  el.textContent = `LEVEL ${state.level}`;
  el.classList.toggle("is-blue", state.level === 1);
};

// Change d'écran et sauvegarde la progression
function go(screen) {
  state.screen = screen;
  save();
  render();
}

// Affiche l'écran actif et met à jour son contenu
function render() {
  ["home", "players", "round", "scores", "results"].forEach((s) => {
    $(`screen-${s}`).classList.toggle("hidden", state.screen !== s);
  });

  // Cartes de niveau sur l'accueil (bleu pour Level 1, rose pour Level 2)
  document.querySelectorAll(".lvl-card").forEach((c) => {
    const lvl = Number(c.dataset.level);
    const active = lvl === state.level;
    c.classList.toggle("is-sel-1", active && lvl === 1);
    c.classList.toggle("is-sel-2", active && lvl === 2);
  });
  $("btn-new-game").textContent = state.screen !== "home" ? "RESUME GAME" : "NEW GAME";

  // Écran joueurs
  if (state.screen === "players") {
    setBadge($("players-level-badge"));
    document.querySelectorAll(".count-btn").forEach((b) => b.classList.toggle("is-active", Number(b.dataset.count) === state.playerCount));
    $("player-inputs").innerHTML = "";
    for (let i = 0; i < state.playerCount; i++) {
      const col = PLAYER_COLORS[i];
      const row = document.createElement("div");
      row.className = "player-row";
      row.innerHTML = `<span class="dot" style="background:${col.hex}"></span><input class="name-inp" maxlength="20" placeholder="Player ${i + 1} (${col.name})" value="${state.playerNames[i] || ""}">`;
      row.querySelector("input").addEventListener("input", (e) => {
        state.playerNames[i] = e.target.value;
        $("players-error").classList.add("hidden");
        save();
      });
      $("player-inputs").append(row);
    }
  }

  // Écran manche
  if (state.screen === "round") {
    setBadge($("round-level-badge"));
    $("round-eyebrow").textContent = state.round === TOTAL_ROUNDS ? "FINAL ROUND" : "ROUND";
    $("round-counter").textContent = `${state.round}/${TOTAL_ROUNDS}`;
    $("round-bars").innerHTML = Array.from({ length: TOTAL_ROUNDS }, (_, i) => `<span class="r-bar ${i + 1 <= state.round ? "is-on" : ""}"></span>`).join("");

    if (!state.eventDrawn) {
      $("event-slot").innerHTML = `<div class="event-wait"><div class="q-circle">?</div><p class="page-sub">Draw this round's event card when everyone is ready.</p></div>`;
      $("btn-round-action").textContent = `ROUND ${state.round}: DRAW EVENT`;
    } else {
      const ev = EVENTS.find((e) => e.id === state.currentEventId) || EVENTS[0];
      const floor = FUNNEL_FLOORS[ev.floor] || { label: ev.floor, color: "#FF5FC8" };
      $("event-slot").innerHTML = `<div class="event-card"><div class="event-head" style="background:${floor.color}"><span>Event · ${floor.label}</span><span class="excl-badge">!</span></div><div class="event-body"><h2 class="event-name">${ev.title}</h2><p class="detail-label" style="opacity:1">${ev.effect}</p><p class="event-tip">Apply this effect during Round ${state.round}, then advance when everyone has played.</p></div></div>`;
      $("btn-round-action").textContent = state.round === TOTAL_ROUNDS ? "FINISH GAME & ENTER SCORES" : `NEXT ROUND (${state.round + 1}/${TOTAL_ROUNDS})`;
    }
  }

  // Écran scores finaux
  if (state.screen === "scores") {
    setBadge($("scores-level-badge"));
    $("scores-subtitle").textContent = state.level === 2
      ? "Count your tokens, enter the numbers, then tick completed missions (+5 pts)."
      : "Count your tokens and enter the numbers for each player.";
    $("score-cards").innerHTML = "";
    for (let i = 0; i < state.playerCount; i++) {
      const sc = state.scores[i];
      const name = (state.playerNames[i] || "").trim() || `Player ${i + 1}`;
      const card = document.createElement("div");
      card.className = "score-card";
      card.innerHTML = `
        <div class="score-head">
          <span class="player-row"><span class="dot" style="background:${PLAYER_COLORS[i].hex}"></span><strong>${name}</strong></span>
          ${state.level === 2 ? `<label class="mission-pill ${sc.mission ? "is-on" : ""}"><input type="checkbox" data-f="mission" ${sc.mission ? "checked" : ""}> MISSION +5</label>` : ""}
        </div>
        <div class="metrics-4">
          <div class="m-box"><label>MARKET TOKENS</label><input type="number" min="0" data-f="market" value="${sc.market}"></div>
          <div class="m-box"><label>INTEREST TOKENS</label><input type="number" min="0" data-f="interest" value="${sc.interest}"></div>
          <div class="m-box"><label>CONVERSION TOKENS</label><input type="number" min="0" data-f="conversion" value="${sc.conversion}"></div>
          <div class="m-box"><label>REMAINING COINS</label><input type="number" min="0" data-f="coins" value="${sc.coins}"></div>
        </div>
        <p class="err-msg hidden" data-err></p>`;
      card.querySelectorAll("input").forEach((inp) => {
        inp.addEventListener("input", () => {
          const f = inp.dataset.f;
          state.scores[i][f] = f === "mission" ? inp.checked : inp.value;
          if (f === "mission") inp.closest(".mission-pill")?.classList.toggle("is-on", inp.checked);
          card.querySelector("[data-err]").classList.add("hidden");
          save();
        });
      });
      $("score-cards").append(card);
    }
  }

  // Écran résultats finaux
  if (state.screen === "results") {
    setBadge($("results-level-badge"));
    const list = Array.from({ length: state.playerCount }, (_, i) => ({
      name: (state.playerNames[i] || "").trim() || `Player ${i + 1}`,
      color: PLAYER_COLORS[i],
      ...computePlayerScore(state.scores[i], state.level),
    }));
    const [winner, ...runners] = rankPlayers(list);
    if (!winner) return;
    $("winner-banner").innerHTML = `<div class="winner-card"><div><span class="detail-label" style="opacity:1">Winner</span><div class="winner-name"><span class="dot" style="background:${winner.color.hex}"></span>${winner.name}</div><div class="detail-label" style="opacity:1">Conversion: ${Math.round(winner.conversionRate * 100)}%${winner.hasConversionBonus ? " · +3 bonus" : ""}</div></div><div class="pts-ring">${winner.totalPoints}</div></div>`;
    $("runners-list").innerHTML = runners.map((p, idx) => `<div class="runner-card"><div class="player-row"><span class="rank-circle" style="background:${p.color.hex}">${idx + 2}</span><div><strong>${p.name}</strong><div class="detail-label">Conv. ${Math.round(p.conversionRate * 100)}%${p.hasConversionBonus ? " · +3 bonus" : ""}</div></div></div><strong>${p.totalPoints} PTS</strong></div>`).join("");
  }
}

// Ouvre une modale avec action de confirmation
function openModal(id, title, desc, fn) {
  onConfirm = fn;
  if (id === "modal-round") {
    $("modal-round-title").textContent = title;
    $("modal-round-desc").textContent = desc;
  }
  $(id).classList.remove("hidden");
}

// Ferme une modale
function closeModal(id) {
  $(id).classList.add("hidden");
  onConfirm = null;
}

// Sélection du niveau 1 ou 2
document.querySelectorAll(".lvl-card").forEach((c) => c.addEventListener("click", () => {
  state.level = Number(c.dataset.level) === 2 ? 2 : 1;
  save();
  render();
}));

// Reprend la partie en cours ou démarre une nouvelle sélection de joueurs
$("btn-new-game").addEventListener("click", () => {
  if (state.screen !== "home") return render();
  const coins = String(LEVEL_CONFIG[state.level].startingCoins);
  state.scores = Array.from({ length: 4 }, () => ({ market: "", interest: "", conversion: "", coins, mission: false }));
  go("players");
});

// Choix du nombre de joueurs
document.querySelectorAll(".count-btn").forEach((b) => b.addEventListener("click", () => {
  state.playerCount = Number(b.dataset.count);
  save();
  render();
}));

// Valide les noms et lance la manche 1
$("btn-start-game").addEventListener("click", () => {
  const names = [...$("player-inputs").querySelectorAll("input")].map((i) => i.value.trim());
  if (names.some((n) => !n)) {
    $("players-error").textContent = "Please enter a first name for every player.";
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

// Tire un événement ou passe à la manche suivante / aux scores
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
    openModal("modal-round", "Everyone played?", `Advance from Round ${state.round}/${TOTAL_ROUNDS} to Round ${state.round + 1}/${TOTAL_ROUNDS}?`, () => {
      state.round += 1;
      state.eventDrawn = false;
      state.currentEventId = null;
      save();
      render();
    });
  } else {
    openModal("modal-round", "Finish game?", "All 6 rounds are complete. Enter final scores now?", () => go("scores"));
  }
});

// Vérifie les scores saisis avant d'afficher les résultats
$("scores-form").addEventListener("submit", (e) => {
  e.preventDefault();
  let ok = true;
  for (let i = 0; i < state.playerCount; i++) {
    const sc = state.scores[i];
    const invalid = [sc.market, sc.interest, sc.conversion, sc.coins].some((v) => v === "" || Number(v) < 0 || Number.isNaN(Number(v)));
    const err = $("score-cards").children[i]?.querySelector("[data-err]");
    if (invalid) {
      ok = false;
      if (err) { err.textContent = "Enter a valid number for each field."; err.classList.remove("hidden"); }
    }
  }
  if (ok) go("results");
});

// Efface la partie terminée après confirmation
$("btn-results-new-game").addEventListener("click", () => openModal("modal-reset", "Erase game?", "Scores will be deleted from this device.", () => {
  localStorage.removeItem(KEY);
  state = defaultState();
  go("home");
}));

// Écouteurs des boutons des modales
$("modal-round-cancel").addEventListener("click", () => closeModal("modal-round"));
$("modal-round-confirm").addEventListener("click", () => { const fn = onConfirm; closeModal("modal-round"); fn?.(); });
$("modal-reset-cancel").addEventListener("click", () => closeModal("modal-reset"));
$("modal-reset-confirm").addEventListener("click", () => { const fn = onConfirm; closeModal("modal-reset"); fn?.(); });

// Premier rendu au chargement
render();