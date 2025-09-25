export class Rules {
  constructor({ dice }){ this.dice = dice; }
  ownsColorSet(game, player, color){
    const same = game.board.tiles.filter(t => t.type==='property' && t.color===color);
    return same.length>0 && same.every(p => p.ownerId === player.id);
  }
  canBuildHouse(game, player, prop){
    if (prop.ownerId !== player.id || prop.hotel || prop.houses >= 4) return false;
    return this.ownsColorSet(game, player, prop.color);
  }
  buildHouse(game, player, prop){
    if (!this.canBuildHouse(game, player, prop)) return false;
    const cost = 100; if (player.money < cost) return false;
    player.pay(cost); prop.houses += 1; return true;
  }
  buildHotel(game, player, prop){
    if (prop.ownerId !== player.id || prop.hotel || prop.houses !== 4) return false;
    const cost = 250; if (player.money < cost) return false;
    player.pay(cost); prop.hotel = true; prop.houses = 0; return true;
  }
  computeStandings(game){
    return game.players.map(p => {
      let assets = p.money;
      for (const t of game.board.tiles){
        if (t.type==='property' && t.ownerId===p.id){
          const base = t.price;
          const buildVal = t.hotel ? 200 : (t.houses * 100);
          const mortPenalty = t.mortgaged ? t.price : 0;
          assets += base + buildVal - mortPenalty;
        }
      }
      return { nick: p.nick, country: p.country, score: assets };
    }).sort((a,b)=> b.score - a.score);
  }
  async resolveTile({ game, player, tile }){
    switch (tile.type){
      case 'property':
        if (!tile.ownerId){
          return game.ui.modals.buyProperty({
            player, prop: tile,
            onBuy: ()=>{
              player.pay(tile.price); tile.ownerId = player.id; player.properties.add(tile.id);
              game.ui.refresh();
            }
          });
        }
        if (tile.ownerId !== player.id && !tile.mortgaged){
          const rent = tile.getRent();
          player.pay(rent);
          const owner = game.players.find(p => p.id === tile.ownerId);
          owner.receive(rent);
          game.ui.toast(`${player.nick} paga renta $${rent} a ${owner.nick}`);
          return;
        }
        return game.ui.modals.manageProperty({ player, prop: tile, onChange: (action)=>{
          switch(action){
            case 'house': this.buildHouse(game, player, tile); break;
            case 'hotel': this.buildHotel(game, player, tile); break;
            case 'mortgage': game.bank.payMortgage(tile, player); break;
            case 'redeem': game.bank.redeemMortgage(tile, player); break;
          }
          game.ui.refresh();
        }});
      case 'tax': { const amount = tile.value ?? 100; player.pay(amount); game.ui.toast(`${player.nick} paga impuesto $${amount}`); return; }
      case 'chance': { const amount = Math.random() < 0.5 ? -100 : 100; if (amount>0) player.receive(amount); else player.pay(-amount); game.ui.toast(`Sorpresa: ${amount>0?'+':''}${amount}`); return; }
      case 'community': { const amount = Math.random() < 0.5 ? -100 : 100; if (amount>0) player.receive(amount); else player.pay(-amount); game.ui.toast(`Comunidad: ${amount>0?'+':''}${amount}`); return; }
      case 'jail': { player.inJail = true; player.jailTurns = 2; game.ui.toast(`${player.nick} va a la cárcel (2 turnos)`); return; }
      default: return;
    }
  }
}
