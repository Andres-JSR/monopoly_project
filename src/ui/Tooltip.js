export class Tooltip {
  constructor(root){ this.root = root; this.tip = null; }
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
  hide(){
    if (this.tip){ this.tip.remove(); this.tip = null; }
  }
}
