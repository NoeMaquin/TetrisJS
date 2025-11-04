class Board {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.grid = Array.from({ length: height }, () => Array(width).fill(0));
  }

  draw(ctx) {
    const blockSize = 32;
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        ctx.strokeStyle = "#222";
        ctx.strokeRect(x * blockSize, y * blockSize, blockSize, blockSize);
      }
    }
  }
}
