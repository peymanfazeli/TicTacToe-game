const cells = [...document.querySelectorAll(".cell")];
const choiceButtons = [...document.querySelectorAll(".choice-btn")];
const levelButtons = [...document.querySelectorAll(".level-btn")];
const statusText = document.querySelector("#statusText");
const labelX = document.querySelector("#labelX");
const labelO = document.querySelector("#labelO");
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
let humanPlayer = "";
let systemPlayer = "";
let difficulty = "easy";
let gameActive = false;
let systemThinking = false;
let audioContext;

function getAudioContext() {
  audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
  return audioContext;
}

function playTone({ frequency, duration, type = "sine", volume = 0.18, delay = 0 }) {
  const context = getAudioContext();
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const startTime = context.currentTime + delay;
  const endTime = startTime + duration;

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, startTime);
  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.exponentialRampToValueAtTime(volume, startTime + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, endTime);

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(startTime);
  oscillator.stop(endTime + 0.03);
}

function playClickSound(player = currentPlayer) {
  playTone({ frequency: player === "X" ? 620 : 470, duration: 0.08, type: "triangle", volume: 0.12 });
  playTone({ frequency: player === "X" ? 930 : 705, duration: 0.06, type: "sine", volume: 0.06, delay: 0.035 });
}

function playWinSound() {
  [523.25, 659.25, 783.99, 1046.5].forEach((frequency, note) => {
    playTone({ frequency, duration: 0.16, type: "triangle", volume: 0.16, delay: note * 0.085 });
  });
}

function playDrawSound() {
  [392, 349.23, 329.63].forEach((frequency, note) => {
    playTone({ frequency, duration: 0.18, type: "sawtooth", volume: 0.09, delay: note * 0.11 });
  });
}

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

function updateScoreLabels() {
  labelX.textContent = humanPlayer === "X" ? "You X" : "System X";
  labelO.textContent = humanPlayer === "O" ? "You O" : "System O";
}

function getWinningLine(testBoard = board) {
  return winningLines.find((line) => {
    const [first, second, third] = line;
    return testBoard[first] && testBoard[first] === testBoard[second] && testBoard[first] === testBoard[third];
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

function finishRound(winner, winningLine = []) {
  gameActive = false;
  systemThinking = false;

  if (winner) {
    scores[winner] += 1;
    winningLine.forEach((index) => cells[index].classList.add("win"));
    setStatus(winner === humanPlayer ? "You win!" : "System wins!");
    playWinSound();
    launchConfetti();
  } else {
    scores.draw += 1;
    setStatus("It's a juicy draw!");
    playDrawSound();
  }

  updateScores();
}

function placeMark(index, player) {
  const cell = cells[index];

  board[index] = player;
  cell.textContent = player;
  cell.classList.add(player.toLowerCase());
  cell.setAttribute("aria-label", `Cell ${index + 1}, ${player === humanPlayer ? "You" : "System"} ${player}`);
  playClickSound(player);
}

function resolveTurn(player) {
  const winningLine = getWinningLine();

  if (winningLine) {
    finishRound(player, winningLine);
    return true;
  }

  if (board.every(Boolean)) {
    finishRound(null);
    return true;
  }

  return false;
}

function getEmptyIndexes(testBoard = board) {
  return testBoard
    .map((value, index) => (value ? null : index))
    .filter((index) => index !== null);
}

function getWinner(testBoard) {
  const winningLine = getWinningLine(testBoard);
  return winningLine ? testBoard[winningLine[0]] : "";
}

function minimax(testBoard, player, depth = 0) {
  const winner = getWinner(testBoard);

  if (winner === systemPlayer) {
    return 10 - depth;
  }

  if (winner === humanPlayer) {
    return depth - 10;
  }

  const emptyIndexes = getEmptyIndexes(testBoard);

  if (!emptyIndexes.length) {
    return 0;
  }

  const scoresByMove = emptyIndexes.map((index) => {
    const nextBoard = [...testBoard];
    nextBoard[index] = player;
    const nextPlayer = player === systemPlayer ? humanPlayer : systemPlayer;
    return minimax(nextBoard, nextPlayer, depth + 1);
  });

  return player === systemPlayer ? Math.max(...scoresByMove) : Math.min(...scoresByMove);
}

function scoreSystemMoves() {
  return getEmptyIndexes().map((index) => {
    const testBoard = [...board];
    testBoard[index] = systemPlayer;

    return {
      index,
      score: minimax(testBoard, humanPlayer),
    };
  });
}

function getRandomMove(moves) {
  return moves[Math.floor(Math.random() * moves.length)]?.index;
}

function findBestSystemMove() {
  const scoredMoves = scoreSystemMoves();
  const bestScore = Math.max(...scoredMoves.map((move) => move.score));
  const bestMoves = scoredMoves.filter((move) => move.score === bestScore);

  return getRandomMove(bestMoves);
}

function findWeakSystemMove() {
  const scoredMoves = scoreSystemMoves();
  const worstScore = Math.min(...scoredMoves.map((move) => move.score));
  const weakMoves = scoredMoves.filter((move) => move.score === worstScore);

  return getRandomMove(weakMoves);
}

function findDifficultySystemMove() {
  const smartMoveChance = {
    easy: 0.2,
    medium: 0.6,
    hard: 0.95,
  };

  return Math.random() < smartMoveChance[difficulty] ? findBestSystemMove() : findWeakSystemMove();
}

function makeSystemMove() {
  if (!gameActive || currentPlayer !== systemPlayer) {
    return;
  }

  systemThinking = true;
  setStatus(`System is thinking on ${difficulty}...`);

  window.setTimeout(() => {
    const moveIndex = findDifficultySystemMove();

    if (!gameActive || moveIndex === undefined) {
      return;
    }

    placeMark(moveIndex, systemPlayer);
    systemThinking = false;

    if (!resolveTurn(systemPlayer)) {
      currentPlayer = humanPlayer;
      setStatus("Your turn");
    }
  }, 520);
}

function handleMove(event) {
  const index = Number(event.currentTarget.dataset.index);

  if (!gameActive || systemThinking || currentPlayer !== humanPlayer || board[index]) {
    return;
  }

  placeMark(index, humanPlayer);

  if (resolveTurn(humanPlayer)) {
    return;
  }

  currentPlayer = systemPlayer;
  makeSystemMove();
}

function startRound() {
  board = Array(9).fill("");
  currentPlayer = "X";
  gameActive = Boolean(humanPlayer);
  systemThinking = false;
  confetti.innerHTML = "";
  setStatus(humanPlayer ? (humanPlayer === "X" ? "Your turn" : "System starts") : "Choose X or O to start");

  cells.forEach((cell, index) => {
    cell.textContent = "";
    cell.className = "cell";
    cell.disabled = !humanPlayer;
    cell.setAttribute("aria-label", `Cell ${index + 1}`);
  });

  if (humanPlayer === "O") {
    makeSystemMove();
  }
}

function resetGame() {
  scores.X = 0;
  scores.O = 0;
  scores.draw = 0;
  updateScores();
  startRound();
}

function choosePlayer(event) {
  humanPlayer = event.currentTarget.dataset.symbol;
  systemPlayer = humanPlayer === "X" ? "O" : "X";

  choiceButtons.forEach((button) => {
    button.classList.toggle("selected", button.dataset.symbol === humanPlayer);
  });

  updateScoreLabels();
  resetGame();
}

function chooseDifficulty(event) {
  difficulty = event.currentTarget.dataset.level;

  levelButtons.forEach((button) => {
    button.classList.toggle("selected", button.dataset.level === difficulty);
  });

  if (humanPlayer) {
    startRound();
  } else {
    setStatus(`Level set to ${difficulty}. Choose X or O.`);
  }
}

cells.forEach((cell) => cell.addEventListener("click", handleMove));
choiceButtons.forEach((button) => button.addEventListener("click", choosePlayer));
levelButtons.forEach((button) => button.addEventListener("click", chooseDifficulty));
nextRoundBtn.addEventListener("click", startRound);
resetBtn.addEventListener("click", resetGame);

updateScores();
updateScoreLabels();
startRound();
