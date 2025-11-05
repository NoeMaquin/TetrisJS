class Board {
  constructor(team) {
    this.team = team; // 'blue' o 'red'
    this.grid = this.createEmptyGrid();
    this.currentPiece = null;
    this.nextPiece = null;
    this.score = 0;
    this.lines = 0;
    this.level = 1;
    this.gameOver = false;

    this.canvas = document.getElementById(`board${this.capitalize(team)}`);
    this.nextCanvas = document.getElementById(`next${this.capitalize(team)}`);
    this.ctx = this.canvas.getContext("2d");
    this.nextCtx = this.nextCanvas.getContext("2d");

    // Ajustar tamaño del canvas principal
    this.canvas.width = CONSTANTS.BOARD_WIDTH * CONSTANTS.BLOCK_SIZE;
    this.canvas.height = CONSTANTS.BOARD_HEIGHT * CONSTANTS.BLOCK_SIZE;
  }

  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // Crear grid vacío
  createEmptyGrid() {
    return Array(CONSTANTS.BOARD_HEIGHT)
      .fill(null)
      .map(() => Array(CONSTANTS.BOARD_WIDTH).fill(0));
  }

  // Generar pieza aleatoria
  generatePiece() {
    const types = ["I", "O", "T", "S", "Z", "J", "L"];
    const randomType = types[Math.floor(Math.random() * types.length)];
    return new Piece(randomType);
  }

  // Iniciar nueva pieza
  spawnPiece() {
    this.currentPiece = this.nextPiece || this.generatePiece();
    this.nextPiece = this.generatePiece();

    // Centrar la pieza al inicio
    if (this.currentPiece) {
      this.currentPiece.x = Math.floor(
        (CONSTANTS.BOARD_WIDTH - this.currentPiece.shape[0].length) / 2
      );
      this.currentPiece.y = 0;
    }

    // Verificar game over
    if (this.checkCollision(this.currentPiece)) {
      this.gameOver = true;
      return false;
    }

    return true;
  }

  // Verificar colisión
  checkCollision(piece, offsetX = 0, offsetY = 0) {
    const shape = piece.getShape();

    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          const newX = piece.x + x + offsetX;
          const newY = piece.y + y + offsetY;

          // Verificar límites
          if (
            newX < 0 ||
            newX >= CONSTANTS.BOARD_WIDTH ||
            newY >= CONSTANTS.BOARD_HEIGHT
          ) {
            return true;
          }

          // Verificar colisión con piezas fijas
          if (newY >= 0 && this.grid[newY][newX]) {
            return true;
          }
        }
      }
    }
    return false;
  }

  // Mover pieza hacia abajo
  moveDown() {
    if (!this.currentPiece || this.gameOver) return false;

    if (!this.checkCollision(this.currentPiece, 0, 1)) {
      this.currentPiece.move(0, 1);
      return true;
    } else {
      this.lockPiece();
      return false;
    }
  }

  // Mover pieza lateralmente
  moveHorizontal(direction) {
    if (!this.currentPiece || this.gameOver) return;

    if (!this.checkCollision(this.currentPiece, direction, 0)) {
      this.currentPiece.move(direction, 0);
    }
  }

  // Rotar pieza
  rotate() {
    if (!this.currentPiece || this.gameOver) return;

    this.currentPiece.rotate();

    if (this.checkCollision(this.currentPiece)) {
      this.currentPiece.undoRotate();
    }
  }

  // Caída rápida
  hardDrop() {
    if (!this.currentPiece || this.gameOver) return;

    let dropDistance = 0;
    while (!this.checkCollision(this.currentPiece, 0, 1)) {
      this.currentPiece.move(0, 1);
      dropDistance++;
    }

    this.score += dropDistance * CONSTANTS.POINTS.HARD_DROP;
    this.lockPiece();
  }

  // Fijar pieza en el tablero
  lockPiece() {
    const shape = this.currentPiece.getShape();

    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          const gridY = this.currentPiece.y + y;
          const gridX = this.currentPiece.x + x;

          if (gridY >= 0) {
            this.grid[gridY][gridX] = this.currentPiece.color;
          }
        }
      }
    }

    this.clearLines();
    this.spawnPiece();
  }

  // Limpiar líneas completas
  clearLines() {
    let linesCleared = 0;

    for (let y = CONSTANTS.BOARD_HEIGHT - 1; y >= 0; y--) {
      if (this.grid[y].every((cell) => cell !== 0)) {
        this.grid.splice(y, 1);
        this.grid.unshift(Array(CONSTANTS.BOARD_WIDTH).fill(0));
        linesCleared++;
        y++; // Revisar la misma línea de nuevo
      }
    }

    if (linesCleared > 0) {
      this.lines += linesCleared;
      this.updateScore(linesCleared);
      this.updateLevel();
    }
  }

  // Actualizar puntuación
  updateScore(linesCleared) {
    const points = [
      0,
      CONSTANTS.POINTS.SINGLE,
      CONSTANTS.POINTS.DOUBLE,
      CONSTANTS.POINTS.TRIPLE,
      CONSTANTS.POINTS.TETRIS,
    ];
    this.score += points[linesCleared] * this.level;
  }

  // Actualizar nivel
  updateLevel() {
    this.level = Math.floor(this.lines / 10) + 1;
  }

  // Dibujar tablero
  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Dibujar grid
    this.drawGrid();

    // Dibujar piezas fijas
    this.drawLockedPieces();

    // Dibujar pieza actual
    if (this.currentPiece) {
      this.drawPiece(this.currentPiece);
    }

    // Dibujar siguiente pieza
    this.drawNextPiece();

    // Actualizar stats
    this.updateStats();
  }

  // Dibujar grid
  drawGrid() {
    const color = this.team === "blue" ? "#00ccff" : "#ff0040";
    this.ctx.strokeStyle = color;
    this.ctx.globalAlpha = 0.1;

    for (let x = 0; x <= CONSTANTS.BOARD_WIDTH; x++) {
      this.ctx.beginPath();
      this.ctx.moveTo(x * CONSTANTS.BLOCK_SIZE, 0);
      this.ctx.lineTo(x * CONSTANTS.BLOCK_SIZE, this.canvas.height);
      this.ctx.stroke();
    }

    for (let y = 0; y <= CONSTANTS.BOARD_HEIGHT; y++) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y * CONSTANTS.BLOCK_SIZE);
      this.ctx.lineTo(this.canvas.width, y * CONSTANTS.BLOCK_SIZE);
      this.ctx.stroke();
    }

    this.ctx.globalAlpha = 1;
  }

  // Dibujar piezas fijas
  drawLockedPieces() {
    for (let y = 0; y < CONSTANTS.BOARD_HEIGHT; y++) {
      for (let x = 0; x < CONSTANTS.BOARD_WIDTH; x++) {
        if (this.grid[y][x]) {
          this.drawBlock(x, y, this.grid[y][x]);
        }
      }
    }
  }

  // Dibujar pieza actual
  drawPiece(piece) {
    const shape = piece.getShape();

    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          this.drawBlock(piece.x + x, piece.y + y, piece.color);
        }
      }
    }
  }

  // Dibujar bloque individual
  drawBlock(x, y, color) {
    const px = x * CONSTANTS.BLOCK_SIZE;
    const py = y * CONSTANTS.BLOCK_SIZE;
    const size = CONSTANTS.BLOCK_SIZE;

    // Fondo del bloque
    this.ctx.fillStyle = color;
    this.ctx.fillRect(px, py, size, size);

    // Efecto de luz
    this.ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
    this.ctx.fillRect(px, py, size, size / 4);

    // Borde
    this.ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
    this.ctx.strokeRect(px, py, size, size);
  }

  // Dibujar siguiente pieza
  drawNextPiece() {
    this.nextCtx.clearRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);

    if (!this.nextPiece) return;

    const shape = this.nextPiece.getShape();
    const blockSize = 25;
    const offsetX = (this.nextCanvas.width - shape[0].length * blockSize) / 2;
    const offsetY = (this.nextCanvas.height - shape.length * blockSize) / 2;

    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          const px = offsetX + x * blockSize;
          const py = offsetY + y * blockSize;

          this.nextCtx.fillStyle = this.nextPiece.color;
          this.nextCtx.fillRect(px, py, blockSize - 2, blockSize - 2);

          this.nextCtx.strokeStyle = this.nextPiece.color;
          this.nextCtx.lineWidth = 2;
          this.nextCtx.strokeRect(px, py, blockSize - 2, blockSize - 2);
        }
      }
    }
  }

  // Actualizar estadísticas en pantalla
  updateStats() {
    document.getElementById(`score${this.capitalize(this.team)}`).textContent =
      this.score;
    document.getElementById(`lines${this.capitalize(this.team)}`).textContent =
      this.lines;
    document.getElementById(`level${this.capitalize(this.team)}`).textContent =
      this.level;
  }
}
