/**
 * Clase que representa el Banco en el juego de Monopoly.
 * 
 * El banco gestiona las hipotecas de las propiedades:
 * - Permite hipotecar una propiedad para obtener dinero.
 * - Permite levantar (redimir) una hipoteca pagando un costo adicional.
 */


export class Bank {
   /**
   * Hipoteca una propiedad y entrega el valor de hipoteca al jugador.
   *
   * @param {Object} prop - La propiedad que se desea hipotecar.
   * @param {Object} player - El jugador que solicita la hipoteca.
   * @returns {boolean} - `true` si la hipoteca se realizó correctamente, `false` si no se cumplen las condiciones.
   * 
   * 📌 Condiciones:
   * - El jugador debe ser el dueño de la propiedad (`prop.ownerId === player.id`).
   * - La propiedad no debe estar ya hipotecada.
   * 
   * 📝 Efectos:
   * - El jugador recibe el valor de hipoteca (`prop.mortgageValue`).
   * - La propiedad se marca como hipotecada (`prop.mortgaged = true`).
   */

  payMortgage(prop, player){
    if (prop.ownerId !== player.id || prop.mortgaged) return false;
    player.receive(prop.mortgageValue);
    prop.mortgaged = true; 
    return true;
  }

  /**
   * Levanta (redime) la hipoteca de una propiedad pagando al banco.
   *
   * @param {Object} prop - La propiedad hipotecada que se desea liberar.
   * @param {Object} player - El jugador que quiere levantar la hipoteca.
   * @returns {boolean} - `true` si la operación fue exitosa, `false` en caso contrario.
   * 
   * 📌 Condiciones:
   * - El jugador debe ser el dueño de la propiedad (`prop.ownerId === player.id`).
   * - La propiedad debe estar hipotecada (`prop.mortgaged === true`).
   * - El jugador debe tener suficiente dinero para pagar el costo.
   * 
   * 💰 Costo:
   * - El costo es el valor de hipoteca más un 10% de interés.
   *   `cost = ceil(prop.mortgageValue * 1.10)`
   * 
   * 📝 Efectos:
   * - El jugador paga el costo al banco (`player.pay(cost)`).
   * - La propiedad deja de estar hipotecada (`prop.mortgaged = false`).
   */
  redeemMortgage(prop, player){
    if (prop.ownerId !== player.id || !prop.mortgaged) return false;
    const cost = Math.ceil(prop.mortgageValue * 1.10);
    if (player.money < cost) return false;
    player.pay(cost); prop.mortgaged = false; return true;
  }
}
