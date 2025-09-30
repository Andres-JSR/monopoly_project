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
    el.innerHTML = `
      ${title ? `<strong>${title}</strong>` : ""}
      <span>${message}</span>
    `;
    this.container.appendChild(el);
    const kill = () => el.remove();
    el.addEventListener("animationend", (e) => {
      if (e.animationName === "toast-out") kill();
    });
    setTimeout(kill, timeout + 600);
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
