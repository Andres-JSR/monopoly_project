/**
 * Clase que representa un jugador en el juego de Monopoly.
 * 
 * Cada jugador tiene:
 * - Información personal (nick, país, color de ficha).
 * - Estado financiero (dinero).
 * - Posición en el tablero.
 * - Propiedades que posee.
 * - Estado de cárcel.
 */
export class Player {
  
  /**
   * Crea un nuevo jugador.
   * 
   * @param {Object} param0 - Datos del jugador.
   * @param {number} param0.id - Identificador único del jugador.
   * @param {string} param0.nick - Apodo/nombre del jugador.
   * @param {string} param0.country - Código de país del jugador (ej: "US", "ES").
   * @param {string} param0.tokenColor - Color de la ficha del jugador en formato hexadecimal.
   * @param {number} [param0.money=1500] - Dinero inicial del jugador.
   */
  constructor({ id, nick, country, tokenColor, money = 1500 }){
    /** @type {number} Identificador único del jugador */
    this.id = id; 
    
    /** @type {string} Apodo/nombre del jugador */
    this.nick = nick; 
    
    /** @type {string} Código de país (para mostrar bandera) */
    this.country = country;
    
    /** @type {string} Color de la ficha en formato hex (ej: "#ff0000") */
    this.tokenColor = tokenColor; 
    
    /** @type {number} Cantidad de dinero que posee el jugador */
    this.money = money;
    
    /** @type {number} Posición actual en el tablero (0-39 en tablero estándar) */
    this.position = 0; 
    
    /** @type {Set<number>} Set con los IDs de las propiedades que posee */
    this.properties = new Set();
    
    /** @type {boolean} Indica si el jugador está en la cárcel */
    this.inJail = false; 
    
    /** @type {number} Turnos restantes en la cárcel */
    this.jailTurns = 0;
  }

  /**
   * Hace que el jugador pague una cantidad de dinero.
   * 
   * @param {number} amount - Cantidad a pagar.
   * 
   * ⚠️ Nota: Este método no verifica si el jugador tiene suficiente dinero.
   * Es responsabilidad del código que lo llama hacer esa verificación.
   */
  pay(amount){ 
    this.money -= amount; 
  }

  /**
   * Hace que el jugador reciba una cantidad de dinero.
   * 
   * @param {number} amount - Cantidad a recibir.
   */
  receive(amount){ 
    this.money += amount; 
  }
}
