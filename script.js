const scoreEl = document.querySelector("#score");
const timeEl = document.querySelector("#time");
const bestEl = document.querySelector("#best");
const target = document.querySelector("#target");
const arena = document.querySelector("#arena");
const message = document.querySelector("#message");
const startButton = document.querySelector("#start");

let score = 0;
let timeLeft = 30;
let timerId = null;
let playing = false;
let best = Number(localStorage.getItem("new-game-best") || 0);
bestEl.textContent = best;

function moveTarget() {
  const maxX = Math.max(0, arena.clientWidth - target.offsetWidth);
  const maxY = Math.max(0, arena.clientHeight - target.offsetHeight);
  target.style.left = Math.round(Math.random() * maxX) + "px";
  target.style.top = Math.round(Math.random() * maxY) + "px";
}

function finishGame() {
  playing = false;
  clearInterval(timerId);
  target.hidden = true;
  message.hidden = false;
  message.textContent = `Time's up! You scored ${score} points.`;
  startButton.textContent = "PLAY AGAIN";
  if (score > best) {
    best = score;
    localStorage.setItem("new-game-best", String(best));
    bestEl.textContent = best;
  }
}

function startGame() {
  clearInterval(timerId);
  score = 0;
  timeLeft = 30;
  playing = true;
  scoreEl.textContent = score;
  timeEl.textContent = timeLeft;
  message.hidden = true;
  target.hidden = false;
  startButton.textContent = "PLAYING...";
  moveTarget();

  timerId = setInterval(() => {
    timeLeft -= 1;
    timeEl.textContent = timeLeft;
    if (timeLeft <= 0) finishGame();
  }, 1000);
}

target.addEventListener("click", () => {
  if (!playing) return;
  score += 1;
  scoreEl.textContent = score;
  moveTarget();
});

startButton.addEventListener("click", () => {
  if (!playing) startGame();
});
window.addEventListener("resize", () => {
  if (playing) moveTarget();
});
