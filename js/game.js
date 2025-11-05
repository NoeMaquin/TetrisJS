const Game = {
  boards: {
    blue: null,
    red: null,
  },

  players: {
    player1: null,
    player2: null,
  },

  gameLoop: null,
  dropInterval: CONSTANTS.INITIAL_SPEED,
  lastDropTime: 0,
  isPaused: false,

  init(firstPlayer, selectedTeam) {
    console.log("🎮 Iniciando juego...");
    console.log(`${firstPlayer} eligió: ${selectedTeam} team`);

    // Asignar equipos
    if (firstPlayer === "Jugador 1") {
      this.players.player1 = selectedTeam;
      this.players.player2 = selectedTeam === "blue" ? "red" : "blue";
    } else {
      this.players.player2 = selectedTeam;
      this.players.player1 = selectedTeam === "blue" ? "red" : "blue";
    }

    // Crear tableros
    this.boards.blue = new Board("blue");
    this.boards.red = new Board("red");

    // Generar primeras piezas
    this.boards.blue.spawnPiece();
    this.boards.red.spawnPiece();

    // Configurar controles
    this.setupControls();

    // Iniciar game loop
    this.start();

    console.log("✅ Juego iniciado");
  },

  setupControls() {
    document.addEventListener("keydown", (e) => {
      if (this.isPaused) return;

      // Controles Jugador 1 (WASD)
      const board1 = this.boards[this.players.player1];
      if (e.key === "a" || e.key === "A") board1.moveHorizontal(-1);
      if (e.key === "d" || e.key === "D") board1.moveHorizontal(1);
      if (e.key === "s" || e.key === "S") board1.moveDown();
      if (e.key === "w" || e.key === "W") board1.rotate();
      if (e.key === " ") board1.hardDrop();

      // Controles Jugador 2 (Flechas)
      const board2 = this.boards[this.players.player2];
      if (e.key === "ArrowLeft") board2.moveHorizontal(-1);
      if (e.key === "ArrowRight") board2.moveHorizontal(1);
      if (e.key === "ArrowDown") board2.moveDown();
      if (e.key === "ArrowUp") board2.rotate();

      this.draw();
    });

    // Botón pausa
    document.getElementById("btnPause").addEventListener("click", () => {
      this.togglePause();
    });
  },

  start() {
    this.lastDropTime = Date.now();
    this.gameLoop = setInterval(() => {
      this.update();
      this.draw(); // Asegurarse que se llame draw
    }, 16); // ~60 FPS
  },

  update() {
    if (this.isPaused) return;

    const currentTime = Date.now();

    if (currentTime - this.lastDropTime > this.dropInterval) {
      this.boards.blue.moveDown();
      this.boards.red.moveDown();
      this.lastDropTime = currentTime;
    }
  },

  draw() {
    this.boards.blue.draw();
    this.boards.red.draw();
  },

  togglePause() {
    this.isPaused = !this.isPaused;
    document.getElementById("btnPause").textContent = this.isPaused
      ? "REANUDAR"
      : "PAUSA";
  },

  endGame() {
    clearInterval(this.gameLoop);

    const winner = this.boards.blue.gameOver ? "RED TEAM" : "BLUE TEAM";
    alert(`¡GAME OVER!\n\n${winner} GANA!`);
  },
};
