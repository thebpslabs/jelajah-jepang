// ============================
// app-part2.js
// ============================

// Utility: shuffle array randomly
function shuffleArray(array) {
  // Fisher–Yates shuffle
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// ============================
// Start Quiz
// ============================

function startQuiz(category) {
  state.category = category;
  state.currentQuestionIndex = 0;
  state.score = 0;

  // Select the correct question set
  const key = `${state.level}-${category}`;
  let questions = database[key] || [];

  // Shuffle questions and answers
  questions = shuffleArray(questions).slice(0, 10);
  questions.forEach(q => {
    q.options = shuffleArray(q.options);
  });

  state.questions = questions;

  // Switch pages
  mainMenu.style.display = "none";
  quizPage.style.display = "block";
  resultsPage.style.display = "none";

  showQuestion();
}

// ============================
// Display Question
// ============================

function showQuestion() {
  const q = state.questions[state.currentQuestionIndex];
  if (!q) return;

  const qNum = document.getElementById("question-number");
  const qText = document.getElementById("question-text");
  const qImage = document.getElementById("question-image");
  const qOptions = document.getElementById("question-options");
  const progress = document.getElementById("progress-bar");

  qNum.innerText = `Pertanyaan ${state.currentQuestionIndex + 1} dari 10`;
  qText.innerText = q.question;

  if (q.image) {
    qImage.src = `assets/${q.image}`;
    qImage.style.display = "block";
  } else {
    qImage.style.display = "none";
  }

  qOptions.innerHTML = "";
  q.options.forEach(opt => {
    const btn = document.createElement("button");
    btn.classList.add("option-btn");
    btn.innerText = opt;
    btn.onclick = () => handleAnswer(opt, q);
    qOptions.appendChild(btn);
  });

  progress.style.width = `${((state.currentQuestionIndex) / 10) * 100}%`;
}

// ============================
// Handle Answer
// ============================

function handleAnswer(selected, q) {
  const feedbackPopup = document.getElementById("feedback-popup");
  const feedbackText = document.getElementById("feedback-text");
  const feedbackImg = document.getElementById("feedback-img");
  const nextBtn = document.getElementById("next-question-btn");

  if (selected === q.answer) {
    state.score++;
    feedbackText.innerText = `Benar! 🎉\n${q.explanation || ""}`;
    feedbackImg.src = "assets/correct.png";
    playSound("correct");
  } else {
    feedbackText.innerText = `Salah ❌\n${q.explanation || ""}`;
    feedbackImg.src = "assets/incorrect.png";
    playSound("incorrect");
  }

  openPopup(feedbackPopup);

  nextBtn.onclick = () => {
    closePopup(feedbackPopup);
    nextQuestion();
  };
}

// ============================
// Next Question
// ============================

function nextQuestion() {
  state.currentQuestionIndex++;
  if (state.currentQuestionIndex >= 10) {
    endQuiz();
  } else {
    showQuestion();
  }
}

// ============================
// End Quiz → Results
// ============================

function endQuiz() {
  quizPage.style.display = "none";
  resultsPage.style.display = "block";

  const scoreText = document.getElementById("result-score");
  const resultMessage = document.getElementById("result-message");
  const resultSub = document.getElementById("result-sub");

  scoreText.innerText = `${state.score}/10`;

  // Messages by score
  if (state.score <= 3) {
    resultMessage.innerText = "Kamu belum siap ke Jepang... 😢";
    resultSub.innerText = "Bisa bahasa Jepang jadi lebih tenang. Ayo semangat!";
    playSound("fail");
  } else if (state.score <= 6) {
    resultMessage.innerText = "Perlu persiapan sedikit lagi! 🤔";
    resultSub.innerText = "Jangan menyerah, ayo coba lagi!";
    playSound("fail");
  } else if (state.score <= 9) {
    resultMessage.innerText = "Kamu sudah siap ke Jepang! 🎉";
    resultSub.innerText = "Tapi bisakah kamu dapat nilai sempurna?";
    playSound("success");
    confetti();
  } else {
    resultMessage.innerText = "Apakah kamu orang Jepang? 😲";
    resultSub.innerText = "Selamat! Nilai sempurna! Coba kategori lainnya!";
    playSound("success");
    confetti();
  }

  // Save attempt
  attempts.push({
    date: new Date().toLocaleDateString(),
    score: state.score,
    category: state.category
  });
}

// ============================
// Expose globally
// ============================

window.startQuiz = startQuiz;
window.showQuestion = showQuestion;
window.handleAnswer = handleAnswer;
window.nextQuestion = nextQuestion;
window.endQuiz = endQuiz;
