import { Tile } from './Tile.js';

/**
 * Clase que representa una propiedad en el tablero de Monopoly.
 * Extiende la clase base {@link Tile}.
 * 
 * Una propiedad puede:
 * - Tener un dueño.
 * - Tener casas u hotel construidos.
 * - Ser hipotecada.
 * - Cobrar renta a otros jugadores que caigan en ella.
 */
export class Property extends Tile {

  /**
   * Crea una nueva instancia de Property.
   * 
   * @param {Object} param0 - Objeto con la información de la propiedad.
   * @param {number} param0.id - Identificador único de la propiedad.
   * @param {string} param0.name - Nombre de la propiedad.
   * @param {string} param0.color - Grupo de color al que pertenece.
   * @param {number} [param0.price=0] - Precio de compra de la propiedad.
   * @param {Object} [param0.rent] - Objeto con las diferentes rentas.
   * @param {number} [param0.rent.base=0] - Renta base sin casas ni hotel.
   * @param {number[]} [param0.rent.withHouse=[]] - Renta con 1, 2, 3 o 4 casas.
   * @param {number} [param0.rent.withHotel=0] - Renta con un hotel.
   * @param {number} [param0.mortgage=0] - Valor de hipoteca de la propiedad.
   */
  constructor({ id, name, color, price, rent, mortgage }) {
    super({ id, name, type: 'property', color });

    /** @type {number} Precio de compra de la propiedad */
    this.price = price ?? 0;

    /** @type {{ base:number, withHouse:number[], withHotel:number }} Renta según mejoras */
    this.rent = {
      base: rent?.base ?? 0,
      withHouse: rent?.withHouse ?? [],
      withHotel: rent?.withHotel ?? 0
    };

    /** @type {number} Valor de hipoteca */
    this.mortgageValue = mortgage ?? 0;

    /** @type {?number} ID del dueño de la propiedad (null si no tiene) */
    this.ownerId = null;

    /** @type {number} Cantidad de casas construidas en la propiedad */
    this.houses = 0;

    /** @type {boolean} Indica si la propiedad tiene un hotel */
    this.hotel = false;

    /** @type {boolean} Indica si la propiedad está hipotecada */
    this.mortgaged = false;
  }

  /**
   * Crea una instancia de Property a partir de un objeto JSON.
   * 
   * @param {Object} j - Datos de la propiedad en formato JSON.
   * @returns {Property} Nueva instancia de Property.
   */
  static fromJSON(j) {
    return new Property({
      id: j.id,
      name: j.name,
      color: j.color,
      price: j.price,
      rent: j.rent,
      mortgage: j.mortgage
    });
  }

  /**
   * Calcula la renta actual de la propiedad en función de su estado.
   * 
   * 📌 Reglas:
   * - Si está hipotecada → la renta es 0.
   * - Si tiene hotel → renta máxima (`rent.withHotel`).
   * - Si tiene casas → renta correspondiente según número de casas.
   * - Si no tiene mejoras → renta base (`rent.base`).
   * 
   * @returns {number} Valor de la renta que debe pagar un jugador al caer en esta propiedad.
   */
  getRent() {
    if (this.mortgaged) return 0;
    if (this.hotel) return this.rent.withHotel;
    if (this.houses >= 1) return this.rent.withHouse[this.houses - 1] ?? 0;
    return this.rent.base;
  }
}
