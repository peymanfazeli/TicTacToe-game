(function initTelegramApp() {
  const inject = () => {
    if (window.Telegram?.WebApp) {
      Telegram.WebApp.expand();
      Telegram.WebApp.ready();
      Telegram.WebApp.disableVerticalSwipes?.();
      document.documentElement.classList.add("tg");
    }
  };
  if (window.Telegram?.WebApp) {
    inject();
  } else {
    const s = document.createElement("script");
    s.src = "https://telegram.org/js/telegram-web-app.js";
    s.onload = inject;
    document.head.appendChild(s);
  }
})();

const cells = [...document.querySelectorAll(".cell")];
const choiceButtons = [...document.querySelectorAll(".choice-btn")];
const levelButtons = [...document.querySelectorAll(".level-btn")];
const statusText = document.querySelector("#statusText");
const timerText = document.querySelector("#timerText");
const labelX = document.querySelector("#labelX");
const labelO = document.querySelector("#labelO");
const scoreX = document.querySelector("#scoreX");
const scoreO = document.querySelector("#scoreO");
const scoreDraw = document.querySelector("#scoreDraw");
const nextRoundBtn = document.querySelector("#nextRoundBtn");
const resetBtn = document.querySelector("#resetBtn");
const confetti = document.querySelector("#confetti");
const nameModal = document.querySelector("#nameModal");
const nameForm = document.querySelector("#nameForm");
const playerNameInput = document.querySelector("#playerNameInput");
const donationModal = document.querySelector("#donationModal");
const closeDonationModalBtn = document.querySelector("#closeDonationModalBtn");
const languageButtons = [...document.querySelectorAll(".language-btn")];
const adaptiveModal = document.querySelector("#adaptiveModal");
const closeAdaptiveModalBtn = document.querySelector("#closeAdaptiveModalBtn");
const adaptiveOkBtn = document.querySelector("#adaptiveOkBtn");
const startPlayingBtn = document.querySelector("#startPlayingBtn");


const rewardModal = document.querySelector("#rewardModal");
const rewardOkBtn = document.querySelector("#rewardOkBtn");

let openModals = 0;

function lockScroll() {
  openModals++;
  document.body.classList.add("modal-open");
  stopTurnTimer();
}

function unlockScroll() {
  openModals = Math.max(0, openModals - 1);
  if (openModals === 0) {
    document.body.classList.remove("modal-open");
  }
}

const MODAL_PRIORITY = { donation: 1, reward: 2, adaptive: 3 };
const modalQueue = [];
let modalActive = false;
let queueScheduled = false;

function enqueueModal(type) {
  modalQueue.push(type);
  if (!queueScheduled) {
    queueScheduled = true;
    setTimeout(() => {
      queueScheduled = false;
      processModalQueue();
    }, 0);
  }
}

function processModalQueue() {
  if (modalActive || modalQueue.length === 0) return;

  modalQueue.sort((a, b) => MODAL_PRIORITY[a] - MODAL_PRIORITY[b]);
  const type = modalQueue.shift();
  modalActive = true;

  switch (type) {
    case 'donation':
      donationModal.classList.remove("hidden");
      lockScroll();
      break;
    case 'adaptive':
      adaptiveModal.classList.remove("hidden");
      lockScroll();
      playAdaptiveSound();
      break;
    case 'reward':
      buildRewardDots();
      rewardModal.classList.remove("hidden");
      lockScroll();
      playRewardStepSound();
      requestAnimationFrame(() => {
        requestAnimationFrame(() => updateRewardPath());
      });
      break;
  }
}

function modalDismissed() {
  setTimeout(() => {
    modalActive = false;
    processModalQueue();
  }, 500);
}

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

const translations = {
  en: {
    heroEyebrow: "Let's Do This",
    heroTitle: "Tic Tac Toe",
    heroSubtitle: "Choose your mark, challenge the system, and keep the streak alive.",
    donateButton: "💖 Donate",
    chooseSide: "Choose your side",
    playAsX: "Play as X",
    playAsO: "Play as O",
    chooseLevel: "Choose level",
    easy: "Easy",
    medium: "Medium",
    hard: "Hard",
    draws: "Draws",
    nextRound: "Next Round",
    resetScores: "Reset Scores",
    welcomePlayer: "Welcome Player",
    nameTitle: "What's your name?",
    nameCopy: "Add your name so the scoreboard feels personal.",
    yourName: "Your name",
    startPlaying: "Start Playing",
    donationEyebrow: "Keep It Juicy",
    donationTitle: "Enjoying the game?",
    donationCopy: "A small donation helps keep the fun updates coming.",
    donateNow: "💖 Donate Now",
    gameSuggestCopy: "Also try our word game!",
    gameSuggestBtn: "🎮 Word Rush",
    footerGameLink: "🎮 Word Rush",
    adaptiveEyebrow: "System Upgrade",
    adaptiveTitle: "Medium mode reached!",
    adaptiveCopy: "You keep winning, so the system is now playing smarter.",
    adaptiveOk: "Bring it on",
    guest: "Guest",
    system: "System",
    chooseStart: "{name}, choose X or O",
    levelSet: "Level set to {difficulty}. {name}, choose X or O.",
    playerTurn: "{name}'s turn",
    systemStarts: "System starts",
    systemThinking: "System is thinking on {difficulty}...",
    playerWins: "{name} wins!",
    systemWins: "System wins!",
    drawResult: "It's a juicy draw!",
    timeUp: "Time's up! System turn.",
    cell: "Cell {number}",
    cellWithPlayer: "Cell {number}, {owner} {symbol}",
    rewardEyebrow: "Win Streak",
    rewardTitle: "Reward Path",
    rewardProgress: "{won} of {total}",
    rewardOk: "Continue",
    footerContact: "Contact me",
  },
  fa: {
    heroEyebrow: "بزن بریم",
    heroTitle: "دوز",
    heroSubtitle: "مهره‌ات رو انتخاب کن، با سیستم بازی کن و رکوردت رو نگه دار.",
    donateButton: "💖 حمایت مالی",
    chooseSide: "طرف خودتو انتخاب کن",
    playAsX: "بازی با X",
    playAsO: "بازی با O",
    chooseLevel: "سطح بازی",
    easy: "آسون",
    medium: "متوسط",
    hard: "سخت",
    draws: "مساوی‌ها",
    nextRound: "دور بعدی",
    resetScores: "ریست امتیازها",
    welcomePlayer: "خوش اومدی",
    nameTitle: "اسمت چیه؟",
    nameCopy: "اسمتو وارد کن تا جدول امتیازها شخصی‌تر شه.",
    yourName: "اسمت",
    startPlaying: "شروع بازی",
    donationEyebrow: "یه حالی بهمون بده",
    donationTitle: "خوش میگذره؟",
    donationCopy: "اگه به داداش حال بدی کلی آپدیت خفن برات میسازم.",
    donateNow: "💖 حمایت کن",
    gameSuggestCopy: "بازی کلمه‌ای ما رو هم امتحان کن!",
    gameSuggestBtn: "🎮 Word Rush",
    footerGameLink: "🎮 Word Rush",
    adaptiveEyebrow: "ارتقای سیستم",
    adaptiveTitle: "سیستم به سطح متوسط رسید!",
    adaptiveCopy: "مشتی توکه این کاره ای چرا سطحتو پایین برداشتی",
    adaptiveOk: "بزن بریم",
    guest: "مهمان",
    system: "سیستم",
    chooseStart: "{name}، X یا O را انتخاب کن",
    levelSet: "سطح روی {difficulty} تنظیم شد. {name}، X یا O روانتخاب کن.",
    playerTurn: "نوبت {name}",
    systemStarts: "نوبت سیستمه",
    systemThinking: "سیستم در سطح {difficulty} بازی میکنه...",
    playerWins: "{name} برنده شد!",
    systemWins: "سیستم برنده شد!",
    drawResult: "مساوی شدین!",
    timeUp: "وقتتو بپا! نوبت سیستم شد.",
    cell: "خانه {number}",
    cellWithPlayer: "خانه {number}، {owner} {symbol}",
    rewardEyebrow: "بردهای متوالی",
    rewardTitle: "مسیر جایزه",
    rewardProgress: "{won} از {total}",
    rewardOk: "ادامه",
    footerContact: "ارتباط با من",
  },
};

let board = Array(9).fill("");
let currentPlayer = "X";
let humanPlayer = "";
let systemPlayer = "";
let difficulty = "";
let gameActive = false;
let systemThinking = false;
let playerName = "Guest";
let completedRounds = 0;
let humanWins = 0;
let streakWins = 0;
let adaptiveBoost = 0;
let mediumAlertShown = false;
let currentLanguage = "en";
let turnTimeLeft = 0;
let timerInterval;
let audioContext;
let nextDonationRound = Math.floor(Math.random() * 5) + 3;

const turnTimes = {
  easy: 15,
  medium: 10,
  hard: 5,
};

function t(key, replacements = {}) {
  let text = translations[currentLanguage][key] || translations.en[key] || key;

  Object.entries(replacements).forEach(([name, value]) => {
    text = text.replaceAll(`{${name}}`, value);
  });

  return text;
}

function getDifficultyLabel() {
  return t(difficulty);
}

function loadLalezarFont() {
  if (document.querySelector('link[href*="Lalezar"]')) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "https://fonts.googleapis.com/css2?family=Lalezar&display=swap";
  document.head.appendChild(link);
}

function applyTranslations() {
  document.documentElement.lang = currentLanguage;
  document.documentElement.dir = currentLanguage === "fa" ? "rtl" : "ltr";
  document.body.classList.toggle("rtl", currentLanguage === "fa");

  if (currentLanguage === "fa") loadLalezarFont();

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = t(element.dataset.i18n);
  });

  playerNameInput.placeholder = currentLanguage === "fa" ? "مثلاً علی" : "Alex";
  updateScoreLabels();
  updateTimerDisplay();
}

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

function playTickTockSound() {
  playTone({ frequency: 760, duration: 0.045, type: "square", volume: 0.055 });
  playTone({ frequency: 520, duration: 0.055, type: "triangle", volume: 0.045, delay: 0.12 });
}

function playErrorSound() {
  [320, 240, 160].forEach((frequency, index) => {
    playTone({
      frequency,
      duration: 0.08,
      type: "triangle",
      volume: 0.12,
      delay: index * 0.06,
    });
  });
}

function playStartSound() {
  [392, 523.25, 659.25, 783.99].forEach((frequency, note) => {
    playTone({
      frequency,
      duration: 0.1,
      type: "triangle",
      volume: 0.13,
      delay: note * 0.06,
    });
  });
}

function playSelectionSound() {
  playTone({
    frequency: 600,
    duration: 0.07,
    type: "triangle",
    volume: 0.1,
  });

  playTone({
    frequency: 850,
    duration: 0.07,
    type: "triangle",
    volume: 0.08,
    delay: 0.05,
  });
}

function playRewardStepSound() {
  const step = Math.min(streakWins - getRewardThreshold(), 9);
  const steps = [523.25, 587.33, 659.25, 698.46, 783.99, 880, 987.77, 1046.5, 1174.66, 1318.51];
  const freq = steps[step] || 1046.5;
  playTone({ frequency: freq, duration: 0.2, type: "triangle", volume: 0.12 });
  playTone({ frequency: freq * 1.5, duration: 0.14, type: "sine", volume: 0.06, delay: 0.05 });
}

function setStatus(message) {
  statusText.textContent = message;
  statusText.classList.remove("bump");
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      statusText.classList.add("bump");
    });
  });
}

function updateTimerDisplay() {
  const warning = gameActive && currentPlayer === humanPlayer && turnTimeLeft > 0 && turnTimeLeft <= turnTimes[difficulty] / 2;
  timerText.textContent = gameActive && currentPlayer === humanPlayer ? `${turnTimeLeft}s` : "--";
  timerText.classList.toggle("warning", warning);
}

function stopTurnTimer() {
  window.clearInterval(timerInterval);
  timerInterval = undefined;
  turnTimeLeft = 0;
  updateTimerDisplay();
}

function handleTurnTimeout() {
  stopTurnTimer();

  if (!gameActive || currentPlayer !== humanPlayer || systemThinking) {
    return;
  }

  setStatus(t("timeUp"));
  currentPlayer = systemPlayer;
  makeSystemMove();
}

function startTurnTimer() {
  stopTurnTimer();

  if (!gameActive || currentPlayer !== humanPlayer || systemThinking || openModals > 0) {
    return;
  }

  turnTimeLeft = turnTimes[difficulty];
  updateTimerDisplay();

  timerInterval = window.setInterval(() => {
    turnTimeLeft -= 1;
    updateTimerDisplay();

    if (turnTimeLeft > 0 && turnTimeLeft <= turnTimes[difficulty] / 2) {
      playTickTockSound();
    }

    if (turnTimeLeft <= 0) {
      handleTurnTimeout();
    }
  }, 1000);
}

function updateScores() {
  scoreX.textContent = scores.X;
  scoreO.textContent = scores.O;
  scoreDraw.textContent = scores.draw;
}

function updateScoreLabels() {
  labelX.textContent = humanPlayer === "X" ? `${playerName} X` : `${t("system")} X`;
  labelO.textContent = humanPlayer === "O" ? `${playerName} O` : `${t("system")} O`;
}

function getBaseSmartMoveChance() {
  const smartMoveChance = {
    easy: 0.2,
    medium: 0.6,
    hard: 0.95,
  };

  return smartMoveChance[difficulty];
}

function getAdaptiveSmartMoveChance() {
  console.log('Math.min(0.95, getBaseSmartMoveChance() + adaptiveBoost);', Math.min(0.95, getBaseSmartMoveChance() + adaptiveBoost))
  return Math.min(0.95, getBaseSmartMoveChance() + adaptiveBoost);
}

function getRewardThreshold() {
  const chance = getAdaptiveSmartMoveChance();
  if (chance > 0.7) return 2;
  if (chance >= 0.6) return 3;
  return 6;
}

function playAdaptiveSound() {
  [330, 440, 587.33, 783.99].forEach((frequency, note) => {
    playTone({ frequency, duration: 0.14, type: "triangle", volume: 0.13, delay: note * 0.08 });
  });
}

function showAdaptiveModal() {
  if (mediumAlertShown) return;

  mediumAlertShown = true;
  enqueueModal('adaptive');
}

function updateAdaptiveDifficulty() {
  adaptiveBoost = Math.floor(humanWins / 2) * 0.1;

  if (difficulty === "easy" && getAdaptiveSmartMoveChance() >= 0.6) {
    showAdaptiveModal();
  }
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
  const isMobile = window.innerWidth < 768;
  const count = isMobile ? 16 : 38;

  for (let piece = 0; piece < count; piece += 1) {
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
  completedRounds += 1;
  stopTurnTimer();

  if (winner) {
    scores[winner] += 1;
    winningLine.forEach((index) => cells[index].classList.add("win"));
    setStatus(winner === humanPlayer ? t("playerWins", { name: playerName }) : t("systemWins"));
    playWinSound();
    launchConfetti();

    if (winner === humanPlayer) {
      humanWins += 1;
      updateAdaptiveDifficulty();
      if (difficulty !== "easy") {
        streakWins += 1;
        if (streakWins >= getRewardThreshold()) {
          setTimeout(() => showRewardPath(), 800);
        }
      }
    } else {
      if (difficulty !== "easy") {
        streakWins = 0;
      }
    }
  } else {
    scores.draw += 1;
    setStatus(t("drawResult"));
    playDrawSound();
  }

  updateScores();

  if (winner !== humanPlayer || difficulty === "easy") {
    showDonationReminder();
  }
}

function placeMark(index, player) {
  const cell = cells[index];

  board[index] = player;
  cell.textContent = player;
  cell.classList.add(player.toLowerCase());
  cell.setAttribute("aria-label", t("cellWithPlayer", {
    number: index + 1,
    owner: player === humanPlayer ? playerName : t("system"),
    symbol: player,
  }));
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
  return Math.random() < getAdaptiveSmartMoveChance() ? findBestSystemMove() : findWeakSystemMove();
}

function makeSystemMove() {
  if (!gameActive || currentPlayer !== systemPlayer) {
    return;
  }

  stopTurnTimer();
  systemThinking = true;
  setStatus(t("systemThinking", { difficulty: getDifficultyLabel() }));

  window.setTimeout(() => {
    const moveIndex = findDifficultySystemMove();

    if (!gameActive || moveIndex === undefined) {
      return;
    }

    placeMark(moveIndex, systemPlayer);
    systemThinking = false;

    if (!resolveTurn(systemPlayer)) {
      currentPlayer = humanPlayer;
      setStatus(t("playerTurn", { name: playerName }));
      startTurnTimer();
    }
  }, 520);
}

function handleMove(event) {
  const index = Number(event.currentTarget.dataset.index);

  if (!gameActive || systemThinking || currentPlayer !== humanPlayer || board[index]) {
    return;
  }

  stopTurnTimer();
  placeMark(index, humanPlayer);

  if (resolveTurn(humanPlayer)) {
    return;
  }

  currentPlayer = systemPlayer;
  makeSystemMove();
}

function startRound() {
  const difficulty = getDifficultyLabel()
  if (difficulty !== "") {
    
    stopTurnTimer();
    board = Array(9).fill("");
    currentPlayer = "X";
    gameActive = Boolean(humanPlayer);
    systemThinking = false;
    confetti.innerHTML = "";
    setStatus(humanPlayer ? (humanPlayer === "X" ? t("playerTurn", { name: playerName }) : t("systemStarts")) : t("chooseStart", { name: playerName }));
  
    cells.forEach((cell, index) => {
      cell.textContent = "";
      cell.className = "cell";
      cell.disabled = !humanPlayer;
      cell.setAttribute("aria-label", t("cell", { number: index + 1 }));
    });
  
    if (humanPlayer === "O") {
      makeSystemMove();
    } else if (humanPlayer === "X") {
      startTurnTimer();
    }
  } else {
     console.log('game is locked')
  }
}

function resetGame() {
  scores.X = 0;
  scores.O = 0;
  scores.draw = 0;
  completedRounds = 0;
  humanWins = 0;
  streakWins = 0;
  adaptiveBoost = 0;
  mediumAlertShown = false;
  adaptiveModal.classList.add("hidden");
  rewardModal.classList.add("hidden");
  updateScores();
  startRound();
}

function choosePlayer(event) {
  playSelectionSound()
  humanPlayer = event.currentTarget.dataset.symbol;
  systemPlayer = humanPlayer === "X" ? "O" : "X";

  choiceButtons.forEach((button) => {
    button.classList.toggle("selected", button.dataset.symbol === humanPlayer);
  });

  updateScoreLabels();
  resetGame();
}

function setDifficulty(level) {
  difficulty = level;
  if (level === "easy") streakWins = 0;

  levelButtons.forEach((button) => {
    button.classList.toggle(
      "selected",
      button.dataset.level === level
    );
  });

  if (
    gameActive &&
    currentPlayer === humanPlayer &&
    !systemThinking
  ) {
    startTurnTimer();
  }
  startPlayingBtn.disabled = false;
}

function chooseDifficulty(event) {
  setDifficulty(event.currentTarget.dataset.level)
  if (humanPlayer) {
    startRound();
  } else {
    updateTimerDisplay();
    setStatus(t("levelSet", { difficulty: getDifficultyLabel(), name: playerName }));
  }
}

function closeNameModal() {
  playerName = playerNameInput.value.trim() || t("guest");
  unlockScroll();
  nameModal.classList.add("hidden");
  document.querySelector("#mediaad-DAWa4").classList.remove("hidden");
  updateScoreLabels();
  setStatus(t("chooseStart", { name: playerName }));
  startTurnTimer();
}

function savePlayerName(event) {
  event.preventDefault();
  if (!difficulty) {
    playErrorSound();
    showDifficultyTooltip();
    return;
  }
  playStartSound();
  closeNameModal();
}

function showDifficultyTooltip() {
  const tooltip = document.querySelector("#difficultyTooltip");

  tooltip.classList.remove("hidden");

  setTimeout(() => {
    tooltip.classList.add("hidden");
  }, 2500);
}

function showDonationReminder() {
  if (completedRounds >= nextDonationRound) {
    enqueueModal('donation');
    nextDonationRound = completedRounds + Math.floor(Math.random() * 5) + 3;
  }
}

function closeDonationReminder() {
  unlockScroll();
  donationModal.classList.add("hidden");
  modalDismissed();
}

function getSpiralPositions() {
  const count = 10;
  const radius = 1.2;
  const angleStep = Math.PI / 2.2;
  const vertStep = 1.4;
  const cx = 2.5;
  const positions = [];
  for (let i = 0; i < count; i++) {
    const xOff = radius * Math.cos(i * angleStep);
    const yOff = i * vertStep;
    positions.push({
      svgX: (cx + xOff).toFixed(3),
      svgY: yOff.toFixed(3),
      cssX: xOff.toFixed(3) + "rem",
      cssY: yOff.toFixed(3) + "rem",
    });
  }
  return positions;
}

function buildRewardDots() {
  const container = document.querySelector("#rewardDots");
  if (container.querySelectorAll(".reward-dot").length === 10) return;
  container.innerHTML = `<svg class="reward-spiral-svg" viewBox="0 0 5 14.5" preserveAspectRatio="xMidYMid meet"></svg>`;
  const positions = getSpiralPositions();
  const svg = container.querySelector("svg");
  for (let i = 0; i < 10; i++) {
    if (i > 0) {
      const seg = document.createElementNS("http://www.w3.org/2000/svg", "path");
      seg.setAttribute("class", "reward-spiral-path");
      seg.setAttribute(
        "d",
        `M ${positions[i - 1].svgX},${positions[i - 1].svgY} L ${positions[i].svgX},${positions[i].svgY}`
      );
      seg.style.setProperty("--i", i);
      svg.appendChild(seg);
    }
    const dot = document.createElement("span");
    dot.className = "reward-dot";
    dot.style.setProperty("--i", i);
    dot.style.setProperty("--x", positions[i].cssX);
    dot.style.setProperty("--y", positions[i].cssY);
    container.appendChild(dot);
  }
}

function updateRewardPath() {
  const dots = document.querySelectorAll(".reward-dot");
  const segments = document.querySelectorAll(".reward-spiral-path");
  const total = dots.length;
  const act = streakWins - getRewardThreshold();
  dots.forEach((dot, i) => {
    dot.className = "reward-dot";
    if (i < act) {
      dot.classList.add("completed");
    } else if (i === act && streakWins < getRewardThreshold() + total) {
      dot.classList.add("active");
    } else {
      dot.classList.add("remaining");
    }
  });
  segments.forEach((seg, i) => {
    const idx = i + 1;
    seg.className = "reward-spiral-path";
    if (idx < act) {
      seg.classList.add("completed");
    } else if (idx === act && streakWins < getRewardThreshold() + total) {
      seg.classList.add("active");
    } else {
      seg.classList.add("remaining");
    }
  });
  const progress = document.querySelector("#rewardProgress");
  const shown = Math.min(Math.max(streakWins - (getRewardThreshold() - 1), 0), total);
  progress.textContent = t("rewardProgress", { won: shown, total });
}

function showRewardPath() {
  enqueueModal('reward');
}

function closeRewardPath() {
  unlockScroll();
  rewardModal.classList.add("hidden");
  console.log('click')
  showDonationReminder();
  modalDismissed();
}

function closeAdaptiveModal() {
  unlockScroll();
  adaptiveModal.classList.add("hidden");
  setDifficulty('medium');
  modalDismissed();
}

function chooseLanguage(event) {
  currentLanguage = event.currentTarget.dataset.language;

  languageButtons.forEach((button) => {
    button.classList.toggle("selected", button.dataset.language === currentLanguage);
  });

  applyTranslations();
  startRound();
}

cells.forEach((cell) => cell.addEventListener("click", handleMove));
choiceButtons.forEach((button) => button.addEventListener("click", choosePlayer));
levelButtons.forEach((button) => button.addEventListener("click", chooseDifficulty));
languageButtons.forEach((button) => button.addEventListener("click", chooseLanguage));
nextRoundBtn.addEventListener("click", startRound);
resetBtn.addEventListener("click", resetGame);
nameForm.addEventListener("submit", savePlayerName);
closeDonationModalBtn.addEventListener("click", closeDonationReminder);
closeAdaptiveModalBtn.addEventListener("click", closeAdaptiveModal);
adaptiveOkBtn.addEventListener("click", closeAdaptiveModal);
rewardOkBtn.addEventListener("click", closeRewardPath);
console.log('no close name modal btn');

lockScroll();
updateScores();
applyTranslations();
startRound();
playerNameInput.focus();
