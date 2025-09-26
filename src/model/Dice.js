/**
 * Clase que simula un par de dados de 6 caras para el juego de Monopoly.
 * 
 * Proporciona métodos para:
 * - Lanzar un dado individual.
 * - Lanzar dos dados simultáneamente.
 */
export class Dice {

  /**
   * Lanza un dado individual de 6 caras.
   * 
   * @returns {number} Valor aleatorio entre 1 y 6 (inclusive).
   */
  roll(){ 
    return 1 + Math.floor(Math.random() * 6); 
  }

  /**
   * Lanza dos dados simultáneamente.
   * 
   * @returns {Object} Objeto con las propiedades:
   *   - `d1` {number}: Valor del primer dado (1-6).
   *   - `d2` {number}: Valor del segundo dado (1-6).
   *   - `total` {number}: Suma de ambos dados.
   * 
   * @example
   * const dice = new Dice();
   * const roll = dice.rollTwo();
   * console.log(`Dados: ${roll.d1} + ${roll.d2} = ${roll.total}`);
   * // Output: "Dados: 3 + 5 = 8"
   */
  rollTwo(){ 
    const d1 = this.roll(), d2 = this.roll(); 
    return { d1, d2, total: d1 + d2 }; 
  }
}
