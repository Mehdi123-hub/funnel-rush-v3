import { TOTAL_ROUNDS, TOTAL_TOKENS, PLAYER_COLORS, EVENTS } from "./data.js";

const STORAGE_KEY = "funnelRush.v3.game";

const $ = (id) => document.getElementById(id);

function escapeHTML(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[c]));
}

function loadGame() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}

function saveGame(game) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(game));
}

function clearGame() {
  localStorage.removeItem(STORAGE_KEY);
}

let draftLevel = 2;
let draftCount = 3;
let draftNames = ["", "", "", ""];

function showOnly(screenId) {
  ["screen-home", "screen-players", "screen-round", "screen-scores", "screen-results"]
    .forEach((id) => $(id).classList.toggle("hidden", id !== screenId));
}

function applyLevelBadge(el, level) {
  el.textContent = `Niveau ${level}`;
  el.classList.toggle("is-level-1", level === 1);
  el.classList.toggle("is-level-2", level === 2);
}

function pickNextEvent(level, lastEventId) {
  const pool = EVENTS.filter((ev) => ev.level <= level && ev.id !== lastEventId);
  const candidates = pool.length ? pool : EVENTS.filter((ev) => ev.level <= level);
  return candidates[Math.floor(Math.random() * candidates.length)].id;
}

/* --- ÉCRAN 1 : ACCUEIL --- */
function syncHomeSelection() {
  document.querySelectorAll(".level-card[data-level]").forEach((btn) => {
    const selected = Number(btn.dataset.level) === draftLevel;
    btn.classList.toggle("is-selected", selected);
    btn.setAttribute("aria-pressed", String(selected));
  });
}

document.querySelectorAll(".level-card[data-level]").forEach((btn) => {
  btn.addEventListener("click", () => {
    draftLevel = Number(btn.dataset.level);
    syncHomeSelection();
  });
});

$("btn-new-game").addEventListener("click", () => {
  draftCount = 3;
  renderPlayersScreen();
  showOnly("screen-players");
});

/* --- ÉCRAN 2 : JOUEURS --- */
function renderPlayersScreen() {
  applyLevelBadge($("players-level-badge"), draftLevel);
  document.querySelectorAll(".count-btn[data-count]").forEach((btn) => {
    btn.classList.toggle("is-active", Number(btn.dataset.count) === draftCount);
  });

  $("player-inputs").innerHTML = Array.from({ length: draftCount }, (_, idx) => {
    const color = PLAYER_COLORS[idx] || PLAYER_COLORS[0];
    const val = draftNames[idx] || "";
    return `
      <div class="player-name-row">
        <span class="token-swatch" style="background:${color}"></span>
        <input
          class="name-input"
          type="text"
          maxlength="24"
          data-player-index="${idx}"
          placeholder="Prénom"
          value="${escapeHTML(val)}"
          autocomplete="off"
        >
      </div>
    `;
  }).join("");

  $("players-error").classList.add("hidden");
  $("players-error").textContent = "";
}

document.querySelectorAll(".count-btn[data-count]").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".name-input[data-player-index]").forEach((inp) => {
      draftNames[Number(inp.dataset.playerIndex)] = inp.value;
    });
    draftCount = Number(btn.dataset.count);
    renderPlayersScreen();
  });
});

$("btn-start-game").addEventListener("click", () => {
  const inputs = Array.from(document.querySelectorAll(".name-input[data-player-index]"));
  const players = inputs.map((inp, idx) => ({
    name: inp.value.trim() || `Joueur ${idx + 1}`,
    color: PLAYER_COLORS[idx] || PLAYER_COLORS[0],
    loyalty: 0,
    conversion: 0,
    coins: 0,
    market: 0,
    mission: false
  }));

  const game = {
    level: draftLevel,
    round: 1,
    eventId: null,
    lastEventId: null,
    phase: "round",
    players
  };
  saveGame(game);
  render();
});

/* --- ÉCRAN 3 : MANCHE --- */
function getRoundButtonLabel(game) {
  if (!game.eventId) return `Manche ${game.round} : tirer l'événement`;
  if (game.round < TOTAL_ROUNDS) return "Manche suivante : tirer l'événement";
  return "Fin de partie : calculer les scores";
}

function renderRoundScreen(game) {
  applyLevelBadge($("round-level-badge"), game.level);

  const isFinalRound = game.round === TOTAL_ROUNDS;
  $("round-eyebrow").textContent = isFinalRound ? "Dernière manche" : "Manche";
  $("round-eyebrow").classList.toggle("is-final", isFinalRound);
  $("round-counter").textContent = `${game.round}/${TOTAL_ROUNDS}`;

  $("round-bars").innerHTML = Array.from({ length: TOTAL_ROUNDS }, (_, i) => {
    const done = i < game.round;
    const cls = ["round-bar"];
    if (done) cls.push(isFinalRound ? "is-final" : "is-done");
    return `<span class="${cls.join(" ")}"></span>`;
  }).join("");

  const currentEvent = EVENTS.find((e) => e.id === game.eventId);
  if (!currentEvent) {
    $("event-slot").innerHTML = `
      <div class="event-placeholder">
        <div class="q-badge">?</div>
        <p class="eyebrow" style="margin-bottom:8px;">Événement de la manche</p>
        <p style="font-weight:800;font-size:1.05rem;margin-bottom:6px;">L'événement de la manche apparaîtra ici.</p>
        <p style="color:var(--muted);font-size:0.9rem;margin:0;">Tout le monde est prêt ? Tirez le premier événement.</p>
      </div>
    `;
  } else {
    $("event-slot").innerHTML = `
      <article class="event-card-box">
        <div class="event-card-head">
          <span>Événement de la manche</span>
          <span class="event-excl">!</span>
        </div>
        <div class="event-card-body">
          <h2 class="event-title">${escapeHTML(currentEvent.name)}</h2>
          <p class="event-effect">${escapeHTML(currentEvent.effect)}</p>
          <p class="event-footer-tip">Lisez-le à voix haute. Il s'applique à tous les joueurs, pour cette manche seulement.</p>
        </div>
      </article>
    `;
  }

  const btn = $("btn-round-action");
  btn.textContent = getRoundButtonLabel(game);
  btn.classList.toggle("is-gold", Boolean(currentEvent) && isFinalRound);
}

let pendingRoundAction = null;

function openRoundModal(title, desc, onConfirm) {
  pendingRoundAction = onConfirm;
  $("modal-round-title").textContent = title;
  $("modal-round-desc").textContent = desc;
  $("modal-round").classList.remove("hidden");
}

function closeRoundModal() {
  pendingRoundAction = null;
  $("modal-round").classList.add("hidden");
}

$("modal-round-cancel").addEventListener("click", closeRoundModal);
$("modal-round-confirm").addEventListener("click", () => {
  const fn = pendingRoundAction;
  closeRoundModal();
  if (typeof fn === "function") fn();
});

$("btn-round-action").addEventListener("click", () => {
  const game = loadGame();
  if (!game) return;

  if (!game.eventId) {
    game.eventId = pickNextEvent(game.level, game.lastEventId);
    saveGame(game);
    renderRoundScreen(game);
    return;
  }

  if (game.round < TOTAL_ROUNDS) {
    const nextRoundNum = game.round + 1;
    openRoundModal(
      "Tout le monde a joué ?",
      `Un nouvel événement sera tiré pour la manche ${nextRoundNum}.`,
      () => {
        game.round = nextRoundNum;
        game.lastEventId = game.eventId;
        game.eventId = pickNextEvent(game.level, game.lastEventId);
        saveGame(game);
        renderRoundScreen(game);
      }
    );
  } else {
    openRoundModal(
      "Tout le monde a joué ?",
      "La manche 6 est terminée : passons à la saisie des scores.",
      () => {
        game.phase = "scores";
        saveGame(game);
        render();
      }
    );
  }
});

/* --- ÉCRAN 4 : SCORES --- */
function renderScoresScreen(game) {
  applyLevelBadge($("scores-level-badge"), game.level);
  $("scores-subtitle").textContent = game.level === 2
    ? "Comptez vos pièces sur le plateau, tapez les nombres, puis cochez les missions réussies."
    : "Comptez vos pièces sur le plateau et tapez les nombres pour chaque joueur.";

  $("score-cards").innerHTML = game.players.map((p, idx) => {
    const missionHtml = game.level === 2 ? `
      <label class="mission-toggle ${p.mission ? "is-checked" : ""}" data-mission-label="${idx}">
        <input type="checkbox" id="m-${idx}" ${p.mission ? "checked" : ""}>
        <span>Mission +5</span>
      </label>
    ` : "";

    return `
      <article class="score-card" id="score-card-${idx}">
        <div class="score-card-head">
          <div class="player-ident">
            <span class="token-swatch" style="background:${p.color}"></span>
            <span>${escapeHTML(p.name)}</span>
          </div>
          ${missionHtml}
        </div>
        <div class="metrics-grid">
          <div class="metric-box">
            <label for="fidelisation-${idx}">Fidélisation</label>
            <input type="number" min="0" max="30" step="1" id="fidelisation-${idx}" value="${p.loyalty || ""}" placeholder="-">
          </div>
          <div class="metric-box">
            <label for="conversion-${idx}">Conversion</label>
            <input type="number" min="0" max="30" step="1" id="conversion-${idx}" value="${p.conversion || ""}" placeholder="-">
          </div>
          <div class="metric-box is-gold">
            <label for="coins-${idx}">Pièces restantes</label>
            <input type="number" min="0" step="1" id="coins-${idx}" value="${p.coins || ""}" placeholder="-">
          </div>
          <div class="metric-box is-dark">
            <label for="market-${idx}">Jetons au marché</label>
            <input type="number" min="0" max="30" step="1" id="market-${idx}" value="${p.market || ""}" placeholder="-">
          </div>
        </div>
        <p id="score-err-${idx}" class="error-text hidden"></p>
      </article>
    `;
  }).join("");

  document.querySelectorAll('[data-mission-label]').forEach((lbl) => {
    const chk = lbl.querySelector('input[type="checkbox"]');
    chk.addEventListener("change", () => {
      lbl.classList.toggle("is-checked", chk.checked);
    });
  });
}

function parseNonNegInt(raw) {
  if (raw === "" || raw === null || raw === undefined) return 0;
  if (!/^\d+$/.test(String(raw).trim())) return NaN;
  return Number(raw);
}

$("scores-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const game = loadGame();
  if (!game) return;

  let hasError = false;
  const updatedPlayers = game.players.map((p, idx) => {
    const card = $(`score-card-${idx}`);
    const errEl = $(`score-err-${idx}`);
    card.classList.remove("has-error");
    errEl.classList.add("hidden");
    errEl.textContent = "";

    const loyalty = parseNonNegInt($(`fidelisation-${idx}`).value);
    const conversion = parseNonNegInt($(`conversion-${idx}`).value);
    const coins = parseNonNegInt($(`coins-${idx}`).value);
    const market = parseNonNegInt($(`market-${idx}`).value);
    const mission = game.level === 2 ? Boolean($(`m-${idx}`)?.checked) : false;

    let msg = "";
    if ([loyalty, conversion, coins, market].some((n) => Number.isNaN(n) || n < 0)) {
      msg = "Entrez uniquement des nombres entiers positifs ou nuls.";
    } else if (market > TOTAL_TOKENS) {
      msg = `Les jetons au marché ne peuvent pas dépasser ${TOTAL_TOKENS}.`;
    } else if (loyalty + conversion > TOTAL_TOKENS - market) {
      msg = `Fidélisation + Conversion (${loyalty + conversion}) dépasse les prospects entrés (${TOTAL_TOKENS - market}).`;
    }

    if (msg) {
      hasError = true;
      card.classList.add("has-error");
      errEl.textContent = msg;
      errEl.classList.remove("hidden");
    }

    return { ...p, loyalty, conversion, coins, market, mission };
  });

  if (hasError) return;

  game.players = updatedPlayers;
  game.phase = "results";
  saveGame(game);
  render();
});

/* --- ÉCRAN 5 : RÉSULTATS --- */
function computeStandings(game) {
  const rated = game.players.map((p) => {
    const entered = TOTAL_TOKENS - p.market;
    const customers = p.loyalty + p.conversion;
    const rate = entered > 0 ? customers / entered : 0;
    return { ...p, rate };
  });

  const bestRate = Math.max(...rated.map((p) => p.rate));

  return rated
    .map((p) => {
      const hasBonus = bestRate > 0 && Math.abs(p.rate - bestRate) < 1e-9;
      const bonus = hasBonus ? 3 : 0;
      const missionPts = game.level === 2 && p.mission ? 5 : 0;
      const pts = 3 * p.loyalty + 2 * p.conversion + Math.floor(p.coins / 5) + bonus + missionPts;
      return { ...p, hasBonus, bonus, missionPts, pts };
    })
    .sort((a, b) => b.pts - a.pts || b.rate - a.rate);
}

function renderResultsScreen(game) {
  applyLevelBadge($("results-level-badge"), game.level);
  const standings = computeStandings(game);
  const topScore = standings[0]?.pts ?? 0;
  const winners = standings.filter((p) => p.pts === topScore);
  const mainWinner = winners[0];

  const winnerLabel = winners.length > 1
    ? winners.map((w) => escapeHTML(w.name)).join(" & ")
    : escapeHTML(mainWinner.name);

  $("winner-banner").innerHTML = `
    <div>
      <div class="winner-eyebrow">${winners.length > 1 ? "Égalité · Gagnants" : "Gagnant"}</div>
      <div class="winner-name-row">
        <span class="winner-dot" style="background:${mainWinner.color}"></span>
        <span>${winnerLabel}</span>
      </div>
      <div class="winner-meta">
        Taux de conversion ${Math.round(mainWinner.rate * 100)} %
        ${mainWinner.missionPts ? `<br>Mission réussie +${mainWinner.missionPts}` : ""}
        ${mainWinner.hasBonus ? `<br>Meilleur taux +${mainWinner.bonus}` : ""}
      </div>
    </div>
    <div class="score-coin">
      <strong>${mainWinner.pts}</strong>
      <span>POINTS</span>
    </div>
  `;

  $("runners-list").innerHTML = standings.slice(1).map((p, idx) => `
    <article class="runner-card runner-up-card">
      <div style="display:flex;align-items:center;gap:12px;">
        <span class="rank-badge" style="background:${p.color}">${idx + 2}</span>
        <div>
          <div class="runner-title">${escapeHTML(p.name)}</div>
          <div class="runner-sub">
            Fidélisation ${p.loyalty} · Conversion ${p.conversion} · Pièces ${p.coins}
            ${p.missionPts ? " · Mission +5" : ""}
            ${p.hasBonus ? " · Bonus +3" : ""}
          </div>
        </div>
      </div>
      <div class="runner-pts">${p.pts} PTS</div>
    </article>
  `).join("");
}

/* --- MODALE EFFACER LA PARTIE --- */
function openResetModal() {
  $("modal-reset").classList.remove("hidden");
}

function closeResetModal() {
  $("modal-reset").classList.add("hidden");
}

$("btn-results-new-game").addEventListener("click", openResetModal);
$("modal-reset-cancel").addEventListener("click", closeResetModal);
$("modal-reset-confirm").addEventListener("click", () => {
  closeResetModal();
  clearGame();
  draftNames = ["", "", "", ""];
  render();
});

function render() {
  const game = loadGame();
  if (!game) {
    syncHomeSelection();
    showOnly("screen-home");
    return;
  }
  if (game.phase === "scores") {
    renderScoresScreen(game);
    showOnly("screen-scores");
    return;
  }
  if (game.phase === "results") {
    renderResultsScreen(game);
    showOnly("screen-results");
    return;
  }
  renderRoundScreen(game);
  showOnly("screen-round");
}

render();