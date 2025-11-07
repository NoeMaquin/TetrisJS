// BOARD CLASS
class Board {
  constructor(team) {
    this.team = team;
    this.grid = Array(CONSTANTS.BOARD_HEIGHT)
      .fill(null)
      .map(() => Array(CONSTANTS.BOARD_WIDTH).fill(0));
    this.currentPiece = null;
    this.nextPiece = null;
    this.score = 0;
    this.lines = 0;
    this.level = 1;
    this.cpu = 0;
    this.gameOver = false;

    // Estados de habilidades
    this.ddosActive = false;
    this.ddosTimer = null;
    this.malwareBlocks = [];
    this.spoofActive = false;
    this.spoofTimer = null;
    this.ransomActive = false;
    this.firewallActive = false;
    this.honeypotActive = false;

    this.canvas = document.getElementById(
      `board${team.charAt(0).toUpperCase() + team.slice(1)}`
    );
    this.nextCanvas = document.getElementById(
      `next${team.charAt(0).toUpperCase() + team.slice(1)}`
    );
    this.ctx = this.canvas.getContext("2d");
    this.nextCtx = this.nextCanvas.getContext("2d");
    this.overlay = document.getElementById(
      `overlay${team.charAt(0).toUpperCase() + team.slice(1)}`
    );
  }

  generatePiece() {
    const types = ["I", "O", "T", "S", "Z", "J", "L"];
    const randomType = types[Math.floor(Math.random() * types.length)];
    return new Piece(randomType);
  }

  spawnPiece() {
    this.currentPiece = this.nextPiece || this.generatePiece();
    this.nextPiece = this.generatePiece();

    if (this.currentPiece) {
      this.currentPiece.x = Math.floor(
        (CONSTANTS.BOARD_WIDTH - this.currentPiece.shape[0].length) / 2
      );
      this.currentPiece.y = 0;
    }

    if (this.checkCollision(this.currentPiece)) {
      this.gameOver = true;
      return false;
    }
    return true;
  }

  checkCollision(piece, offsetX = 0, offsetY = 0) {
    const shape = piece.getShape();
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          const newX = piece.x + x + offsetX;
          const newY = piece.y + y + offsetY;
          if (
            newX < 0 ||
            newX >= CONSTANTS.BOARD_WIDTH ||
            newY >= CONSTANTS.BOARD_HEIGHT
          ) {
            return true;
          }
          if (newY >= 0 && this.grid[newY][newX]) {
            return true;
          }
        }
      }
    }
    return false;
  }

  moveDown() {
    if (!this.currentPiece || this.gameOver) return false;

    // Si DDOS está activo, caída instantánea
    if (this.ddosActive) {
      this.hardDrop();
      return false;
    }

    if (!this.checkCollision(this.currentPiece, 0, 1)) {
      this.currentPiece.move(0, 1);
      return true;
    } else {
      this.lockPiece();
      return false;
    }
  }

  moveHorizontal(direction) {
    if (!this.currentPiece || this.gameOver) return;
    if (!this.checkCollision(this.currentPiece, direction, 0)) {
      this.currentPiece.move(direction, 0);
    }
  }

  rotate() {
    if (!this.currentPiece || this.gameOver) return;
    this.currentPiece.rotate();
    if (this.checkCollision(this.currentPiece)) {
      this.currentPiece.undoRotate();
    }
  }

  hardDrop() {
    if (!this.currentPiece || this.gameOver) return;
    let dropDistance = 0;
    while (!this.checkCollision(this.currentPiece, 0, 1)) {
      this.currentPiece.move(0, 1);
      dropDistance++;
    }
    this.score += dropDistance * 2;
    this.lockPiece();
  }

  lockPiece() {
    const shape = this.currentPiece.getShape();
    const color = this.currentPiece.isMalware
      ? CONSTANTS.COLORS.MALWARE
      : this.currentPiece.color;

    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          const gridY = this.currentPiece.y + y;
          const gridX = this.currentPiece.x + x;
          if (gridY >= 0) {
            this.grid[gridY][gridX] = color;

            // Marcar bloques de malware
            if (this.currentPiece.isMalware) {
              this.malwareBlocks.push({
                x: gridX,
                y: gridY,
                timer: 10000,
              });
            }
          }
        }
      }
    }

    this.clearLines();
    this.spawnPiece();
  }

  clearLines() {
    let linesCleared = 0;
    let clearedRows = [];

    // Revisar todas las líneas de abajo hacia arriba
    for (let y = CONSTANTS.BOARD_HEIGHT - 1; y >= 0; y--) {
      // Una línea está completa si todos los bloques tienen color (no son 0)
      // PERO permitimos que se limpien líneas con malware también
      const isLineFull = this.grid[y].every((cell) => cell !== 0);

      if (isLineFull) {
        clearedRows.push(y);
        this.grid.splice(y, 1);
        this.grid.unshift(Array(CONSTANTS.BOARD_WIDTH).fill(0));
        linesCleared++;
        y++; // Revisar la misma posición de nuevo
      }
    }

    // Limpiar bloques de malware en líneas eliminadas
    this.malwareBlocks = this.malwareBlocks.filter(
      (block) => !clearedRows.includes(block.y)
    );

    if (linesCleared > 0) {
      this.lines += linesCleared;
      const points = [0, 100, 300, 500, 800];
      this.score += points[linesCleared] * this.level;

      // Calcular nivel
      const oldLevel = this.level;
      this.level = Math.floor(this.lines / 10) + 1;

      // Generar CPU basado en TOTAL de líneas acumuladas
      // Cada 2 líneas totales = 1 CPU
      const totalCPU = Math.floor(this.lines / 2);
      const cpuGained = totalCPU - this.cpu;

      if (cpuGained > 0) {
        this.cpu = totalCPU;
        console.log(
          `${this.team} ahora tiene ${this.lines} líneas totales → ${this.cpu} CPU (+${cpuGained})`
        );
      }

      // BONUS: Tetris (4 líneas de una vez) envía ataque
      if (linesCleared === 4) {
        console.log(`${this.team} hizo TETRIS!`);

        // Enviar ataque de 4 líneas al oponente
        const opponent =
          Game.boards[this.team === "blue" ? "red" : "blue"];
        if (opponent) {
          if (!opponent.firewallActive) {
            opponent.addGarbageLines(4);
            Game.showStatus(
              `${this.team.toUpperCase()} TEAM: TETRIS! 4 líneas enviadas!`
            );
          } else {
            opponent.firewallActive = false;
            opponent.overlay.classList.remove("active");
            Game.showStatus(`FIREWALL bloqueó el ataque!`);
          }
        }
      }

      // Limpiar ransom si se cumplen 2 líneas o más
      if (this.ransomActive && linesCleared >= 2) {
        this.ransomActive = false;
        this.overlay.classList.remove("active");
        Game.showStatus(`${this.team.toUpperCase()}: Ransom limpiado!`);
      }
    }
  }

  addGarbageLines(count) {
    for (let i = 0; i < count; i++) {
      this.grid.shift();
      const garbageLine = Array(CONSTANTS.BOARD_WIDTH).fill(
        CONSTANTS.COLORS.GARBAGE
      );
      const hole = Math.floor(Math.random() * CONSTANTS.BOARD_WIDTH);
      garbageLine[hole] = 0;
      this.grid.push(garbageLine);
    }
  }

  removeBottomLines(count) {
    for (let i = 0; i < count; i++) {
      this.grid.pop();
      this.grid.unshift(Array(CONSTANTS.BOARD_WIDTH).fill(0));
    }
  }

  draw() {
    // Limpiar canvas principal
    this.ctx.fillStyle = "#0a0e27";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Dibujar grid
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

    // Dibujar piezas fijas
    for (let y = 0; y < CONSTANTS.BOARD_HEIGHT; y++) {
      for (let x = 0; x < CONSTANTS.BOARD_WIDTH; x++) {
        if (this.grid[y][x]) {
          this.drawBlock(x, y, this.grid[y][x]);
        }
      }
    }

    // Dibujar pieza actual
    if (this.currentPiece) {
      const shape = this.currentPiece.getShape();
      for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
          if (shape[y][x]) {
            this.drawBlock(
              this.currentPiece.x + x,
              this.currentPiece.y + y,
              this.currentPiece.color
            );
          }
        }
      }
    }

    // Dibujar siguiente pieza (spoof o real)
    this.drawNextPiece();

    // Actualizar stats
    this.updateStats();
  }

  drawBlock(x, y, color) {
    const px = x * CONSTANTS.BLOCK_SIZE;
    const py = y * CONSTANTS.BLOCK_SIZE;
    const size = CONSTANTS.BLOCK_SIZE;

    this.ctx.fillStyle = color;
    this.ctx.fillRect(px, py, size, size);

    this.ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
    this.ctx.fillRect(px, py, size, size / 4);

    this.ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
    this.ctx.strokeRect(px, py, size, size);
  }

  drawNextPiece() {
    this.nextCtx.fillStyle = "#0a0e27";
    this.nextCtx.fillRect(
      0,
      0,
      this.nextCanvas.width,
      this.nextCanvas.height
    );

    if (!this.nextPiece) return;

    // Si spoof está activo, mostrar pieza falsa
    let pieceToShow = this.nextPiece;
    if (this.spoofActive) {
      pieceToShow = this.generatePiece();
    }

    const shape = pieceToShow.getShape();
    const blockSize = 25;
    const offsetX =
      (this.nextCanvas.width - shape[0].length * blockSize) / 2;
    const offsetY =
      (this.nextCanvas.height - shape.length * blockSize) / 2;

    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          const px = offsetX + x * blockSize;
          const py = offsetY + y * blockSize;
          this.nextCtx.fillStyle = pieceToShow.color;
          this.nextCtx.fillRect(px, py, blockSize - 2, blockSize - 2);
          this.nextCtx.strokeStyle = pieceToShow.color;
          this.nextCtx.lineWidth = 2;
          this.nextCtx.strokeRect(px, py, blockSize - 2, blockSize - 2);
        }
      }
    }
  }

  updateStats() {
    const cap = this.team.charAt(0).toUpperCase() + this.team.slice(1);
    document.getElementById(`score${cap}`).textContent = this.score;
    document.getElementById(`lines${cap}`).textContent = this.lines;
    document.getElementById(`level${cap}`).textContent = this.level;
    document.getElementById(`cpu${cap}`).textContent = this.cpu;
  }

  update() {
    // Actualizar timers de malware
    this.malwareBlocks = this.malwareBlocks.filter((block) => {
      block.timer -= 16;
      if (block.timer <= 0) {
        if (
          this.grid[block.y] &&
          this.grid[block.y][block.x] === CONSTANTS.COLORS.MALWARE
        ) {
          this.grid[block.y][block.x] = 0;
        }
        return false;
      }
      return true;
    });
  }
}
