import { Tile } from './Tile.js';
import { Property } from './Property.js';

/**
 * Aplana la estructura de datos del tablero desde el formato de bandas (bottom, left, top, right)
 * a un array ordenado por ID.
 * 
 * @param {Object} data - Datos del tablero con propiedades: bottom, left, top, right.
 * @returns {Array} Array de casillas ordenadas por su ID.
 */
function flattenBoard(data){
  const bands = ['bottom','left','top','right'];
  const all = bands.flatMap(k => Array.isArray(data[k]) ? data[k] : []);
  return all.sort((a,b)=> (a.id??0) - (b.id??0));
}

/**
 * Normaliza los nombres de tipos de casillas desde la API a los tipos internos.
 * 
 * @param {string} t - Tipo original desde la API.
 * @returns {string} Tipo normalizado.
 */
function normalizeType(t){
  if (t === 'community_chest') return 'community';
  if (t === 'chance') return 'chance';
  if (t === 'tax') return 'tax';
  if (t === 'railroad') return 'railroad';
  if (t === 'property') return 'property';
  if (t === 'special') return 'special';
  return t;
}

/**
 * Clase que representa el tablero de Monopoly.
 * 
 * El tablero contiene todas las casillas del juego en orden secuencial.
 * Se encarga de:
 * - Cargar los datos del tablero desde la API.
 * - Crear las instancias correspondientes (Tile, Property) para cada casilla.
 * - Proporcionar métodos para navegar por el tablero.
 */
export class Board {
  /**
   * Crea una nueva instancia del tablero.
   * 
   * @param {Object} api - Instancia de la API para cargar los datos del tablero.
   */
  constructor(api){ 
    /** @type {Object} Referencia a la API para obtener datos del tablero */
    this.api = api; 
    
    /** @type {Array<Tile|Property>} Array de todas las casillas del tablero */
    this.tiles = []; 
  }

  /**
   * Carga los datos del tablero desde la API y crea las instancias de casillas.
   * 
   * 📌 Proceso:
   * 1. Obtiene los datos del tablero desde la API.
   * 2. Aplana la estructura en bandas a un array ordenado.
   * 3. Crea las instancias apropiadas según el tipo de cada casilla.
   * 
   * 🏠 Tipos de casillas especiales:
   * - ID 0: Casilla "GO" (salida) con valor de recompensa.
   * - ID 10: Cárcel.
   * - ID 20: Estacionamiento gratuito.
   * - ID 30: "Ir a la cárcel".
   * 
   * @throws {Error} Si la API no devuelve casillas válidas.
   */
  async load(){
    const data = await this.api.getBoard();
    const flat = flattenBoard(data);
    if (!flat.length) throw new Error('El backend no devolvió casillas.');
    this.tiles = flat.map(raw => {
      const type = normalizeType(raw.type);
      if (type === 'special') {
        if (raw.id === 0)  return Tile.fromJSON({ id: raw.id, name: raw.name, type: 'go', value: raw.action?.money ?? 200 });
        if (raw.id === 10) return Tile.fromJSON({ id: raw.id, name: raw.name, type: 'jail' });
        if (raw.id === 20) return Tile.fromJSON({ id: raw.id, name: raw.name, type: 'free' });
        if (raw.id === 30) return Tile.fromJSON({ id: raw.id, name: raw.name, type: 'go_to_jail' });
        return Tile.fromJSON({ id: raw.id, name: raw.name, type: 'special' });
      }
      if (type === 'property') return Property.fromJSON(raw);
      if (type === 'tax') return Tile.fromJSON({ id: raw.id, name: raw.name, type: 'tax', value: raw.action?.money ?? -100 });
      if (type === 'railroad') return Tile.fromJSON({ id: raw.id, name: raw.name, type: 'railroad' });
      if (type === 'community') return Tile.fromJSON({ id: raw.id, name: raw.name, type: 'community' });
      if (type === 'chance') return Tile.fromJSON({ id: raw.id, name: raw.name, type: 'chance' });
      return Tile.fromJSON({ id: raw.id, name: raw.name, type });
    });
  }

  /**
   * Devuelve el número total de casillas en el tablero.
   * 
   * @returns {number} Cantidad de casillas en el tablero.
   */
  size(){ return this.tiles.length; }

  /**
   * Obtiene una casilla del tablero por su índice.
   * Maneja automáticamente el movimiento circular del tablero.
   * 
   * @param {number} i - Índice de la casilla (puede ser mayor al tamaño del tablero).
   * @returns {Tile|Property} La casilla en esa posición.
   * 
   * @example
   * // En un tablero de 40 casillas:
   * board.getTile(42); // Devuelve la casilla en posición 2 (42 % 40 = 2)
   */
  getTile(i){ return this.tiles[i % this.size()]; }

  /**
   * Calcula la nueva posición después de avanzar un número de pasos.
   * Maneja automáticamente el movimiento circular del tablero.
   * 
   * @param {number} from - Posición inicial.
   * @param {number} steps - Número de pasos a avanzar.
   * @returns {number} Nueva posición después del movimiento.
   * 
   * @example
   * // En un tablero de 40 casillas:
   * board.advance(38, 5); // Devuelve 3 (da la vuelta al tablero)
   */
  advance(from, steps){ return (from + steps) % this.size(); }
}
