const cells = [...document.querySelectorAll(".cell")];
const statusText = document.querySelector("#statusText");
const scoreX = document.querySelector("#scoreX");
const scoreO = document.querySelector("#scoreO");
const scoreDraw = document.querySelector("#scoreDraw");
const nextRoundBtn = document.querySelector("#nextRoundBtn");
const resetBtn = document.querySelector("#resetBtn");
const confetti = document.querySelector("#confetti");

const winningLines = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

const scores = {
  X: 0,
  O: 0,
  draw: 0,
};

let board = Array(9).fill("");
let currentPlayer = "X";
let gameActive = true;

function setStatus(message) {
  statusText.textContent = message;
  statusText.classList.remove("bump");
  void statusText.offsetWidth;
  statusText.classList.add("bump");
}

function updateScores() {
  scoreX.textContent = scores.X;
  scoreO.textContent = scores.O;
  scoreDraw.textContent = scores.draw;
}

function getWinningLine() {
  return winningLines.find((line) => {
    const [first, second, third] = line;
    return board[first] && board[first] === board[second] && board[first] === board[third];
  });
}

function launchConfetti() {
  confetti.innerHTML = "";
  const colors = ["#ff4fb8", "#ff9f1c", "#27e8ff", "#8a5cff", "#6eff7f", "#ffe15c"];

  for (let piece = 0; piece < 38; piece += 1) {
    const sprinkle = document.createElement("span");
    sprinkle.style.left = `${Math.random() * 100}%`;
    sprinkle.style.background = colors[piece % colors.length];
    sprinkle.style.animationDelay = `${Math.random() * 0.45}s`;
    sprinkle.style.transform = `rotate(${Math.random() * 180}deg)`;
    confetti.appendChild(sprinkle);
  }
}

function finishRound(winner, winningLine) {
  gameActive = false;

  if (winner) {
    scores[winner] += 1;
    winningLine.forEach((index) => cells[index].classList.add("win"));
    setStatus(`Player ${winner} wins!`);
    launchConfetti();
  } else {
    scores.draw += 1;
    setStatus("It's a juicy draw!");
  }

  updateScores();
}

function handleMove(event) {
  const cell = event.currentTarget;
  const index = Number(cell.dataset.index);

  if (!gameActive || board[index]) {
    return;
  }

  board[index] = currentPlayer;
  cell.textContent = currentPlayer;
  cell.classList.add(currentPlayer.toLowerCase());
  cell.setAttribute("aria-label", `Cell ${index + 1}, Player ${currentPlayer}`);

  const winningLine = getWinningLine();

  if (winningLine) {
    finishRound(currentPlayer, winningLine);
    return;
  }

  if (board.every(Boolean)) {
    finishRound(null);
    return;
  }

  currentPlayer = currentPlayer === "X" ? "O" : "X";
  setStatus(`Player ${currentPlayer}'s turn`);
}

function startRound() {
  board = Array(9).fill("");
  currentPlayer = "X";
  gameActive = true;
  confetti.innerHTML = "";
  setStatus("Player X starts");

  cells.forEach((cell, index) => {
    cell.textContent = "";
    cell.className = "cell";
    cell.setAttribute("aria-label", `Cell ${index + 1}`);
  });
}

function resetGame() {
  scores.X = 0;
  scores.O = 0;
  scores.draw = 0;
  updateScores();
  startRound();
}

cells.forEach((cell) => cell.addEventListener("click", handleMove));
nextRoundBtn.addEventListener("click", startRound);
resetBtn.addEventListener("click", resetGame);

updateScores();
