export class TurnManager {
  start(players){ this.idx = 0; this.players = players; }
  currentPlayer(){ return this.players[this.idx]; }
  next(){
    do {
      this.idx = (this.idx + 1) % this.players.length;
      const p = this.currentPlayer();
      if (p.inJail){ p.jailTurns--; if (p.jailTurns<=0) p.inJail=false; else continue; }
      break;
    } while(true);
  }
}
