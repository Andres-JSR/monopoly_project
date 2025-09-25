export class Game {
  constructor({ board, players, bank, rules, turnManager, ui, api }){
    this.board = board; this.players = players; this.bank = bank; this.rules = rules;
    this.turns = turnManager; this.ui = ui; this.api = api; this.ended = false;
  }

  async init(){
    await this.board.load();
    this.ui.mount(this);
    this.ui.renderBoard(this.board);
    this.ui.renderPlayers(this.players);
    this.ui.renderTokens(this.players);
    this.turns.start(this.players);
    this.ui.bindControls(this);
  }

  async rollDiceOrManual(values=null){
    const roll = values ?? this.rules.dice.rollTwo();
    // show last roll
    const lr = document.getElementById('lastRoll');
    if (lr) lr.textContent = `${roll.d1} + ${roll.d2} = ${roll.total}`;
    const current = this.turns.currentPlayer();
    await this.movePlayer(current, roll.total);
  }

  async movePlayer(player, steps){
    let curr = player.position;
    for (let i=0; i<steps; i++){
      curr = this.board.advance(curr, 1);
      player.position = curr;
      this.ui.renderTokens(this.players);
      await new Promise(r => setTimeout(r, 180));
    }
    const tile = this.board.getTile(curr);
    await this.rules.resolveTile({ game: this, player, tile });
    this.ui.refresh();
    if (!this.ended) this.turns.next();
  }

  async endGameManual(){
    const standings = this.rules.computeStandings(this);
    this.ended = true;
    this.ui.modals.showStandings(standings);
    for (const s of standings){
      try { await this.api.postScore({ nick_name: s.nick, score: s.score, country_code: s.country }); }
      catch(e){ console.warn('No se pudo registrar score', e); }
    }
  }
}
