/**
 * URL base del servidor backend del juego de Monopoly.
 * 
 * @constant {string}
 */
const BASE = 'http://127.0.0.1:5000';

/**
 * Clase estática que maneja todas las comunicaciones con la API externa del juego.
 * 
 * Proporciona métodos para:
 * - Ob
 * +tener la lista de países disponibles.
 * - Cargar la configuración del tablero.
 * - Consultar el ranking de puntuaciones.
 * - Registrar nuevas puntuaciones.
 */
export const Api = {
  
  /**
   * Obtiene la lista de países disponibles para seleccionar en el juego.
   * 
   * @async
   * @returns {Promise<Array<Object>>} Array de objetos país con formato:
   *   - `code` {string}: Código ISO del país (ej: "US", "ES", "MX").
   *   - `name` {string}: Nombre completo del país.
   * 
   * @throws {Error} Si hay problemas de conexión con la API.
   * 
   * @example
   * const countries = await Api.getCountries();
   * // [{code: "US", name: "United States"}, {code: "ES", name: "Spain"}]
   */
  async getCountries() {
    const r = await fetch(`${BASE}/countries`);
    const arr = await r.json();
    return arr.map(obj => {
      const code = Object.keys(obj)[0];
      const name = obj[code];
      return { code, name };
    });
  },

  /**
   * Obtiene la configuración completa del tablero de juego.
   * 
   * @async
   * @returns {Promise<Object>} Objeto con la estructura del tablero organizada en bandas:
   *   - `bottom` {Array}: Casillas de la fila inferior.
   *   - `left` {Array}: Casillas de la columna izquierda.
   *   - `top` {Array}: Casillas de la fila superior.
   *   - `right` {Array}: Casillas de la columna derecha.
   * 
   * Cada casilla contiene información como: id, name, type, price, rent, etc.
   * 
   * @throws {Error} Si hay problemas de conexión con la API.
   */
  async getBoard() { 
    const r = await fetch(`${BASE}/board`); 
    return r.json(); 
  },

  /**
   * Obtiene el ranking de mejores puntuaciones del juego.
   * 
   * @async
   * @returns {Promise<Array<Object>>} Array de puntuaciones ordenadas de mayor a menor:
   *   - `nick_name` {string}: Apodo del jugador.
   *   - `score` {number}: Puntuación obtenida.
   *   - `country_code` {string}: Código del país del jugador.
   * 
   * @throws {Error} Si hay problemas de conexión con la API.
   */
  async getRanking() { 
    const r = await fetch(`${BASE}/ranking`); 
    return r.json(); 
  },

  /**
   * Registra una nueva puntuación en el servidor.
   * 
   * @async
   * @param {Object} body - Datos de la puntuación a registrar.
   * @param {string} body.nick_name - Apodo del jugador.
   * @param {number} body.score - Puntuación obtenida.
   * @param {string} body.country_code - Código ISO del país del jugador.
   * 
   * @returns {Promise<Object>} Respuesta del servidor confirmando el registro.
   * 
   * @throws {Error} Si hay problemas de conexión con la API o el servidor rechaza la puntuación.
   * 
   * @example
   * await Api.postScore({
   *   nick_name: "Player1",
   *   score: 2500,
   *   country_code: "ES"
   * });
   */
  async postScore(body) {
    const r = await fetch(`${BASE}/score-recorder`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
    });
    return r.json();
  }
};
