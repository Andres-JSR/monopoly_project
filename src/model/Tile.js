/**
 * Clase base que representa una casilla (Tile) en el tablero de Monopoly.
 * 
 * Cada casilla del tablero (propiedades, impuestos, cárcel, estaciones, etc.)
 * hereda de esta clase. Define los atributos comunes a todas las casillas.
 */
export class Tile {

  /**
   * Crea una nueva instancia de Tile.
   * 
   * @param {Object} param0 - Objeto con los datos de la casilla.
   * @param {number} param0.id - Identificador único de la casilla dentro del tablero.
   * @param {string} param0.name - Nombre de la casilla (ej: "Avenida Mediterránea", "Cárcel").
   * @param {string} param0.type - Tipo de casilla (ej: "property", "tax", "chance", "community", "go", etc.).
   * @param {number} [param0.value=0] - Valor asociado a la casilla (ej: impuestos a pagar).
   * @param {string|null} [param0.color=null] - Color del grupo (si aplica, ej: propiedades de color).
   */
  constructor({ id, name, type, value, color }) {
    /** @type {number} Identificador único de la casilla */
    this.id = id;

    /** @type {string} Nombre de la casilla */
    this.name = name;

    /** @type {string} Tipo de casilla (ej: propiedad, impuesto, sorpresa, etc.) */
    this.type = type;

    /** @type {number} Valor asociado a la casilla (ej: monto de impuestos, precio especial, etc.) */
    this.value = value ?? 0;

    /** @type {string|null} Color de la casilla si es propiedad; null en otros casos */
    this.color = color ?? null;
  }

  /**
   * Crea una instancia de Tile a partir de un objeto JSON.
   * 
   * @param {Object} j - Objeto con la información de la casilla en formato JSON.
   * @param {number} j.id - ID de la casilla.
   * @param {string} j.name - Nombre de la casilla.
   * @param {string} j.type - Tipo de la casilla.
   * @param {number} [j.value] - Valor asociado (ej: impuestos).
   * @param {string|null} [j.color] - Color del grupo de la casilla si corresponde.
   * 
   * @returns {Tile} Una nueva instancia de la clase Tile.
   */
  static fromJSON(j) {
    return new Tile({
      id: j.id,
      name: j.name,
      type: j.type,
      value: j.value,
      color: j.color
    });
  }
}
