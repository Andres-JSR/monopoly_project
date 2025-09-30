/**
 * @fileoverview Punto de entrada principal de la aplicación Monopoly.
 *
 * Este archivo contiene:
 * - Configuración inicial de la aplicación.
 * - Lógica de creación del formulario de jugadores.
 * - Inicialización del juego.
 * - Vinculación de controles de usuario.
 * - Gestión del ranking de puntuaciones.
 *
 * @author Teban6515
 * @version 1.0.0
 */

import { Api } from "./api.js";
import { Bank } from "./model/Bank.js";
import { Board } from "./model/Board.js";
import { Dice } from "./model/Dice.js";
import { Game } from "./model/Game.js";
import { Player } from "./model/Player.js";
import { Rules } from "./model/Rules.js";
import { TurnManager } from "./model/TurnManager.js";
import { Modals } from "./ui/Modals.js";
import { Notifier } from "./ui/Notifier.js";
import { Renderer } from "./ui/Renderer.js";

// Inicialización de componentes UI principales
/** @type {Renderer} Renderizador principal de la interfaz */
const ui = new Renderer();

/** Configuración de modales en el contenedor designado */
ui.modals = new Modals(document.getElementById("modalRoot"));

/**
 * Configura la funcionalidad del ranking de puntuaciones.
 *
 * Vincula el botón de actualizar ranking para:
 * - Obtener las mejores puntuaciones desde la API.
 * - Renderizar la lista con banderas de países y puntuaciones.
 * - Mostrar la información en el elemento 'rankingList'.
 *
 * 🏆 Formato de cada entrada del ranking:
 * - Bandera del país (usando flagsapi.com).
 * - Nombre del jugador en negrita.
 * - Puntuación obtenida.
 */
function bindRanking() {
  document.getElementById("refreshRanking").onclick = async () => {
    const rk = await Api.getRanking();
    const ul = document.getElementById("rankingList");
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
  };
}

/**
 * Función principal de arranque que inicializa toda la aplicación.
 *
 * 🚀 Flujo de inicialización:
 * 1. Carga la lista de países desde la API.
 * 2. Configura el formulario dinámico de jugadores.
 * 3. Vincula el botón de inicio del juego.
 * 4. Configura el sistema de ranking.
 *
 * 👥 Gestión de jugadores:
 * - Permite seleccionar de 2 a N jugadores.
 * - Cada jugador tiene: nickname, país, y color de ficha.
 * - Genera colores aleatorios como valores por defecto.
 * - Crea nicknames automáticos si se dejan vacíos ("P1", "P2", etc.).
 *
 * 🎮 Inicio del juego:
 * - Crea instancias de todas las clases necesarias.
 * - Configura la interfaz de usuario.
 * - Expone el juego globalmente para debugging (`window.__game`).
 */
async function bootstrap() {
  const countries = await Api.getCountries();
  const playerCountSel = document.getElementById("playerCount");
  const playersForm = document.getElementById("playersForm");
  const notifier = new Notifier();
  

  /**
   * Función anidada que regenera dinámicamente el formulario de jugadores.
   *
   * 📋 Para cada jugador crea:
   * - Input de texto para el nickname (con placeholder automático).
   * - Select con todos los países disponibles.
   * - Input de color con valor hexadecimal aleatorio.
   *
   * 🎨 Generación de colores:
   * - Genera un número aleatorio de 0 a 0xFFFFFF.
   * - Lo convierte a hexadecimal y rellena con ceros a 6 dígitos.
   * - Resultado: colores completamente aleatorios para cada jugador.
   */
  function drawForm() {
    const n = +playerCountSel.value;
    playersForm.innerHTML = "";
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
          .padStart(6, "0")}" />`;
      playersForm.appendChild(row);
    }
  }
  playerCountSel.onchange = drawForm;
  drawForm();

  /**
   * Manejador del botón "Iniciar Juego".
   *
   * 🏗️ Proceso de creación del juego:
   * 1. Recopila datos del formulario (nicknames, países, colores).
   * 2. Crea instancias de Player con datos o valores por defecto.
   * 3. Instancia todas las clases del modelo de juego.
   * 4. Configura el objeto de interfaz con métodos del renderizador.
   * 5. Inicializa el juego y renderiza el estado inicial.
   *
   * 🔧 Configuración de UI:
   * - `mount`: Vincula el renderizador al juego.
   * - `renderBoard`: Dibuja el tablero.
   * - `renderPlayers`: Muestra información de jugadores.
   * - `renderTokens`: Posiciona fichas en el tablero.
   * - `bindControls`: Configura botones de control.
   * - `refresh`: Actualiza toda la interfaz.
   * - `toast`: Muestra mensajes de notificación.
   * - `modals`: Sistema de ventanas emergentes.
   *
   * 🌍 Debug global:
   * El juego se expone como `window.__game` para poder inspeccionarlo
   * desde las herramientas de desarrollador del navegador.
   */
  document.getElementById("startBtn").onclick = async () => {
    const inputs = [...playersForm.querySelectorAll(".nick")];
    const selects = [...playersForm.querySelectorAll(".country")];
    const colors = [...playersForm.querySelectorAll(".color")];
    const players = inputs.map(
      (inp, i) =>
        new Player({
          id: i + 1,
          nick: inp.value || `P${i + 1}`,
          country: selects[i].value,
          tokenColor: colors[i].value,
        })
    );

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
          // 👉 usa el Notifier para cualquier “toast” viejo que llames desde otros lados
        },
        toast: (m) => notifier.info(m),
        

        // 👉 expón el notifier para que Rules/TurnManager lo usen
        notifier,

        // Modales ya existentes
        modals: ui.modals,
      },
      api: Api,
    });

    window.__game = game;
    await game.init();

    ui.renderTokens(players);

    // Oculta la pantalla de inicio y muestra la interfaz del juego
    const header = document.querySelector(".app-header");
    if (header) header.style.display = "none";

    const boardWrap = document.querySelector(".board-wrap");
    if (boardWrap) boardWrap.style.marginTop = "0";
  };

  bindRanking();
}

/**
 * Configura los controles principales del juego una vez iniciado.
 *
 * 🎲 Botones vinculados:
 *
 * **Lanzar Dados Automático:**
 * - Ejecuta un lanzamiento aleatorio de dados.
 * - Mueve al jugador actual según el resultado.
 *
 * **Lanzar Dados Manual:**
 * - Permite introducir valores específicos para los dados.
 * - Útil para testing y debugging.
 * - Valida que ambos valores estén entre 1-6.
 *
 * **Terminar Juego:**
 * - Finaliza la partida inmediatamente.
 * - Calcula las posiciones finales.
 * - Muestra el ranking y registra puntuaciones.
 *
 * @param {Game} game - Instancia del juego a controlar.
 */
function bindControls(game) {
  document.getElementById("rollBtn").onclick = () => game.rollDiceOrManual();
  document.getElementById("rollManualBtn").onclick = () => {
    const d1 = +document.getElementById("manualD1").value;
    const d2 = +document.getElementById("manualD2").value;
    if (d1 >= 1 && d1 <= 6 && d2 >= 1 && d2 <= 6)
      game.rollDiceOrManual({ d1, d2, total: d1 + d2 });
  };
  document.getElementById("endBtn").onclick = () => game.endGameManual();
}

// 🚀 Inicialización automática de la aplicación
bootstrap();
