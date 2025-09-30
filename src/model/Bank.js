/**
 * Clase que representa el Banco en el juego de Monopoly.
 * Gestiona hipotecas: hipotecar y levantar hipoteca (+10%).
 */
export class Bank {
  /** Normaliza a número seguro (0 si NaN/undefined/null) */
  static _num(v) {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }

  /** Acredita dinero al jugador (soporta player.receive o money plano) */
  static _credit(player, amount) {
    if (typeof player?.receive === "function") player.receive(amount);
    else player.money = Bank._num(player?.money) + Bank._num(amount);
  }

  /** Debita dinero al jugador (soporta player.pay o money plano) */
  static _debit(player, amount) {
    if (typeof player?.pay === "function") player.pay(amount);
    else player.money = Bank._num(player?.money) - Bank._num(amount);
  }

  /**
   * Hipoteca una propiedad y entrega el valor de hipoteca al jugador.
   * Retorna: { ok:boolean, amount?:number, error?:string }
   */
  payMortgage(prop, player) {
    if (!prop || !player) return { ok: false, error: "Argumentos inválidos" };

    // Validaciones mínimas
    const ownerId = prop.ownerId ?? null;
    const playerId = player.id ?? null;
    if (ownerId !== playerId) return { ok: false, error: "No eres el dueño" };
    if (prop.mortgaged) return { ok: false, error: "Ya está hipotecada" };

    // Valor de hipoteca (backend: prop.mortgage; fallback: 50% del precio)
    const price = Bank._num(prop.price);
    const mortgage = Bank._num(prop.mortgage || Math.floor(price / 2));
    const amount = mortgage;

    Bank._credit(player, amount);
    prop.mortgaged = true;

    return { ok: true, amount };
  }

  /**
   * Levanta (redime) la hipoteca pagando al banco +10% de interés.
   * Retorna: { ok:boolean, amount?:number, error?:string }
   */
  redeemMortgage(prop, player) {
    if (!prop || !player) return { ok: false, error: "Argumentos inválidos" };

    const ownerId = prop.ownerId ?? null;
    const playerId = player.id ?? null;
    if (ownerId !== playerId) return { ok: false, error: "No eres el dueño" };
    if (!prop.mortgaged) return { ok: false, error: "No está hipotecada" };

    const price = Bank._num(prop.price);
    const mortgage = Bank._num(prop.mortgage || Math.floor(price / 2));
    const amount = Math.ceil(mortgage * 1.1); // +10%

    const saldo = Bank._num(player.money);
    if (saldo < amount) return { ok: false, error: "Saldo insuficiente" };

    Bank._debit(player, amount);
    prop.mortgaged = false;

    return { ok: true, amount };
  }
}
