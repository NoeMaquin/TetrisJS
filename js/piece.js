// PIECE CLASS
class Piece {
  constructor(type) {
    this.type = type;
    this.shapes = CONSTANTS.SHAPES[type];
    this.rotationIndex = 0;
    this.shape = this.shapes[this.rotationIndex];
    this.color = CONSTANTS.COLORS[type];
    this.x = Math.floor(
      (CONSTANTS.BOARD_WIDTH - this.shape[0].length) / 2
    );
    this.y = 0;
    this.isMalware = type === "MALWARE";
  }

  getShape() {
    return this.shape;
  }

  rotate() {
    this.rotationIndex = (this.rotationIndex + 1) % this.shapes.length;
    this.shape = this.shapes[this.rotationIndex];
  }

  undoRotate() {
    this.rotationIndex =
      this.rotationIndex === 0
        ? this.shapes.length - 1
        : this.rotationIndex - 1;
    this.shape = this.shapes[this.rotationIndex];
  }

  move(dx, dy) {
    this.x += dx;
    this.y += dy;
  }
}
