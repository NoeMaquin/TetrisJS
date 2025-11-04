class Piece {
  constructor(shape, color) {
    this.shape = shape;
    this.color = color;
    this.x = 3;
    this.y = 0;
  }

  draw(ctx) {
    const blockSize = 32;
    ctx.fillStyle = this.color;
    this.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value) {
          ctx.fillRect(
            (this.x + x) * blockSize,
            (this.y + y) * blockSize,
            blockSize,
            blockSize
          );
        }
      });
    });
  }
}
