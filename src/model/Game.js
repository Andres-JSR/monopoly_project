/**
 * Clase principal que controla el flujo del juego de Monopoly.
 * 
 * Actúa como el controlador central que coordina:
 * - El tablero y las casillas.
 * - Los jugadores y sus acciones.
 * - Las reglas del juego.
 * - El banco y las transacciones.
 * - La interfaz de usuario.
 * - La comunicación con la API externa.
 */
export class Game {
  
  /**
   * Crea una nueva instancia del juego.
   * 
   * @param {Object} param0 - Objeto con todas las dependencias del juego.
   * @param {Board} param0.board - El tablero de juego.
   * @param {Player[]} param0.players - Array de jugadores.
   * @param {Bank} param0.bank - El banco del juego.
   * @param {Rules} param0.rules - Las reglas del juego.
   * @param {TurnManager} param0.turnManager - Gestor de turnos.
   * @param {Object} param0.ui - Objeto con métodos de interfaz de usuario.
   * @param {Object} param0.api - API para comunicación externa.
   */
  constructor({ board, players, bank, rules, turnManager, ui, api }){
    /** @type {Board} Tablero del juego */
    this.board = board; 
    
    /** @type {Player[]} Array de jugadores */
    this.players = players; 
    
    /** @type {Bank} Banco para hipotecas */
    this.bank = bank; 
    
    /** @type {Rules} Reglas del juego */
    this.rules = rules;
    
    /** @type {TurnManager} Gestor de turnos */
    this.turns = turnManager; 
    
    /** @type {Object} Interfaz de usuario */
    this.ui = ui; 
    
    /** @type {Object} API externa */
    this.api = api; 
    
    /** @type {boolean} Indica si el juego ha terminado */
    this.ended = false;
  }

  /**
   * Inicializa el juego y prepara todo para comenzar a jugar.
   * 
   * 📋 Proceso de inicialización:
   * 1. Carga los datos del tablero desde la API.
   * 2. Monta la interfaz de usuario.
   * 3. Renderiza el tablero, jugadores y fichas.
   * 4. Inicia el sistema de turnos.
   * 5. Configura los controles de la UI.
   */
  async init(){
    await this.board.load();
    this.ui.mount(this);
    this.ui.renderBoard(this.board);
    this.ui.renderPlayers(this.players);
    this.ui.renderTokens(this.players);
    this.turns.start(this.players);
    this.ui.bindControls(this);
  }

  /**
   * Lanza los dados automáticamente o permite introducir valores manuales.
   * 
   * @param {Object|null} [values=null] - Valores manuales de los dados (para testing).
   * @param {number} values.d1 - Valor del primer dado.
   * @param {number} values.d2 - Valor del segundo dado.
   * @param {number} values.total - Suma de ambos dados.
   * 
   * 📋 Proceso:
   * 1. Lanza los dados (automático o manual).
   * 2. Muestra el resultado en la UI.
   * 3. Mueve al jugador actual según el resultado.
   */
  async rollDiceOrManual(values=null){
    const roll = values ?? this.rules.dice.rollTwo();
    // show last roll
    const lr = document.getElementById('lastRoll');
    if (lr) lr.textContent = `${roll.d1} + ${roll.d2} = ${roll.total}`;
    const current = this.turns.currentPlayer();
    await this.movePlayer(current, roll.total);
  }

  /**
   * Mueve un jugador por el tablero un número específico de pasos.
   * 
   * @param {Player} player - El jugador que se va a mover.
   * @param {number} steps - Número de pasos a avanzar.
   * 
   * 📋 Proceso de movimiento:
   * 1. Mueve al jugador paso a paso con animación (180ms entre pasos).
   * 2. Al llegar a la casilla destino, aplica las reglas de esa casilla.
   * 3. Actualiza la interfaz de usuario.
   * 4. Pasa el turno al siguiente jugador (si el juego no ha terminado).
   */
  async movePlayer(player, steps){
    let curr = player.position;
    for (let i=0; i<steps; i++){
      curr = this.board.advance(curr, 1);
      player.position = curr;
      this.ui.renderTokens(this.players);
      await new Promise(r => setTimeout(r, 180));
    }
    const tile = this.board.getTile(curr);
    await this.rules.resolveTile({ game: this, player, tile });
    this.ui.refresh();
    if (!this.ended) this.turns.next();
  }

  /**
   * Termina el juego manualmente y muestra los resultados finales.
   * 
   * 📊 Proceso de finalización:
   * 1. Calcula las posiciones finales usando las reglas.
   * 2. Marca el juego como terminado.
   * 3. Muestra el modal con la tabla de posiciones.
   * 4. Intenta registrar las puntuaciones en la API externa.
   * 
   * 💾 Registro de puntuaciones:
   * - Cada jugador se registra individualmente en la API.
   * - Los errores de conexión se registran en la consola pero no interrumpen el juego.
   */
  async endGameManual(){
    const standings = this.rules.computeStandings(this);
    this.ended = true;
    this.ui.modals.showStandings(standings);
    for (const s of standings){
      try { await this.api.postScore({ nick_name: s.nick, score: s.score, country_code: s.country }); }
      catch(e){ console.warn('No se pudo registrar score', e); }
    }
  }
}
