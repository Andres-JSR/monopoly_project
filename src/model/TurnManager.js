/**
 * Clase que gestiona el sistema de turnos del juego de Monopoly.
 * 
 * Se encarga de:
 * - Mantener el orden de los jugadores.
 * - Determinar qué jugador tiene el turno actual.
 * - Avanzar al siguiente jugador.
 * - Manejar jugadores en la cárcel (saltar turnos).
 */
export class TurnManager {
  
  /**
   * Inicia el sistema de turnos con los jugadores dados.
   * 
   * @param {Player[]} players - Array de jugadores que participan en el juego.
   * 
   * 📋 El primer jugador (índice 0) será quien comience el juego.
   */
  start(players){ 
    /** @type {number} Índice del jugador actual */
    this.idx = 0; 
    
    /** @type {Player[]} Array de todos los jugadores */
    this.players = players; 
  }

  /**
   * Obtiene el jugador que tiene el turno actual.
   * 
   * @returns {Player} El jugador cuyo turno es actualmente.
   */
  currentPlayer(){ 
    return this.players[this.idx]; 
  }

  /**
   * Avanza al siguiente jugador en la secuencia de turnos.
   * 
   * 🏢 Lógica de la cárcel:
   * - Si un jugador está en la cárcel (`inJail = true`), se reducen sus `jailTurns`.
   * - Si `jailTurns` llega a 0 o menos, el jugador sale de la cárcel.
   * - Si el jugador sigue en la cárcel, se salta su turno y se pasa al siguiente.
   * 
   * 🔄 El sistema es circular: después del último jugador, vuelve al primero.
   */
  next(){
    do {
      this.idx = (this.idx + 1) % this.players.length;
      const p = this.currentPlayer();
      if (p.inJail){ p.jailTurns--; if (p.jailTurns<=0) p.inJail=false; else continue; }
      break;
    } while(true);
  }
}
