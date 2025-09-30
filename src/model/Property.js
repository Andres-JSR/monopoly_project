import { Tile } from "./Tile.js";

export class Property extends Tile {
  /**
   * @param {Object} p
   * @param {number} p.id
   * @param {string} p.name
   * @param {string} [p.type='property']   // 'property' | 'railroad' | 'utility'
   * @param {string|null} [p.color=null]
   * @param {number} [p.price=0]
   * @param {{base?:number,withHouse?:number[],withHotel?:number,rail?:number[]}} [p.rent]
   * @param {number} [p.mortgage=0]
   * @param {?number} [p.ownerId=null]
   * @param {boolean} [p.mortgaged=false]
   * @param {number} [p.houses=0]
   * @param {boolean} [p.hotel=false]
   */
  constructor({
    id,
    name,
    type = "property",
    color = null,
    price = 0,
    rent = {},
    mortgage = 0,
    ownerId = null,
    mortgaged = false,
    houses = 0,
    hotel = false,
    baseRent = rent?.base ?? 0,
  }) {
    super({ id, name, type, color });

    this.price = Number(price) || 0;

    // Estructura de rentas unificada
    this.rent = {
      base: Number(rent?.base ?? baseRent ?? 0),
      withHouse: Array.isArray(rent?.withHouse)
        ? rent.withHouse.map((n) => Number(n) || 0)
        : [],
      withHotel: Number(rent?.withHotel ?? 0),
      // Para ferrocarriles (25/50/100/200)
      rail: Array.isArray(rent?.rail)
        ? rent.rail.map((n) => Number(n) || 0)
        : undefined,
    };

    // Campo auxiliar para UIs que lean "baseRent"
    this.baseRent = this.rent.base;

    // ¡OJO! Usamos "mortgage" (no mortgageValue) para alinear con Bank/Rules
    this.mortgage = Number(mortgage) || 0;

    this.ownerId = ownerId ?? null;
    this.mortgaged = !!mortgaged;

    this.houses = Number(houses) || 0;
    this.hotel = !!hotel;
  }

  /**
   * Normaliza lo que viene del backend y crea Property.
   */
  static fromJSON(j) {
    const type = j.type || "property";
    const price = Number(j.price ?? j.cost ?? 0);

    // Detectar baseRent en varios formatos
    let baseRent = 0;
    if (j.baseRent != null) baseRent = Number(j.baseRent);
    else if (j.base_rent != null) baseRent = Number(j.base_rent);
    else if (Array.isArray(j.rent)) baseRent = Number(j.rent[0] ?? 0);
    else if (j.rent && typeof j.rent === "object")
      baseRent = Number(j.rent["1"] ?? j.rent.base ?? 0);
    else if (typeof j.rent === "number") baseRent = Number(j.rent);

    // Tabla de RR si viene como objeto {"1":25,"2":50,...}
    let railTable;
    if (type === "railroad") {
      if (Array.isArray(j.rent)) railTable = j.rent.map((n) => Number(n) || 0);
      else if (j.rent && typeof j.rent === "object") {
        railTable = [1, 2, 3, 4].map((k) => Number(j.rent[String(k)] ?? 0));
      } else {
        railTable = [25, 50, 100, 200]; // fallback clásico
      }
      if (!baseRent) baseRent = railTable[0] || 25;
    }

    // Estructura de rentas coherente según tipo
    const rent =
      type === "railroad"
        ? { base: baseRent, rail: railTable }
        : {
            base: baseRent,
            withHouse: j.rent?.withHouse ?? [],
            withHotel: j.rent?.withHotel ?? 0,
          };

    return new Property({
      id: j.id,
      name: j.name,
      type,
      color: j.color || j.group || null,
      price,
      rent,
      mortgage: Number(j.mortgage ?? Math.floor(price / 2)),
      ownerId: j.ownerId ?? j.owner ?? null,
      mortgaged: !!j.mortgaged,
      houses: Number(j.houses || 0),
      hotel: !!j.hotel,
      baseRent,
    });
  }

  /**
   * Renta para calles (para RR la calculamos en Rules con el conteo del dueño).
   */
  getRent() {
    if (this.mortgaged) return 0;
    if (this.type === "railroad") {
      // La renta de RR depende de cuántas posee el dueño -> Rules.js
      return this.rent.rail?.[0] ?? this.baseRent ?? 0;
    }
    if (this.hotel) return Number(this.rent.withHotel || 0);
    if (this.houses >= 1)
      return Number(this.rent.withHouse[this.houses - 1] || 0);
    return Number(this.rent.base || 0);
  }
}
