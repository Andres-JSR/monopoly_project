export class Modals {
  constructor(root){ this.root = root; }
  _open({ title, body, actions = [] }){
    const backdrop = document.createElement('div');
    backdrop.className = 'modal__backdrop';
    const modal = document.createElement('div');
    modal.className = 'modal';
    const header = document.createElement('header');
    const h3 = document.createElement('h3'); h3.textContent = title;
    const close = document.createElement('button'); close.textContent = '✕'; close.className='ghost';
    close.onclick = ()=> backdrop.remove();
    header.append(h3, close);
    const content = document.createElement('div');
    if (typeof body === 'string') content.innerHTML = `<p>${body}</p>`; else content.appendChild(body);
    const footer = document.createElement('div'); footer.className = 'actions';
    for (const a of actions){
      const btn = document.createElement('button');
      btn.textContent = a.label; if (a.primary) btn.classList.add('primary');
      btn.onclick = ()=> { a.onClick?.(); backdrop.remove(); };
      footer.appendChild(btn);
    }
    modal.append(header, content, footer);
    backdrop.appendChild(modal); this.root.appendChild(backdrop);
  }
  buyProperty({ player, prop, onBuy }){
    const body = document.createElement('div');
    body.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px">
        <div class="stripe" style="height:12px;width:36px;background:${prop.color||'#000'};border:2px solid #000"></div>
        <strong>${prop.name}</strong>
      </div>
      <div style="margin-top:8px;font-size:12px">Precio: $${prop.price}</div>
      <div style="margin-top:6px;font-size:12px">Renta base: $${prop.rent?.base ?? 0}</div>
    `;
    this._open({
      title: "Comprar propiedad",
      body,
      actions: [
        { label:'Cancelar' },
        { label:`Comprar $${prop.price}`, primary:true, onClick: onBuy }
      ]
    });
  }
  manageProperty({ player, prop, onChange }){
    const wrap = document.createElement('div');
    wrap.innerHTML = `<div><strong>${prop.name}</strong></div>
      <div style="margin:6px 0">Dueño: ${prop.ownerId===player.id? 'Tú' : `Jugador ${prop.ownerId}`}</div>
      <div>Casas: ${prop.houses} ${prop.hotel?'(Hotel)':''}</div>
      <div>Hipotecada: ${prop.mortgaged? 'Sí':'No'}</div>`;
    const actions = [];
    if (prop.ownerId === player.id){
      if (!prop.mortgaged){
        actions.push({ label: 'Construir Casa (100)', onClick: ()=> onChange?.('house') });
        if (prop.houses === 4 && !prop.hotel) actions.push({ label:'Construir Hotel (250)', onClick: ()=> onChange?.('hotel') });
        actions.push({ label: 'Hipotecar (+$)', onClick: ()=> onChange?.('mortgage') });
      } else {
        actions.push({ label: 'Levantar Hipoteca (-10%)', onClick: ()=> onChange?.('redeem') });
      }
    }
    actions.push({ label: 'Cerrar', primary:true });
    this._open({ title:`Gestionar ${prop.name}`, body: wrap, actions });
  }
}
