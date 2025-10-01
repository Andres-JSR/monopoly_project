function _notify(game, kind, title, msg) {
  const n = game?.ui?.notifier;
  if (!n) return;
  (n[kind] || n.info).call(n, msg, title);
}
function _moneyStr(v) {
  const s = Number(v) >= 0 ? "+" : "−";
  return `${s}$${Math.abs(Number(v) || 0)}`;
}
/**
 * Clase que contiene todas las reglas y lógica del juego de Monopoly.
 *
 * Se encarga de:
 * - Validar y ejecutar construcciones de casas y hoteles.
 * - Calcular las posiciones finales de los jugadores.
 * - Resolver las acciones cuando un jugador cae en una casilla.
 * - Verificar la propiedad de conjuntos de colores.
 */
export class Rules {
  /**
   * Crea una nueva instancia de las reglas del juego.
   *
   * @param {Object} param0 - Objeto con dependencias.
   * @param {Dice} param0.dice - Instancia de dados para el juego.
   */
  constructor({ dice }) {
    /** @type {Dice} Dados del juego */
    this.dice = dice;
  }

  /**
   * Verifica si un jugador posee todas las propiedades de un color específico.
   *
   * @param {Game} game - Instancia del juego.
   * @param {Player} player - Jugador a verificar.
   * @param {string} color - Color del conjunto de propiedades.
   * @returns {boolean} `true` si posee todo el conjunto, `false` en caso contrario.
   *
   * 📌 Regla importante:
   * Para construir casas u hoteles, el jugador debe poseer TODAS las propiedades
   * de un mismo color (monopolio).
   */
  ownsColorSet(game, player, color) {
    const same = game.board.tiles.filter(
      (t) => t.type === "property" && t.color === color
    );
    return same.length > 0 && same.every((p) => p.ownerId === player.id);
  }

  /**
   * Verifica si un jugador puede construir una casa en una propiedad específica.
   *
   * @param {Game} game - Instancia del juego.
   * @param {Player} player - Jugador que quiere construir.
   * @param {Property} prop - Propiedad donde se quiere construir.
   * @returns {boolean} `true` si puede construir, `false` en caso contrario.
   *
   * 📋 Condiciones para construir casa:
   * - El jugador debe ser dueño de la propiedad.
   * - La propiedad no debe tener hotel.
   * - La propiedad debe tener menos de 4 casas.
   * - El jugador debe poseer todo el conjunto de color (monopolio).
   */
  canBuildHouse(game, player, prop) {
    // Debe ser dueño, no tener hotel, < 4 casas, NO hipotecada y monopolio del color
    if (prop.ownerId !== player.id) return false;
    if (prop.hotel) return false;
    if (prop.houses >= 4) return false;
    if (prop.mortgaged) return false;
    return this.ownsColorSet(game, player, prop.color);
  }
  /**
   * Construye una casa en una propiedad.
   *
   * @param {Game} game - Instancia del juego.
   * @param {Player} player - Jugador que construye.
   * @param {Property} prop - Propiedad donde construir.
   * @returns {boolean} `true` si la construcción fue exitosa, `false` en caso contrario.
   *
   * 💰 Costo: $100 por casa.
   *
   * 📋 Proceso:
   * 1. Verifica que se pueda construir (`canBuildHouse`).
   * 2. Verifica que el jugador tenga suficiente dinero.
   * 3. Cobra el costo al jugador.
   * 4. Añade la casa a la propiedad.
   */
  buildHouse(game, player, prop) {
    if (!this.canBuildHouse(game, player, prop)) return false;
    const cost = 100;
    if (player.money < cost) return false;
    player.pay(cost);
    prop.houses += 1;
    return true;
  }

  /**
   * Construye un hotel en una propiedad.
   *
   * @param {Game} game - Instancia del juego.
   * @param {Player} player - Jugador que construye.
   * @param {Property} prop - Propiedad donde construir.
   * @returns {boolean} `true` si la construcción fue exitosa, `false` en caso contrario.
   *
   * 💰 Costo: $250 por hotel.
   *
   * 📋 Condiciones para construir hotel:
   * - El jugador debe ser dueño de la propiedad.
   * - La propiedad no debe tener hotel ya.
   * - La propiedad debe tener exactamente 4 casas.
   * - El jugador debe tener suficiente dinero.
   *
   * 🏨 Efecto:
   * - Se quitan las 4 casas y se coloca el hotel.
   * - El hotel genera la máxima renta de la propiedad.
   */
  buildHotel(game, player, prop) {
    // Dueño, sin hotel, EXACTAMENTE 4 casas, NO hipotecada, dinero suficiente
    if (prop.ownerId !== player.id) return false;
    if (prop.hotel) return false;
    if (prop.houses !== 4) return false;
    if (prop.mortgaged) return false;

    const cost = 250;
    if (player.money < cost) return false;

    player.pay(cost);
    prop.hotel = true;
    prop.houses = 0;
    return true;
  }

  /**
   * Calcula las posiciones finales de todos los jugadores ordenadas de mayor a menor patrimonio.
   *
   * @param {Game} game - Instancia del juego.
   * @returns {Array<Object>} Array de objetos con formato:
   *   - `nick` {string}: Apodo del jugador.
   *   - `country` {string}: País del jugador.
   *   - `score` {number}: Patrimonio total del jugador.
   *
   * 💰 Cálculo del patrimonio:
   * - Dinero en efectivo del jugador.
   * - Precio de compra de todas sus propiedades.
   * - Valor de las construcciones (casas: $100 c/u, hotel: $200).
   * - Penalización por propiedades hipotecadas (-precio de la propiedad).
   *
   * 📊 El array se devuelve ordenado de mayor a menor patrimonio.
   */
  computeStandings(game) {
    return game.players
      .map((p) => {
        let assets = p.money;
        for (const t of game.board.tiles) {
          if (t.type === "property" && t.ownerId === p.id) {
            const base = t.price;
            const buildVal = t.hotel ? 200 : t.houses * 100;
            const mortPenalty = t.mortgaged ? t.price : 0;
            assets += base + buildVal - mortPenalty;
          }
        }
        return { nick: p.nick, country: p.country, score: assets };
      })
      .sort((a, b) => b.score - a.score);
  }

  /**
   * Resuelve las acciones que ocurren cuando un jugador cae en una casilla específica.
   *
   * @param {Object} param0 - Objeto con los datos necesarios.
   * @param {Game} param0.game - Instancia del juego.
   * @param {Player} param0.player - Jugador que cayó en la casilla.
   * @param {Tile|Property} param0.tile - Casilla donde cayó el jugador.
   *
   * 🎯 Tipos de casillas y sus efectos:
   *
   * **Propiedad:**
   * - Sin dueño → Muestra modal de compra.
   * - Con dueño diferente → Paga renta al dueño.
   * - Propia → Muestra modal de gestión (construir, hipotecar).
   *
   * **Impuesto (tax):**
   * - El jugador paga el monto especificado.
   *
   * **Sorpresa (chance) / Comunidad (community):**
   * - 50% probabilidad de ganar/perder $100.
   *
   * **Cárcel (jail):**
   * - El jugador va a la cárcel por 2 turnos.
   */
  async resolveTile({ game, player, tile }) {
    switch (tile.type) {
      case "property":
        if (!tile.ownerId) {
          return game.ui.modals.buyProperty({
            player,
            prop: tile,
            onBuy: () => {
              player.pay(tile.price);
              tile.ownerId = player.id;
              if (!player.properties) player.properties = new Set();
              player.properties.add(tile.id);
              game.ui.refresh();
            },
          });
        }

        // si tiene dueño y está hipotecada → no cobra
        if (tile.ownerId !== player.id && tile.mortgaged) {
          game.ui?.notifier?.info(
            `${tile.name} está hipotecada. No se cobra renta.`,
            "Sin renta"
          );
          return;
        }

        // tiene dueño distinto → cobrar
        if (tile.ownerId !== player.id) {
          const rent = tile.getRent();
          player.pay(rent);
          const owner = game.players.find((p) => p.id === tile.ownerId);
          owner.receive(rent);
          game.ui.toast(`${player.nick} paga renta $${rent} a ${owner.nick}`);
          return;
        }

        return game.ui.modals.manageProperty({
          player,
          prop: tile,
          can: {
            house: this.canBuildHouse(game, player, tile), // monopolio, no hipotecada, sin hotel, <4 casas
            hotel:
              tile.ownerId === player.id &&
              !tile.mortgaged && // dueño y no hipotecada
              tile.houses === 4 &&
              !tile.hotel, // 4 casas exactas y sin hotel
          },
          prices: { house: 100, hotel: 250 },
          onChange: (action) => {
            switch (action) {
              case "house": {
                const ok = this.buildHouse(game, player, tile);
                if (ok)
                  game.ui?.notifier?.success(
                    `Construiste una casa en ${tile.name}. -$100`,
                    "Construcción"
                  );
                else
                  game.ui?.notifier?.warn(
                    "No puedes construir casa aquí (revisa monopolio, hipoteca o saldo).",
                    "Construcción"
                  );
                break;
              }
              case "hotel": {
                const ok = this.buildHotel(game, player, tile);
                if (ok)
                  game.ui?.notifier?.success(
                    `Construiste un hotel en ${tile.name}. -$250`,
                    "Construcción"
                  );
                else
                  game.ui?.notifier?.warn(
                    "No puedes construir hotel (requiere 4 casas, no hipotecada y saldo).",
                    "Construcción"
                  );
                break;
              }
              case "mortgage": {
                const r = game.bank?.payMortgage(tile, player);
                if (r?.ok)
                  game.ui?.notifier?.success(
                    `Recibes $${r.amount} por hipotecar ${tile.name}`,
                    "Hipoteca"
                  );
                else game.ui?.notifier?.error("No se pudo hipotecar.");
                break;
              }
              case "redeem": {
                const r = game.bank?.redeemMortgage(tile, player);
                if (r?.ok)
                  game.ui?.notifier?.success(
                    `Pagas $${r.amount} para levantar hipoteca de ${tile.name}`,
                    "Hipoteca"
                  );
                else
                  game.ui?.notifier?.warn(
                    r?.error || "No se pudo levantar hipoteca."
                  );
                break;
              }
            }
            game.ui.refresh();
          },
        });


      case "railroad": {
        // comprar si no tiene dueño
        if (!tile.ownerId) {
          return game.ui.modals.buyProperty({
            player,
            prop: tile,
            onBuy: () => {
              player.pay
                ? player.pay(tile.price)
                : (player.money -= tile.price);
              tile.ownerId = player.id;
              if (!player.properties) player.properties = new Set();
              player.properties.add(tile.id);
              game.ui.refresh?.();
            },
          });
        }

        // si tiene dueño distinto y está hipotecada → no cobra
        if (tile.ownerId !== player.id && tile.mortgaged) {
          game.ui?.notifier?.info(
            `${tile.name} está hipotecada. No se cobra renta.`,
            "Sin renta"
          );
          return;
        }

        // si tiene dueño distinto → cobrar según #RR del dueño
        if (tile.ownerId !== player.id) {
          const owner = game.players.find((p) => p.id === tile.ownerId);
          const railsOwned = game.board.tiles.filter(
            (t) => t.type === "railroad" && t.ownerId === owner.id
          ).length;
          const table = [25, 50, 100, 200];
          const rent = table[Math.max(0, Math.min(railsOwned, 4)) - 1] || 25;

          player.pay ? player.pay(rent) : (player.money -= rent);
          owner.receive ? owner.receive(rent) : (owner.money += rent);

          game.ui?.notifier?.info(
            `${player.nick} paga $${rent} a ${owner.nick}`,
            tile.name || "Ferrocarril"
          );
          game.ui.refresh?.();
          return;
        }

        // es mía → gestionar hipoteca
        return game.ui.modals.manageProperty({
          player,
          prop: tile,
          onChange: (action) => {
            switch (action) {
              case "mortgage": {
                const r = game.bank?.payMortgage(tile, player);
                if (r?.ok)
                  game.ui?.notifier?.success(
                    `Recibes $${r.amount} por hipotecar ${tile.name}`,
                    "Hipoteca"
                  );
                else
                  game.ui?.notifier?.warn(r?.error || "No se pudo hipotecar.");
                break;
              }
              case "redeem": {
                const r = game.bank?.redeemMortgage(tile, player);
                if (r?.ok)
                  game.ui?.notifier?.success(
                    `Pagas $${r.amount} para levantar hipoteca de ${tile.name}`,
                    "Hipoteca"
                  );
                else
                  game.ui?.notifier?.warn(
                    r?.error || "No se pudo levantar hipoteca."
                  );
                break;
              }
            }
            game.ui.refresh?.();
          },
        });
      }
      case "tax": {
        const raw = Number(tile.value ?? -100);
        const amount = Math.abs(raw) || 100;
        player.pay(amount);
        game.ui.toast(`${player.nick} paga impuesto $${amount}`);
        return;
      }
      case "chance": {
        const amount = Math.random() < 0.5 ? -100 : 100;
        if (amount > 0) player.receive(amount);
        else player.pay(-amount);
        game.ui.toast(`Sorpresa: ${amount > 0 ? "+" : ""}${amount}`);
        return;
      }
      case "community": {
        const amount = Math.random() < 0.5 ? -100 : 100;
        if (amount > 0) player.receive(amount);
        else player.pay(-amount);
        game.ui.toast(`Comunidad: ${amount > 0 ? "+" : ""}${amount}`);
        return;
      }
      case "jail": {
        player.inJail = true;
        player.jailTurns = 2;
        game.ui.toast(`${player.nick} va a la cárcel (2 turnos)`);
        return;
      }
      default:
        return;
    }
  }
}
