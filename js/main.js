const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const btnSolo = document.getElementById("btnSolo");
const btnDuo = document.getElementById("btnDuo");

btnSolo.addEventListener("click", () => startGame(1));
btnDuo.addEventListener("click", () => startGame(2));

function startGame(players) {
  document.querySelector(".menu").style.display = "none";
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const game = new Game(ctx, players);
  game.start();
}
