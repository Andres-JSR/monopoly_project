/**
 * Clase que gestiona tooltips informativos que aparecen al hacer hover sobre elementos.
 * 
 * Los tooltips muestran información adicional sobre las casillas del tablero
 * sin interrumpir el flujo del juego.
 */
export class Tooltip {
  
  /**
   * Crea una nueva instancia del gestor de tooltips.
   * 
   * @param {HTMLElement} root - Elemento contenedor donde se renderizarán los tooltips.
   */
  constructor(root){ 
    /** @type {HTMLElement} Contenedor para los tooltips */
    this.root = root; 
    
    /** @type {HTMLElement|null} Tooltip actualmente mostrado */
    this.tip = null; 
  }

  /**
   * Muestra un tooltip con información específica.
   * 
   * @param {Object} param0 - Configuración del tooltip.
   * @param {string} param0.title - Título del tooltip.
   * @param {string|null} [param0.color] - Color de la franja superior (para propiedades).
   * @param {string[]} [param0.rows=[]] - Array de líneas de información a mostrar.
   * @param {HTMLElement} param0.targetEl - Elemento HTML de referencia para posicionar el tooltip.
   * 
   * 📍 Posicionamiento:
   * - Se posiciona cerca del elemento objetivo.
   * - Ajusta automáticamente los límites para no salirse de la pantalla.
   * - Mantiene un margen mínimo de 10px desde los bordes.
   * 
   * 🎨 Estructura visual:
   * - Franja de color opcional (para propiedades).
   * - Título destacado.
   * - Líneas de información adicional.
   */
  show({ title, color, rows = [], targetEl }){
    this.hide();
    const div = document.createElement('div');
    div.className = 'tooltip';
    const rect = targetEl.getBoundingClientRect();
    div.style.left = Math.max(10, rect.left + window.scrollX + 6) + 'px';
    div.style.top = Math.max(10, rect.top + window.scrollY - 10) + 'px';
    const stripe = color ? `<div class="stripe" style="background:${color}"></div>` : '';
    div.innerHTML = `${stripe}<h4>${title}</h4>` + rows.map(r => `<div class="row">${r}</div>`).join('');
    this.root.appendChild(div);
    this.tip = div;
  }

  /**
   * Oculta el tooltip actualmente mostrado.
   * 
   * Si no hay ningún tooltip visible, no hace nada.
   */
  hide(){
    if (this.tip){ this.tip.remove(); this.tip = null; }
  }
}
