// src/api.js
/**
 * URL base del servidor backend del juego de Monopoly.
 */
const BASE = "http://127.0.0.1:5000";

/**
 * Cliente de API del backend (solo endpoints existentes).
 */
export const Api = {
  /**
   * GET /countries
   * Backend devuelve: [{ "US":"United States" }, { "CO":"Colombia" }, ...]
   */
  async getCountries() {
    const r = await fetch(`${BASE}/countries`, { mode: "cors" });
    if (!r.ok) throw new Error(`GET /countries -> ${r.status}`);
    const arr = await r.json();
    return arr.map((obj) => {
      const code = Object.keys(obj)[0];
      return { code, name: obj[code] };
    });
  },

  /**
   * GET /board
   */
  async getBoard() {
    const r = await fetch(`${BASE}/board`, { mode: "cors" });
    if (!r.ok) throw new Error(`GET /board -> ${r.status}`);
    return r.json();
  },

  /**
   * GET /ranking
   */
  async getRanking() {
    const r = await fetch(`${BASE}/ranking`, { mode: "cors" });
    if (!r.ok) throw new Error(`GET /ranking -> ${r.status}`);
    return r.json();
  },

  /**
   * POST /score-recorder
   * payload: { nick_name, score, country_code }
   */
  async scoreRecorder(payload) {
    const r = await fetch(`${BASE}/score-recorder`, {
      method: "POST",
      mode: "cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!r.ok) {
      const msg = await r.text().catch(() => r.statusText);
      throw new Error(`POST /score-recorder -> ${r.status} ${msg}`);
    }
    return r.json();
  },

  /**
   * (Opcional) Registrar jugadores al iniciar con score = 0 usando /score-recorder.
   * Si no quieres registrar al inicio, NO llames a esta función.
   */
  async registerPlayers(players) {
    const ops = players.map(
      (p) =>
        this.scoreRecorder({
          nick_name: p.nick,
          score: 0,
          country_code: p.country,
        }).catch(() => null) // no bloquea el inicio si alguno falla
    );
    return Promise.all(ops);
  },
};
