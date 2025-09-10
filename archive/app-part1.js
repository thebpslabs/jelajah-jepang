// ============================
// app-part1.js
// ============================

// Global state
const state = {
  level: "Belum pernah ke Jepang", // default
  category: null,
  currentQuestionIndex: 0,
  score: 0,
  questions: [],
};

const settings = {
  theme: "fun", // default theme
  sounds: true,
  notifications: false,
};

let attempts = []; // stores quiz results for status page

// DOM elements
const mainMenu = document.getElementById("main-menu");
const quizPage = document.getElementById("quiz-page");
const resultsPage = document.getElementById("results-page");
const settingsPopup = document.getElementById("settings-popup");
const statusPopup = document.getElementById("status-popup");
const levelPopup = document.getElementById("level-popup");
const overlay = document.getElementById("overlay");

// ============================
// Utility functions
// ============================

function showOverlay() {
  overlay.style.display = "block";
  overlay.classList.add("active");
}

function hideOverlay() {
  overlay.style.display = "none";
  overlay.classList.remove("active");
}

function playSound(type) {
  if (!settings.sounds) return;
  const audio = new Audio(`assets/${type}.mp3`);
  audio.play();
}

// ============================
// Theme Handling
// ============================

function applyTheme() {
  let body = document.body;
  body.className = ""; // reset

  if (settings.theme === "dark") {
    body.classList.add("dark-theme");
  } else if (settings.theme === "light") {
    body.classList.add("light-theme");
  } else if (settings.theme === "fun") {
    body.classList.add("fun-theme");
    startFunBackgroundAnimation();
  }
}

// Gradual Fun background animation
let funBgInterval;
function startFunBackgroundAnimation() {
  clearInterval(funBgInterval);
  const body = document.body;
  let hue = 0;
  funBgInterval = setInterval(() => {
    if (settings.theme !== "fun") {
      clearInterval(funBgInterval);
      return;
    }
    hue = (hue + 1) % 360;
    body.style.backgroundColor = `hsl(${hue}, 80%, 85%)`;
  }, 100);
}

// ============================
// Popup Handling
// ============================

function openPopup(popup) {
  showOverlay();
  popup.style.display = "block";
}

function closePopup(popup) {
  hideOverlay();
  popup.style.display = "none";
}

// ============================
// Level Selection
// ============================

function selectLevel(level) {
  state.level = level;
  document.getElementById("level-btn").innerText = `Level: ${level}`;
  closePopup(levelPopup);
}

// ============================
// Settings
// ============================

function setTheme(theme) {
  settings.theme = theme;
  applyTheme();
}

function toggleSounds() {
  settings.sounds = !settings.sounds;
}

function toggleNotifications() {
  settings.notifications = !settings.notifications;
}

// ============================
// Status Page
// ============================

function renderStatus() {
  const ctxLine = document.getElementById("status-line").getContext("2d");
  const ctxPie = document.getElementById("status-pie").getContext("2d");

  const dates = attempts.map(a => a.date);
  const scores = attempts.map(a => a.score);

  new Chart(ctxLine, {
    type: "line",
    data: {
      labels: dates,
      datasets: [{
        label: "Score",
        data: scores,
        borderWidth: 2
      }]
    }
  });

  const categories = {};
  attempts.forEach(a => {
    categories[a.category] = (categories[a.category] || 0) + 1;
  });

  new Chart(ctxPie, {
    type: "pie",
    data: {
      labels: Object.keys(categories),
      datasets: [{
        data: Object.values(categories)
      }]
    }
  });
}

function clearStatus() {
  attempts = [];
  renderStatus();
}

// ============================
// Navigation
// ============================

function goHome() {
  quizPage.style.display = "none";
  resultsPage.style.display = "none";
  mainMenu.style.display = "flex";
}

// ============================
// Category Menu Handling
// ============================

function openCategoryMenu() {
  mainMenu.style.display = "none";
  const categoryMenu = document.getElementById("category-menu");
  categoryMenu.style.display = "flex";
}

function chooseCategory(category) {
  const categoryMenu = document.getElementById("category-menu");
  categoryMenu.style.display = "none";
  startQuiz(category);
}

function backToHomeFromCategory() {
  const categoryMenu = document.getElementById("category-menu");
  categoryMenu.style.display = "none";
  goHome();
}

// Expose globally
window.openCategoryMenu = openCategoryMenu;
window.chooseCategory = chooseCategory;
window.backToHomeFromCategory = backToHomeFromCategory;

// ============================
// Expose functions globally
// ============================

window.openPopup = openPopup;
window.closePopup = closePopup;
window.selectLevel = selectLevel;
window.setTheme = setTheme;
window.toggleSounds = toggleSounds;
window.toggleNotifications = toggleNotifications;
window.renderStatus = renderStatus;
window.clearStatus = clearStatus;
window.goHome = goHome;
window.playSound = playSound;
window.state = state;
window.settings = settings;
window.attempts = attempts;
