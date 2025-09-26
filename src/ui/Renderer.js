import { Tooltip } from './Tooltip.js';

/**
 * Clase responsable de renderizar toda la interfaz visual del juego de Monopoly.
 * 
 * Se encarga de:
 * - Renderizar el tablero con todas las casillas.
 * - Mostrar información de los jugadores.
 * - Posicionar las fichas de los jugadores en el tablero.
 * - Gestionar tooltips informativos.
 * - Mostrar mensajes de notificación.
 */
export class Renderer {
  
  /**
   * Crea una nueva instancia del renderizador.
   */
  constructor(){ 
    /** @type {Game|null} Referencia al juego actual */
    this.game = null; 
    
    /** @type {Modals|null} Referencia al gestor de modales */
    this.modals = null; 
    
    /** @type {Array<HTMLElement>} Contenedores de fichas para cada casilla */
    this._tileTokenDivs = []; 
    
    /** @type {Array<HTMLElement>} Elementos HTML de las casillas del tablero */
    this._tileEls = []; 
    
    /** @type {Tooltip} Gestor de tooltips informativos */
    this.tooltip = new Tooltip(document.getElementById('tooltipRoot')); 
  }

  /**
   * Monta el renderizador al juego y configura las referencias necesarias.
   * 
   * @param {Game} game - Instancia del juego a renderizar.
   */
  mount(game){ 
    this.game = game; 
    this.modals = game.ui.modals; 
  }

  /**
   * Renderiza el tablero completo del juego en el DOM.
   * 
   * 🗺️ Distribución del tablero:
   * - 40 casillas en total organizadas en un cuadrado de 11x11.
   * - Disposición horaria empezando por la esquina superior izquierda.
   * - Fila superior (top), columna derecha (right), fila inferior (bottom), columna izquierda (left).
   * 
   * 🎨 Características visuales:
   * - Franjas de colores para propiedades.
   * - Iconos específicos para cada tipo de casilla.
   * - Información de estado (dueño, construcciones).
   * - Contenedores para fichas de jugadores.
   * - Tooltips informativos al hacer hover.
   * 
   * @param {Board} board - El tablero a renderizar.
   */
  renderBoard(board){
    const root = document.getElementById('board');
    root.innerHTML = '';
    this._tileTokenDivs = [];
    this._tileEls = [];

    // Coordenadas en sentido horario empezando por arriba-izquierda:
    // fila superior: (r=1, c=1..N), columna derecha: (r=2..N, c=N), 
    // fila inferior: (r=N, c=N-1..1), columna izquierda: (r=N-1..2, c=1)
    const N = 11;
    const coords = [];
    for (let c = 1; c <= N; c++) coords.push({ r: 1, c, side: 'top' });
    for (let r = 2; r <= N; r++) coords.push({ r, c: N, side: 'right' });
    for (let c = N-1; c >= 1; c--) coords.push({ r: N, c, side: 'bottom' });
    for (let r = N-1; r >= 2; r--) coords.push({ r, c: 1, side: 'left' });

    // Asegurar que tenemos exactamente 40 casillas
    const tiles = board.tiles.slice(0, 40);
    while (tiles.length < 40) tiles.push({ name:'', type:'void' });

    /**
     * Devuelve la ruta del icono correspondiente al tipo de casilla.
     * 
     * @param {Tile} t - Casilla para la cual obtener el icono.
     * @returns {string|null} Ruta del icono o null si no tiene icono específico.
     */
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

    // Crear elementos HTML para cada casilla del tablero
    tiles.forEach((t, i) => {
      const { r, c, side } = coords[i];
      const el = document.createElement('div');
      el.className = `tile side-${side}`;
      el.style.gridRow = r;
      el.style.gridColumn = c;
      el.dataset.idx = i;

      const inner = document.createElement('div');
      inner.className = 'inner';

      // Franja de color para propiedades
      if (t.type === 'property'){
        const stripe = document.createElement('div');
        stripe.className = 'stripe';
        stripe.style.background = t.color || '#000';
        inner.appendChild(stripe);
      }

      // Icono de la casilla
      const icon = iconFor(t);
      if (icon){
        const img = document.createElement('img');
        img.src = icon; img.alt = t.type; img.className = 'icon';
        img.style.width = '18px'; img.style.height = '18px'; img.style.imageRendering = 'pixelated';
        inner.appendChild(img);
      }

      // Nombre de la casilla
      const name = document.createElement('div');
      name.className = 'name';
      name.textContent = t.name || '';

      // Estado de la propiedad (dueño)
      const state = document.createElement('div');
      state.className = 'state';
      if (t.type === 'property') state.textContent = t.ownerId ? `P${t.ownerId}` : 'Libre';

      // Construcciones (casas/hotel)
      const build = document.createElement('div');
      build.className = 'build';
      if (t.type === 'property'){
        build.textContent = t.hotel ? '🏨' : (t.houses ? `🏠×${t.houses}` : '');
      }

      // Contenedor para fichas de jugadores
      const tokens = document.createElement('div');
      tokens.className = 'tokens';
      this._tileTokenDivs[i] = tokens;

      inner.append(name, state, build);
      el.appendChild(inner);
      el.appendChild(tokens);
      root.appendChild(el);
      this._tileEls[i] = el;

      // Eventos para mostrar tooltip informativo
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

  /**
   * Renderiza el panel de información de los jugadores.
   * 
   * @param {Player[]} players - Array de jugadores a mostrar.
   * 
   * 📋 Información mostrada para cada jugador:
   * - Ficha de color (■ con el color del jugador).
   * - Nombre en mayúsculas.
   * - Cantidad de dinero actual.
   */
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

  /**
   * Renderiza las fichas de los jugadores en sus posiciones actuales del tablero.
   * 
   * @param {Player[]} players - Array de jugadores con sus posiciones.
   * 
   * 🎯 Proceso de renderizado:
   * 1. Limpia todas las fichas existentes en el tablero.
   * 2. Para cada jugador, coloca su ficha en la casilla correspondiente a su posición.
   * 3. Cada ficha muestra el ID del jugador con su color característico.
   * 
   * 🔄 Las posiciones se manejan de forma circular (posición % número_de_casillas).
   */
  renderTokens(players){
    // Limpiar todas las fichas existentes
    this._tileTokenDivs.forEach(div => { if (div) div.innerHTML=''; });
    
    // Añadir fichas según la posición de cada jugador (índice 0 es la esquina superior-izquierda "Salida")
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

  /**
   * Muestra un mensaje de notificación temporal.
   * 
   * @param {string} msg - Mensaje a mostrar.
   * 
   * 📝 Implementación actual: Solo registra en la consola.
   * En una implementación completa, podría mostrar un toast o notification banner.
   */
  toast(msg){ 
    console.log('[UI]', msg); 
  }
}
