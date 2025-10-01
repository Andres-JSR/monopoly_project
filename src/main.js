// src/main.js
import { Api } from "./api.js";
import { Game } from "./model/Game.js";
import { Board } from "./model/Board.js";
import { Player } from "./model/Player.js";
import { Bank } from "./model/Bank.js";
import { Rules } from "./model/Rules.js";
import { Dice } from "./model/Dice.js";
import { TurnManager } from "./model/TurnManager.js";
import { Modals } from "./ui/Modals.js";
import { Renderer } from "./ui/Renderer.js";
import { Notifier } from "./ui/Notifier.js";

// ===== UI principal =====
const ui = new Renderer();
ui.modals = new Modals(document.getElementById("modalRoot"));

// Un único Notifier global (login + juego)
const notifier = new Notifier();

// ===== Ranking =====
async function loadRanking() {
  try {
    const rk = await Api.getRanking();
    const ul = document.getElementById("rankingList");
    if (!ul) return;
    ul.innerHTML = rk
      .map(
        (r) => `
        <li>
          <img src="https://flagsapi.com/${(
            r.country_code || "US"
          ).toUpperCase()}/flat/24.png" alt="" />
          <strong>${r.nick_name}</strong> — ${r.score}
        </li>`
      )
      .join("");
  } catch {
    notifier.warn("No se pudo cargar el ranking", "Ranking");
  }
}
function bindRanking() {
  const btn = document.getElementById("refreshRanking");
  if (btn) btn.onclick = () => loadRanking();
}

// ===== Bootstrap/Login =====
async function bootstrap() {
  // Elementos del LOGIN
  const startScreen = document.getElementById("startScreen");
  const gameRoot = document.getElementById("gameRoot");
  const gameFooter = document.getElementById("gameFooter");
  const playerCountSel = document.getElementById("playerCount");
  const playersForm = document.getElementById("playersForm");
  const startBtn = document.getElementById("startBtn");

  // Botón/target del hero (JUGAR) para desplazar al formulario
  const heroPlayBtn = document.getElementById("heroPlayBtn");
  const setupCard = document.getElementById("setupCard");
  if (heroPlayBtn && setupCard) {
    heroPlayBtn.onclick = () => {
      setupCard.scrollIntoView({ behavior: "smooth", block: "start" });
      setupCard.animate(
        [
          { boxShadow: "0 0 0px #0000" },
          { boxShadow: "0 0 0 6px #0004" },
          { boxShadow: "0 0 0px #0000" },
        ],
        { duration: 600, easing: "ease-out" }
      );
    };
  }

  // 1) Cargar países
  let countries = [];
  try {
    countries = await Api.getCountries();
  } catch {
    notifier.error("No se pudo cargar la lista de países.", "Backend");
    return;
  }

  // 2) Form según n jugadores (vacío si no han elegido)
  function drawForm() {
    const n = +playerCountSel.value;
    playersForm.innerHTML = "";
    if (!Number.isFinite(n) || n <= 0) return; // aún no eligieron
    for (let i = 0; i < n; i++) {
      const row = document.createElement("div");
      row.innerHTML = `
        <input placeholder="Nickname P${i + 1}" class="nick" />
        <select class="country">
          ${countries
            .map((c) => `<option value="${c.code}">${c.name}</option>`)
            .join("")}
        </select>
        <input type="color" class="color" value="#${(
          (Math.random() * 0xffffff) <<
          0
        )
          .toString(16)
          .padStart(6, "0")}" />
      `;
      playersForm.appendChild(row);
    }
  }
  playerCountSel.onchange = drawForm;
  drawForm();

  // 3) Iniciar juego
  startBtn.onclick = async () => {
    const inputs = [...playersForm.querySelectorAll(".nick")];
    const selects = [...playersForm.querySelectorAll(".country")];
    const colors = [...playersForm.querySelectorAll(".color")];

    if (inputs.length === 0) {
      notifier.warn("Primero selecciona el número de jugadores.", "Inicio");
      return;
    }

    const players = inputs.map(
      (inp, i) =>
        new Player({
          id: i + 1,
          nick: (inp.value || `P${i + 1}`).trim(),
          country: selects[i].value,
          tokenColor: colors[i].value,
        })
    );

    // Validación de nicks duplicados
    const nicks = players.map((p) => p.nick.toLowerCase());
    const dup = nicks.find((n, i) => n && nicks.indexOf(n) !== i);
    if (dup) {
      notifier.warn(`El nickname "${dup}" ya existe. Cámbialo.`, "Validación");
      return;
    }

    startBtn.disabled = true;

    // Registrar jugadores si hay endpoint disponible (no bloquea si falla)
    try {
      if (typeof Api.registerPlayers === "function") {
        await Api.registerPlayers(players);
      } else if (typeof Api.createPlayers === "function") {
        await Api.createPlayers(players);
      }
    } catch {
      notifier.warn("No se pudieron registrar algunos jugadores.", "Backend");
    }

    // Instanciar Game
    const game = new Game({
      board: new Board(Api),
      players,
      bank: new Bank(),
      rules: new Rules({ dice: new Dice() }),
      turnManager: new TurnManager(),
      ui: {
        mount: (g) => ui.mount(g),
        renderBoard: (b) => ui.renderBoard(b),
        renderPlayers: (p) => ui.renderPlayers(p),
        renderTokens: (p) => ui.renderTokens(p),
        bindControls: (g) => bindControls(g),
        refresh: () => {
          ui.renderPlayers(game.players);
          ui.renderBoard(game.board);
          ui.renderTokens(game.players);
        },
        toast: (m) => notifier.info(m),
        notifier,
        modals: ui.modals,
      },
      api: Api,
    });

    window.__game = game;

    // Mostrar juego
    startScreen?.classList.add("hidden");
    gameRoot?.classList.remove("hidden");
    gameFooter?.classList.remove("hidden");

    try {
      await game.init();
      ui.renderTokens(players);
      // 🔄 Actualiza ranking al arrancar la partida
      await loadRanking();
    } catch (e) {
      notifier.error(`No se pudo inicializar el juego: ${e.message}`, "Error");
      startScreen?.classList.remove("hidden");
      gameRoot?.classList.add("hidden");
      gameFooter?.classList.add("hidden");
    } finally {
      startBtn.disabled = false;
    }
  };

  bindRanking();
  // Mostrar ranking al abrir la página
  loadRanking();
}

// ===== Controles de juego =====
function bindControls(game) {
  document.getElementById("rollBtn").onclick = () => game.rollDiceOrManual();
  document.getElementById("rollManualBtn").onclick = () => {
    const d1 = +document.getElementById("manualD1").value;
    const d2 = +document.getElementById("manualD2").value;
    if (d1 >= 1 && d1 <= 6 && d2 >= 1 && d2 <= 6) {
      game.rollDiceOrManual({ d1, d2, total: d1 + d2 });
    } else {
      notifier.warn("Valores de dados inválidos (1–6).", "Dados");
    }
  };

  // Al finalizar, recargar ranking
  document.getElementById("endBtn").onclick = async () => {
    await game.endGameManual();
    await loadRanking();
  };
}

// auto-boot
bootstrap();
