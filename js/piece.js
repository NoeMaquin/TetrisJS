class Piece {
  constructor(type) {
    this.type = type;
    this.shapes = CONSTANTS.SHAPES[type];
    this.rotationIndex = 0;
    this.shape = this.shapes[this.rotationIndex];
    this.color = CONSTANTS.COLORS[type];

    // Posición inicial (centro superior del tablero)
    this.x = Math.floor((CONSTANTS.BOARD_WIDTH - this.shape[0].length) / 2);
    this.y = 0;
  }

  // Obtener forma actual
  getShape() {
    return this.shape;
  }

  // Rotar pieza
  rotate() {
    this.rotationIndex = (this.rotationIndex + 1) % this.shapes.length;
    this.shape = this.shapes[this.rotationIndex];
  }

  // Deshacer rotación (para colisiones)
  undoRotate() {
    this.rotationIndex =
      this.rotationIndex === 0
        ? this.shapes.length - 1
        : this.rotationIndex - 1;
    this.shape = this.shapes[this.rotationIndex];
  }

  // Mover pieza
  move(dx, dy) {
    this.x += dx;
    this.y += dy;
  }

  // Deshacer movimiento (para colisiones)
  undoMove(dx, dy) {
    this.x -= dx;
    this.y -= dy;
  }

  // Clonar pieza
  clone() {
    const cloned = new Piece(this.type);
    cloned.x = this.x;
    cloned.y = this.y;
    cloned.rotationIndex = this.rotationIndex;
    cloned.shape = this.shape;
    return cloned;
  }
}
