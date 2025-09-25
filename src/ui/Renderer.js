import { Tooltip } from './Tooltip.js';

export class Renderer {
  constructor(){ this.game = null; this.modals = null; this._tileTokenDivs = []; this._tileEls = []; this.tooltip = new Tooltip(document.getElementById('tooltipRoot')); }
  mount(game){ this.game = game; this.modals = game.ui.modals; }

  // Clockwise coordinates starting at top-left:
  // top row: (r=1, c=1..N), right col: (r=2..N, c=N), bottom row: (r=N, c=N-1..1), left col: (r=N-1..2, c=1)
  renderBoard(board){
    const root = document.getElementById('board');
    root.innerHTML = '';
    this._tileTokenDivs = [];
    this._tileEls = [];

    const N = 11;
    const coords = [];
    for (let c = 1; c <= N; c++) coords.push({ r: 1, c, side: 'top' });
    for (let r = 2; r <= N; r++) coords.push({ r, c: N, side: 'right' });
    for (let c = N-1; c >= 1; c--) coords.push({ r: N, c, side: 'bottom' });
    for (let r = N-1; r >= 2; r--) coords.push({ r, c: 1, side: 'left' });

    const tiles = board.tiles.slice(0, 40);
    while (tiles.length < 40) tiles.push({ name:'', type:'void' });

    const iconFor = (t)=>{
      switch(t.type){
        case 'go': return './assets/go.svg';
        case 'jail': return './assets/jail.svg';
        case 'free': return './assets/free.svg';
        case 'go_to_jail': return './assets/gojail.svg';
        case 'chance': return './assets/chance.svg';
        case 'community': return './assets/community.svg';
        case 'railroad': return './assets/rail.svg';
        case 'tax': return './assets/tax.svg';
        default: return null;
      }
    };

    tiles.forEach((t, i) => {
      const { r, c, side } = coords[i];
      const el = document.createElement('div');
      el.className = `tile side-${side}`;
      el.style.gridRow = r;
      el.style.gridColumn = c;
      el.dataset.idx = i;

      const inner = document.createElement('div');
      inner.className = 'inner';

      if (t.type === 'property'){
        const stripe = document.createElement('div');
        stripe.className = 'stripe';
        stripe.style.background = t.color || '#000';
        inner.appendChild(stripe);
      }

      const icon = iconFor(t);
      if (icon){
        const img = document.createElement('img');
        img.src = icon; img.alt = t.type; img.className = 'icon';
        img.style.width = '18px'; img.style.height = '18px'; img.style.imageRendering = 'pixelated';
        inner.appendChild(img);
      }

      const name = document.createElement('div');
      name.className = 'name';
      name.textContent = t.name || '';

      const state = document.createElement('div');
      state.className = 'state';
      if (t.type === 'property') state.textContent = t.ownerId ? `P${t.ownerId}` : 'Libre';

      const build = document.createElement('div');
      build.className = 'build';
      if (t.type === 'property'){
        build.textContent = t.hotel ? '🏨' : (t.houses ? `🏠×${t.houses}` : '');
      }

      // token container
      const tokens = document.createElement('div');
      tokens.className = 'tokens';
      this._tileTokenDivs[i] = tokens;

      inner.append(name, state, build);
      el.appendChild(inner);
      el.appendChild(tokens);
      root.appendChild(el);
      this._tileEls[i] = el;

      // hover tooltip events
      el.addEventListener('mouseenter', (ev)=>{
        const ttRows = [];
        if (t.type === 'property'){
          ttRows.push(`Precio: $${t.price}`);
          ttRows.push(`Renta: $${t.rent?.base ?? 0}`);
          ttRows.push(t.ownerId ? `Dueño: P${t.ownerId}` : 'Sin dueño');
        } else if (t.type === 'tax'){
          ttRows.push(`Impuesto: $${Math.abs(t.value ?? 100)}`);
        } else if (t.type === 'railroad'){
          ttRows.push('Ferrocarril');
        } else if (t.type === 'chance' || t.type === 'community'){
          ttRows.push('Carta: toma una del mazo');
        } else if (t.type === 'jail'){
          ttRows.push('Cárcel');
        } else if (t.type === 'go'){
          ttRows.push('Salida: cobra $200 al pasar');
        }
        this.tooltip.show({ title: t.name || t.type, color: t.color, rows: ttRows, targetEl: el });
      });
      el.addEventListener('mouseleave', ()=> this.tooltip.hide());
    });
  }

  renderPlayers(players){
    const panel = document.getElementById('playersPanel');
    panel.innerHTML = players.map(p => `
      <div class="player">
        <strong style="color:${p.tokenColor}">■</strong>
        <span>${p.nick.toUpperCase()}</span>
        <span class="money">$${p.money}</span>
      </div>
    `).join('');
  }

  renderTokens(players){
    // clear all
    this._tileTokenDivs.forEach(div => { if (div) div.innerHTML=''; });
    // add tokens per player position (index 0 is top-left "Salida")
    players.forEach(p => {
      const idx = p.position % this._tileTokenDivs.length;
      const tgt = this._tileTokenDivs[idx];
      if (!tgt) return;
      const dot = document.createElement('div');
      dot.className = 'token';
      dot.style.color = p.tokenColor;
      dot.title = p.nick;
      dot.textContent = String(p.id);
      tgt.appendChild(dot);
    });
  }

  toast(msg){ console.log('[UI]', msg); }
}
