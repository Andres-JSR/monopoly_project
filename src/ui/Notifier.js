// src/ui/Notifier.js
export class Notifier {
  constructor() {
    this.container = this.ensureContainer();
  }

  ensureContainer() {
    let el = document.getElementById("toastContainer");
    if (!el) {
      el = document.createElement("div");
      el.id = "toastContainer";
      el.className = "toast-container";
      document.body.appendChild(el);
    }
    return el;
  }

  show({ title, message, kind = "info", timeout = 4500 }) {
    const el = document.createElement("div");
    el.className = `toast ${kind}`;

    const icons = { success: "✅", info: "ℹ️", warn: "⚠️", error: "⛔" };
    el.innerHTML = `
    <span class="icon">${icons[kind] || "ℹ️"}</span>
    <div class="content">
      ${title ? `<strong>${title}</strong>` : ""}
      <span>${message}</span>
    </div>
    <button class="close" aria-label="Cerrar">&times;</button>
  `;

    this.container.appendChild(el);

    // Cerrar manual
    const remove = () => el.remove();
    el.querySelector(".close").addEventListener("click", remove);

    // Pausa al hover
    let timer = setTimeout(remove, timeout);
    el.addEventListener("mouseenter", () => clearTimeout(timer));
    el.addEventListener("mouseleave", () => {
      timer = setTimeout(remove, 1000);
    });

    // Fallback visible si la animación no corre
    requestAnimationFrame(() => {
      const st = getComputedStyle(el);
      if (st.opacity === "0" || st.animationName === "none") {
        el.classList.add("show");
      }
    });

    // También removemos al terminar la animación de salida (si existe)
    el.addEventListener("animationend", (e) => {
      if (e.animationName === "toast-out") remove();
    });
  }

  success(msg, title = "¡Bien!") {
    this.show({ title, message: msg, kind: "success" });
  }
  info(msg, title = "Aviso") {
    this.show({ title, message: msg, kind: "info" });
  }
  warn(msg, title = "Atención") {
    this.show({ title, message: msg, kind: "warn" });
  }
  error(msg, title = "Error") {
    this.show({ title, message: msg, kind: "error" });
  }
}
