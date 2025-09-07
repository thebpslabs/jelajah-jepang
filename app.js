// app.js

let currentLevel = "turis";
let currentQuestion = 0;
let score = 0;
let quizData = [];
let soundEnabled = true;

// Example quiz database
const quizzes = {
  turis: [
    { q: "Apa arti 'ありがとう' (Arigatou)?", a: ["Terima kasih", "Selamat pagi", "Permisi", "Halo"], correct: 0 },
    { q: "Apa bahasa Jepang untuk 'Toilet'?", a: ["トイレ", "みず", "くつ", "たべもの"], correct: 0 },
  ],
  n5: [
    { q: "Kanji '水' dibaca?", a: ["Mizu", "Hi", "Ki", "Sora"], correct: 0 },
    { q: "Apa arti '食べる' (taberu)?", a: ["Makan", "Tidur", "Minum", "Belajar"], correct: 0 },
  ],
  n4: [
    { q: "Kanji '駅' artinya?", a: ["Stasiun", "Sekolah", "Rumah", "Toko"], correct: 0 },
    { q: "Apa arti '難しい' (muzukashii)?", a: ["Sulit", "Mudah", "Panas", "Besar"], correct: 0 },
  ]
};

// 🎵 Safe sound play
function playSound(id) {
  if (!soundEnabled) return;
  const el = document.getElementById(id);
  if (el && el.play) {
    el.currentTime = 0;
    el.play().catch(() => {});
  }
}

// Navigation
function showSection(id) {
  ["menu", "quiz", "results", "status", "settings"].forEach(s => {
    document.getElementById(s).style.display = "none";
  });
  document.getElementById(id).style.display = "block";
}

function backToMenu() {
  showSection("menu");
}

// Start Quiz
function startQuiz() {
  quizData = quizzes[currentLevel];
  currentQuestion = 0;
  score = 0;
  showSection("quiz");
  loadQuestion();
}

// Load Question
function loadQuestion() {
  const q = quizData[currentQuestion];
  if (!q) return showResults();

  document.getElementById("question-number").innerText = 
    `Pertanyaan ${currentQuestion + 1} dari ${quizData.length}`;
  document.getElementById("question-text").innerText = q.q;

  const answersDiv = document.getElementById("answers");
  answersDiv.innerHTML = "";
  q.a.forEach((ans, i) => {
    const btn = document.createElement("button");
    btn.innerText = ans;
    btn.onclick = () => checkAnswer(i);
    answersDiv.appendChild(btn);
  });

  document.getElementById("progress").value = currentQuestion;
  document.getElementById("progress").max = quizData.length;
}

// Check Answer
function checkAnswer(i) {
  const q = quizData[currentQuestion];
  if (i === q.correct) {
    score++;
    playSound("correctSound");
  } else {
    playSound("wrongSound");
  }

  currentQuestion++;
  if (currentQuestion < quizData.length) {
    loadQuestion();
  } else {
    showResults();
  }
}

// Results
function showResults() {
  showSection("results");
  document.getElementById("score-text").innerText = 
    `Skor kamu: ${score} / ${quizData.length}`;

  document.getElementById("motivation").innerText =
    score === quizData.length ? "Hebat! 🎉" :
    score > quizData.length / 2 ? "Bagus! Teruskan belajar!" :
    "Jangan menyerah, coba lagi 💪";
}

// Status
function showStatus() {
  showSection("status");
  document.getElementById("status-text").innerText =
    `Level sekarang: ${currentLevel.toUpperCase()}, 
     Terakhir skor: ${score}`;
}

// Settings
function openSettings() {
  showSection("settings");
}

function setTheme(theme) {
  document.body.className = theme; // CSS can style themes
}

function setLevel(level) {
  currentLevel = level;
}

document.getElementById("soundToggle").addEventListener("change", e => {
  soundEnabled = e.target.checked;
  playSound("clickSound");
});
