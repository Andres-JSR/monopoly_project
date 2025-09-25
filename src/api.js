const BASE = 'http://127.0.0.1:5000';

export const Api = {
  async getCountries() {
    const r = await fetch(`${BASE}/countries`);
    const arr = await r.json();
    return arr.map(obj => {
      const code = Object.keys(obj)[0];
      const name = obj[code];
      return { code, name };
    });
  },
  async getBoard() { const r = await fetch(`${BASE}/board`); return r.json(); },
  async getRanking() { const r = await fetch(`${BASE}/ranking`); return r.json(); },
  async postScore(body) {
    const r = await fetch(`${BASE}/score-recorder`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
    });
    return r.json();
  }
};
