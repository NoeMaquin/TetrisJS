// UI OBJECT
const UI = {
  screens: {},

  init() {
    this.screens.start = document.getElementById("startScreen");
    this.screens.menu = document.getElementById("menuScreen");
    this.screens.teamSelect = document.getElementById("teamSelectScreen");
    this.screens.game = document.getElementById("gameScreen");
    this.setupEventListeners();
  },

  setupEventListeners() {
    document
      .getElementById("btnStart")
      .addEventListener("click", () => this.showMenu());
    document
      .getElementById("btnBack")
      .addEventListener("click", () => this.showStart());
    document
      .getElementById("btn1v1")
      .addEventListener("click", () => this.startTeamSelection());
    document
      .getElementById("btnPause")
      .addEventListener("click", () => Game.togglePause());
    document.getElementById("btnQuit").addEventListener("click", () => {
      if (confirm("¿Seguro que quieres salir?")) Game.quit();
    });
  },

  showMenu() {
    this.hideAll();
    this.screens.menu.classList.remove("hidden");
  },

  showStart() {
    this.hideAll();
    this.screens.start.classList.remove("hidden");
  },

  hideAll() {
    Object.values(this.screens).forEach((screen) =>
      screen.classList.add("hidden")
    );
  },

  startTeamSelection() {
    this.hideAll();
    this.screens.teamSelect.classList.remove("hidden");

    const coin = document.getElementById("coin");
    const message = document.getElementById("teamMessage");
    const buttons = document.getElementById("teamButtons");

    coin.textContent = "?";
    message.textContent = "Sorteando...";
    buttons.classList.add("hidden");

    setTimeout(() => {
      const firstPlayer = Math.random() < 0.5 ? "Jugador 1" : "Jugador 2";
      coin.textContent = firstPlayer === "Jugador 1" ? "1" : "2";
      message.textContent = `${firstPlayer} elige primero`;
      buttons.classList.remove("hidden");

      document.querySelectorAll(".team-btn").forEach((btn) => {
        btn.onclick = (e) => {
          const team = e.currentTarget.getAttribute("data-team");
          this.startGame(firstPlayer, team);
        };
      });
    }, 1500);
  },

  startGame(firstPlayer, selectedTeam) {
    this.hideAll();
    this.screens.game.classList.remove("hidden");
    console.log(`${firstPlayer} eligió: ${selectedTeam} team`);
    Game.init(firstPlayer, selectedTeam);
  },
};
