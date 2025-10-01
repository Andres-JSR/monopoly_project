/**
 * Clase que gestiona todos los modales (ventanas emergentes) del juego de Monopoly.
 * 
 * Proporciona modales para:
 * - Compra de propiedades.
 * - Gestión de propiedades (construir, hipotecar).
 * - Mostrar posiciones finales.
 */
export class Modals {
  /**
   * Crea una nueva instancia del gestor de modales.
   *
   * @param {HTMLElement} root - Elemento HTML donde se montarán los modales.
   */
  constructor(root) {
    /** @type {HTMLElement} Contenedor donde se renderizarán los modales */
    this.root = root;
  }

  /**
   * Método privado que crea y muestra un modal genérico.
   *
   * @private
   * @param {Object} param0 - Configuración del modal.
   * @param {string} param0.title - Título del modal.
   * @param {string|HTMLElement} param0.body - Contenido del modal (HTML string o elemento).
   * @param {Array<Object>} [param0.actions=[]] - Array de botones de acción.
   * @param {string} param0.actions[].label - Texto del botón.
   * @param {boolean} [param0.actions[].primary] - Si es el botón principal (destacado).
   * @param {Function} [param0.actions[].onClick] - Función a ejecutar al hacer clic.
   *
   * 🎨 Estructura del modal:
   * - Backdrop (fondo oscuro semi-transparente).
   * - Modal con header, contenido y footer.
   * - Botón de cerrar (✕) en el header.
   * - Botones de acción en el footer.
   */
  _open({ title, body, actions = [] }) {
    const backdrop = document.createElement("div");
    backdrop.className = "modal__backdrop";
    const modal = document.createElement("div");
    modal.className = "modal";
    const header = document.createElement("header");
    const h3 = document.createElement("h3");
    h3.textContent = title;
    const close = document.createElement("button");
    close.textContent = "✕";
    close.className = "ghost";
    close.onclick = () => backdrop.remove();
    header.append(h3, close);
    const content = document.createElement("div");
    if (typeof body === "string") content.innerHTML = `<p>${body}</p>`;
    else content.appendChild(body);
    const footer = document.createElement("div");
    footer.className = "actions";
    for (const a of actions) {
      const btn = document.createElement("button");
      btn.textContent = a.label;
      if (a.primary) btn.classList.add("primary");
      btn.onclick = () => {
        a.onClick?.();
        backdrop.remove();
      };
      footer.appendChild(btn);
    }
    modal.append(header, content, footer);
    backdrop.appendChild(modal);
    this.root.appendChild(backdrop);
  }

  /**
   * Muestra un modal para comprar una propiedad.
   *
   * @param {Object} param0 - Configuración del modal de compra.
   * @param {Player} param0.player - Jugador que puede comprar la propiedad.
   * @param {Property} param0.prop - Propiedad disponible para compra.
   * @param {Function} param0.onBuy - Función a ejecutar si el jugador decide comprar.
   *
   * 📋 Información mostrada:
   * - Color de la propiedad (franja visual).
   * - Nombre de la propiedad.
   * - Precio de compra.
   * - Renta base que se cobrará.
   *
   * 🔘 Acciones disponibles:
   * - "Cancelar": Cierra el modal sin comprar.
   * - "Comprar $XXX": Ejecuta la compra (botón principal).
   */
  buyProperty({ player, prop, onBuy }) {
    const body = document.createElement("div");
    body.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px">
        <div class="stripe" style="height:12px;width:36px;background:${
          prop.color || "#000"
        };border:2px solid #000"></div>
        <strong>${prop.name}</strong>
      </div>
      <div style="margin-top:8px;font-size:12px">Precio: $${prop.price}</div>
      <div style="margin-top:6px;font-size:12px">Renta base: $${
        prop.rent?.base ?? 0
      }</div>
    `;
    this._open({
      title: "Comprar propiedad",
      body,
      actions: [
        { label: "Cancelar" },
        { label: `Comprar $${prop.price}`, primary: true, onClick: onBuy },
      ],
    });
  }

  /**
   * Muestra un modal para gestionar una propiedad (construir casas/hotel, hipotecar).
   *
   * @param {Object} param0 - Configuración del modal de gestión.
   * @param {Player} param0.player - Jugador dueño de la propiedad.
   * @param {Property} param0.prop - Propiedad a gestionar.
   * @param {Function} param0.onChange - Función callback que recibe la acción seleccionada.
   *
   * 📋 Información mostrada:
   * - Nombre de la propiedad.
   * - Dueño actual ("Tú" si es el jugador, o "Jugador X").
   * - Número de casas construidas.
   * - Si tiene hotel construido.
   * - Estado de hipoteca.
   *
   * 🔧 Acciones disponibles (solo si eres el dueño):
   * - **Si no está hipotecada:**
   *   - "Construir Casa ($100)": Construye una casa.
   *   - "Construir Hotel ($250)": Solo si tiene 4 casas.
   *   - "Hipotecar (+$)": Obtiene dinero hipotecando la propiedad.
   * - **Si está hipotecada:**
   *   - "Levantar Hipoteca (-10%)": Paga para recuperar la propiedad.
   *
   * 📞 Callback `onChange`:
   * Recibe un string con la acción: 'house', 'hotel', 'mortgage', 'redeem'.
   */
  manageProperty({ player, prop, onChange }) {
    const canMortgage = !prop.mortgaged && prop.ownerId === player.id;
    const canRedeem = prop.mortgaged && prop.ownerId === player.id;
    const mortValue = Number(
      prop.mortgage ?? Math.floor((prop.price || 0) / 2) ?? 0
    );
    const redeemValue = Math.ceil(mortValue * 1.1);

    // Evita backticks anidados: calcula el rótulo del dueño antes
    const ownerLabel =
      prop.ownerId === player.id ? "Tú" : "Jugador " + (prop.ownerId ?? "—");

    const wrap = document.createElement("div");
    wrap.innerHTML = `
    <div><strong>${prop.name}</strong></div>
    <div style="margin:6px 0">Dueño: ${ownerLabel}</div>
    <div>Casas: ${prop.houses} ${prop.hotel ? "(Hotel)" : ""}</div>
    <div>Hipotecada: ${prop.mortgaged ? "Sí" : "No"}</div>
  `;

    const actions = [];
    if (prop.ownerId === player.id) {
      if (!prop.mortgaged) {
        actions.push({
          label: "Construir Casa (100)",
          onClick: () => onChange?.("house"),
        });
        if (prop.houses === 4 && !prop.hotel) {
          actions.push({
            label: "Construir Hotel (250)",
            onClick: () => onChange?.("hotel"),
          });
        }
        actions.push({
          label: `Hipotecar (+$${mortValue})`,
          onClick: () => onChange?.("mortgage"),
        });
      } else {
        actions.push({
          label: `Levantar Hipoteca (-$${redeemValue})`,
          onClick: () => onChange?.("redeem"),
        });
      }
    }
    actions.push({ label: "Cerrar", primary: true });

    this._open({ title: `Gestionar ${prop.name}`, body: wrap, actions });
  }
  showStandings(standings) {
    const body = document.createElement("div");
    body.innerHTML = `
    <ul style="list-style:none;padding:0;margin:0;display:grid;gap:8px">
      ${standings
        .map(
          (s, i) => `
        <li style="display:flex;gap:10px;align-items:center;border:3px solid var(--ink);border-radius:8px;padding:8px;background:var(--panel);color:#eaf5f2">
          <span style="width:28px;text-align:center;font-weight:700">${
            i + 1
          }</span>
          <img src="https://flagsapi.com/${(
            s.country || "US"
          ).toUpperCase()}/flat/24.png" alt="" />
          <strong style="min-width:120px">${s.nick}</strong>
          <span style="margin-left:auto">$${s.score}</span>
        </li>`
        )
        .join("")}
    </ul>
  `;
   this._open({
     title: "Posiciones finales",
     body,
     actions: [
       { label: "Cerrar", primary: true },
       {
         label: "Volver al inicio",
         onClick: () => {
           document.getElementById("gameRoot")?.classList.add("hidden");
           document.getElementById("gameFooter")?.classList.add("hidden");
           document.getElementById("startScreen")?.classList.remove("hidden");
         },
       },
     ],
   });

  }
}
