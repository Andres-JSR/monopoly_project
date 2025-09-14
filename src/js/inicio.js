document.addEventListener("DOMContentLoaded", () => {
  const numPlayersSelect = document.getElementById("numPlayers");
  const playersContainer = document.getElementById("playersContainer");
  const startButton = document.getElementById("startGame");

  // Colores disponibles (proximamente mejorables)
const availableColors = [
  { code: "#ff0000", name: "Rojo" },
  { code: "#ffeb3b", name: "Amarillo" },
  { code: "#4caf50", name: "Verde" },
  { code: "#9c27b0", name: "Violeta" }
];
 // Figuras disponibles (proximamente cargar desde iconos mejorados)
  const availableFigures = [
    { id: "car", name: "Carro", icon: "🚗" },
    { id: "moto", name: "Moto", icon: "🏍️" },
    { id: "boat", name: "Barco", icon: "⛵" },
    { id: "plane", name: "Avión", icon: "✈️" }
  ];

  // Render inicial
  renderPlayers(numPlayersSelect.value);

  numPlayersSelect.addEventListener("change", () => {
    renderPlayers(numPlayersSelect.value);
  });

  function renderPlayers(num) {
    playersContainer.innerHTML = "";
    for (let i = 1; i <= num; i++) {
      const div = document.createElement("div");
      div.classList.add("player-config");
      div.innerHTML = `
        <h2>Jugador ${i}</h2>
        <label>Nickname: </label>
        <input type="text" id="nick${i}" required><br>

        <label>Color: </label>
        <select id="color${i}">
        ${availableColors.map(c => 
            `<option value="${c.code}" style="background:${c.code}; color:${c.code};">${c.name}</option>`).join("")}
        </select><br>

        <label>Figura: </label>
        <select id="figure${i}">
          ${availableFigures.map(f => `<option value="${f.id}">${f.icon} ${f.name}</option>`).join("")}
        </select><br>

        <label>País: </label>
        <select id="country${i}">
          <option value="">Cargando...</option>
        </select>
      `;
      
      //implementar bandera proximamente <img src="https://flagsapi.com/${country.code}/flat/16.png">
      
      playersContainer.appendChild(div);
      loadCountries(i);
    }
  }

  async function loadCountries(playerIndex) {
    try {
      const res = await fetch("http://127.0.0.1:5000/countries");
      const countries = await res.json();
      const select = document.getElementById(`country${playerIndex}`);
      select.innerHTML = "";
      countries.forEach(country => {
        const opt = document.createElement("option");
        opt.value = country.code;
        opt.textContent = country.name;
        // En el futuro: opt.innerHTML = `<img src="https://flagsapi.com/${country.code}/flat/16.png"> ${country.name}`;
        select.appendChild(opt);
      });
    } catch (error) {
      console.error("Error cargando países:", error);
    }
  }

  startButton.addEventListener("click", () => {
    // Validaciones: nickname vacío, colores y figuras repetidos
    const players = [];
    const usedColors = new Set();
    const usedFigures = new Set();

    for (let i = 1; i <= numPlayersSelect.value; i++) {
      const nickname = document.getElementById(`nick${i}`).value.trim();
      const color = document.getElementById(`color${i}`).value;
      const figure = document.getElementById(`figure${i}`).value;
      const country = document.getElementById(`country${i}`).value;

      if (!nickname) {
        alert(`Jugador ${i} debe ingresar un nickname`);
        return;
      }
      if (usedColors.has(color)) {
        alert(`El color ${color} ya está en uso`);
        return;
      }
      if (usedFigures.has(figure)) {
        alert(`La figura ${figure} ya está en uso`);
        return;
      }

      usedColors.add(color);
      usedFigures.add(figure);

      players.push({ nickname, color, figure, country });
    }

    console.log("Jugadores configurados:", players);
    alert("¡Configuración correcta! Aquí iría la redirección a game.html");
    // window.location.href = "game.html";
  });
});
