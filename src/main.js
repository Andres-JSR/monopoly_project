import { Api } from './api.js';
import { Game } from './model/Game.js';
import { Board } from './model/Board.js';
import { Player } from './model/Player.js';
import { Bank } from './model/Bank.js';
import { Rules } from './model/Rules.js';
import { Dice } from './model/Dice.js';
import { TurnManager } from './model/TurnManager.js';
import { Modals } from './ui/Modals.js';
import { Renderer } from './ui/Renderer.js';

const ui = new Renderer();
ui.modals = new Modals(document.getElementById('modalRoot'));

function bindRanking(){
  document.getElementById('refreshRanking').onclick = async ()=>{
    const rk = await Api.getRanking();
    const ul = document.getElementById('rankingList');
    ul.innerHTML = rk.map(r => `
      <li>
        <img src="https://flagsapi.com/${(r.country_code||'US').toUpperCase()}/flat/24.png" alt="" />
        <strong>${r.nick_name}</strong> — ${r.score}
      </li>`).join('');
  };
}

async function bootstrap(){
  const countries = await Api.getCountries();
  const playerCountSel = document.getElementById('playerCount');
  const playersForm = document.getElementById('playersForm');

  function drawForm(){
    const n = +playerCountSel.value; playersForm.innerHTML = '';
    for (let i=0;i<n;i++){
      const row = document.createElement('div');
      row.innerHTML = `
        <input placeholder="Nickname P${i+1}" class="nick" />
        <select class="country">
          ${countries.map(c=>`<option value="${c.code}">${c.name}</option>`).join('')}
        </select>
        <input type="color" class="color" value="#${(Math.random()*0xFFFFFF<<0).toString(16).padStart(6,'0')}" />`;
      playersForm.appendChild(row);
    }
  }
  playerCountSel.onchange = drawForm; drawForm();

  document.getElementById('startBtn').onclick = async ()=>{
    const inputs = [...playersForm.querySelectorAll('.nick')];
    const selects = [...playersForm.querySelectorAll('.country')];
    const colors = [...playersForm.querySelectorAll('.color')];
    const players = inputs.map((inp, i)=> new Player({ id:i+1, nick: inp.value || `P${i+1}`, country: selects[i].value, tokenColor: colors[i].value }));

    const game = new Game({
      board: new Board(Api), players, bank: new Bank(), rules: new Rules({ dice: new Dice() }),
      turnManager: new TurnManager(), ui: {
        mount: (g)=> ui.mount(g),
        renderBoard: (b)=> ui.renderBoard(b),
        renderPlayers: (p)=> ui.renderPlayers(p),
        renderTokens: (p)=> ui.renderTokens(p),
        bindControls: (g)=> bindControls(g),
        refresh: ()=> { ui.renderPlayers(game.players); ui.renderBoard(game.board); ui.renderTokens(game.players); },
        toast: (m)=> ui.toast(m),
        modals: ui.modals
      },
      api: Api
    });

    window.__game = game;
    await game.init();
    ui.renderTokens(players);
  };

  bindRanking();
}

function bindControls(game){
  document.getElementById('rollBtn').onclick = ()=> game.rollDiceOrManual();
  document.getElementById('rollManualBtn').onclick = ()=>{
    const d1 = +document.getElementById('manualD1').value;
    const d2 = +document.getElementById('manualD2').value;
    if (d1>=1 && d1<=6 && d2>=1 && d2<=6) game.rollDiceOrManual({ d1, d2, total: d1+d2 });
  };
  document.getElementById('endBtn').onclick = ()=> game.endGameManual();
}

bootstrap();
