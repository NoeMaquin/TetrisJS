class Game {
  constructor(ctx, players) {
    this.ctx = ctx;
    this.players = players;
    this.board = new Board(10, 20); // tablero 10x20
  }

  start() {
    this.loop();
  }

  loop() {
    this.board.draw(this.ctx);
    requestAnimationFrame(() => this.loop());
  }
}
