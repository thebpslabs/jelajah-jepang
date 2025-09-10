<!-- FILE: script.js -->
/* Main script for quiz app */
const dbUrl = './db.json';
let appState = {
  level: 'belum', // default
  category: null,
  questions: [],
  currentIndex: 0,
  score: 0,
  sfxOn: true
};

// elements
const mainMenu = document.getElementById('main-menu');
const btnMulai = document.getElementById('btnMulai');
const btnStatus = document.getElementById('btnStatus');
const btnLevel = document.getElementById('btnLevel');
const btnSettings = document.getElementById('btnSettings');
const currentLevelText = document.getElementById('currentLevelText');
const overlay = document.getElementById('overlay');
const levelModal = document.getElementById('levelModal');
const categoryMenu = document.getElementById('category-menu');
const quizPage = document.getElementById('quiz-page');
const resultsPage = document.getElementById('results-page');
const statusPage = document.getElementById('status-page');
const settingsPage = document.getElementById('settings-page');
const answersWrap = document.getElementById('answers');
const questionText = document.getElementById('questionText');
const questionNumber = document.getElementById('questionNumber');
const progressBar = document.getElementById('progressBar');
const feedbackPopup = document.getElementById('feedbackPopup');
const feedbackText = document.getElementById('feedbackText');
const feedbackExplanation = document.getElementById('feedbackExplanation');
const nextQ = document.getElementById('nextQ');
const btnKembaliHomeFromQuiz = document.getElementById('btnKembaliHomeFromQuiz');
const btnBackFromResults = document.getElementById('btnBackFromResults');
const btnSaveResult = document.getElementById('btnSaveResult');
const resultsTitle = document.getElementById('resultsTitle');
const resultsSub = document.getElementById('resultsSub');
const resultsEmote = document.getElementById('resultsEmote');
const resultsScore = document.getElementById('resultsScore');
const btnDeleteResults = document.getElementById('btnDeleteResults');
const attemptCount = document.getElementById('attemptCount');
const averageScore = document.getElementById('averageScore');
const statusChartEl = document.getElementById('statusChart');
const themeSelect = document.getElementById('themeSelect');
const soundSelect = document.getElementById('soundSelect');
const notifSelect = document.getElementById('notifSelect');
const btnSaveSettings = document.getElementById('btnSaveSettings');
const btnBackFromSettings = document.getElementById('btnBackFromSettings');
const sfxClick = document.getElementById('sfxClick');
const sfxCorrect = document.getElementById('sfxCorrect');
const sfxWrong = document.getElementById('sfxWrong');
const adBar = document.getElementById('adBar');

// helpers
function playSfx(el){ if(!appState.sfxOn) return; try{ el.currentTime=0; el.play(); }catch(e){} }

// initialize
function init(){
  loadSettings();
  bindMainMenu();
  updateLevelText();
}

function bindMainMenu(){
  btnLevel.addEventListener('click',openLevelModal);
  document.querySelectorAll('.level-option').forEach(b=>b.addEventListener('click',chooseLevel));

  btnMulai.addEventListener('click',()=>{
    playSfx(sfxClick);
    hideMainButtons();
    categoryMenu.classList.remove('hidden');
  });
  document.querySelectorAll('.category-btn').forEach(b=>b.addEventListener('click',chooseCategory));

  btnStatus.addEventListener('click',()=>{
    playSfx(sfxClick);
    hideMainButtons();
    showStatus();
  });
  btnSettings.addEventListener('click',()=>{
    playSfx(sfxClick);
    hideMainButtons();
    showSettings();
  });

  document.getElementById('btnKembaliHomeFromCategory').addEventListener('click',goHome);
  btnKembaliHomeFromQuiz.addEventListener('click',goHome);
  btnBackFromResults.addEventListener('click',goHome);
  document.getElementById('btnBackFromStatus').addEventListener('click',goHome);
  document.getElementById('btnBackFromSettings').addEventListener('click',()=>{closeSettings();goHome();});

  nextQ.addEventListener('click',goToNextQuestion);
  btnSaveResult.addEventListener('click',saveResultAndGoStatus);
  btnDeleteResults.addEventListener('click',deleteAllResults);
  btnSaveSettings.addEventListener('click',saveSettingsAndApply);
}

function openLevelModal(){
  overlay.classList.remove('hidden');
  levelModal.classList.remove('hidden');
}
function closeLevelModal(){
  overlay.classList.add('hidden');
  levelModal.classList.add('hidden');
}

function chooseLevel(e){
  const lv = e.target.dataset.level;
  appState.level = lv;
  updateLevelText();
  closeLevelModal();
}

function updateLevelText(){
  const txt = appState.level === 'belum' ? 'Belum pernah ke Jepang' : appState.level === 'pernah' ? 'Pernah ke Jepang' : 'Sering ke Jepang';
  currentLevelText.textContent = `(${txt})`;
}

function hideMainButtons(){
  document.querySelectorAll('#main-menu .main-btn').forEach(b=>b.classList.add('hidden'));
}
function showMainButtons(){
  document.querySelectorAll('#main-menu .main-btn').forEach(b=>b.classList.remove('hidden'));
}

function goHome(){
  // hide everything else
  categoryMenu.classList.add('hidden');
  quizPage.classList.add('hidden');
  resultsPage.classList.add('hidden');
  statusPage.classList.add('hidden');
  settingsPage.classList.add('hidden');
  showMainButtons();
}

async function chooseCategory(e){
  playSfx(sfxClick);
  appState.category = e.target.dataset.cat;
  // fetch questions
  await loadQuestions();
  startQuiz();
}

async function loadQuestions(){
  const res = await fetch(dbUrl);
  const db = await res.json();
  const key = `${appState.level}_${appState.category}`;
  let pool = db[key] || [];
  pool = shuffle(pool).slice(0,10); // 10 questions
  appState.questions = pool;
}

function startQuiz(){
  categoryMenu.classList.add('hidden');
  quizPage.classList.remove('hidden');
  appState.currentIndex = 0; appState.score = 0;
  renderQuestion();
}

function renderQuestion(){
  const q = appState.questions[appState.currentIndex];
  questionNumber.textContent = `Soal ${appState.currentIndex+1} / ${appState.questions.length}`;
  questionText.textContent = q ? q.question : '--';
  // randomize answers
  const opts = shuffle([...(q.incorrect||[]), q.correct]);
  answersWrap.innerHTML = '';
  opts.forEach((opt,idx)=>{
    const b = document.createElement('button');
    b.className='answer-btn';
    b.textContent = `${String.fromCharCode(65+idx)}. ${opt}`;
    b.addEventListener('click',()=>selectAnswer(opt,q));
    answersWrap.appendChild(b);
  });
  // progress
  const pct = Math.round((appState.currentIndex / appState.questions.length)*100);
  progressBar.style.width = `${pct}%`;
}

function selectAnswer(selected,q){
  // disable answers
  document.querySelectorAll('.answer-btn').forEach(b=>b.disabled=true);
  const correct = selected === q.correct;
  if(correct){ appState.score++; playSfx(sfxCorrect);} else { playSfx(sfxWrong); }
  // show feedback popup
  feedbackPopup.classList.remove('hidden');
  feedbackText.textContent = correct ? 'Correct ✅' : 'Incorrect ❌';
  feedbackExplanation.textContent = q.explanation || '';
}

function goToNextQuestion(){
  feedbackPopup.classList.add('hidden');
  appState.currentIndex++;
  // reload ad
  reloadAd();
  if(appState.currentIndex >= appState.questions.length){
    showResults();
  } else {
    renderQuestion();
  }
}

function showResults(){
  quizPage.classList.add('hidden');
  resultsPage.classList.remove('hidden');
  resultsScore.textContent = appState.score;
  // determine message
  const s = appState.score;
  if(s<=3){ resultsTitle.textContent = 'Kamu belum siap ke Jepang...'; resultsSub.textContent='Bisa bahasa Jepang jadi lebih tenang. Ayo semangat!'; resultsEmote.textContent='😅'; }
  else if(s<=6){ resultsTitle.textContent='Perlu persiapan sedikit lagi!'; resultsSub.textContent='Jangan menyerah, ayo coba lagi!'; resultsEmote.textContent='🙂'; }
  else if(s<=9){ resultsTitle.textContent='Kamu sudah siap ke Jepang!'; resultsSub.textContent='Tapi bisakah kamu dapat nilai sempurna?'; resultsEmote.textContent='😎'; }
  else { resultsTitle.textContent='Apakah kamu orang Jepang?'; resultsSub.textContent='Selamat! Nilai sempurna! Coba kategori lainnya!'; resultsEmote.textContent='🏆'; }
}

function saveResultAndGoStatus(){
  const attempts = JSON.parse(localStorage.getItem('uji_attempts')||'[]');
  attempts.push({date:new Date().toISOString(),score:appState.score,level:appState.level,category:appState.category});
  localStorage.setItem('uji_attempts',JSON.stringify(attempts));
  showStatus();
}

function showStatus(){
  resultsPage.classList.add('hidden');
  quizPage.classList.add('hidden');
  settingsPage.classList.add('hidden');
  statusPage.classList.remove('hidden');
  // load attempts
  const attempts = JSON.parse(localStorage.getItem('uji_attempts')||'[]');
  attemptCount.textContent = attempts.length;
  const avg = attempts.length ? (attempts.reduce((s,a)=>s+a.score,0)/attempts.length).toFixed(2) : 0;
  averageScore.textContent = avg;
  // chart
  const labels = attempts.map(a=> (new Date(a.date)).toLocaleDateString());
  const data = attempts.map(a=>a.score);
  if(window._statusChart) window._statusChart.destroy();
  window._statusChart = new Chart(statusChartEl,{type:'line',data:{labels, datasets:[{label:'Skor',data,fill:false,tension:0.4}]},options:{scales:{y:{min:0,max:10}}}});
}

function deleteAllResults(){
  if(!confirm('Hapus semua hasil?')) return; localStorage.removeItem('uji_attempts'); showStatus();
}

function showSettings(){
  settingsPage.classList.remove('hidden');
}
function closeSettings(){
  settingsPage.classList.add('hidden');
}

function saveSettingsAndApply(){
  const theme = themeSelect.value;
  const sfx = soundSelect.value === 'on';
  const notif = notifSelect.value === 'on';
  localStorage.setItem('uji_settings', JSON.stringify({theme,sfx,notif}));
  applySettings({theme,sfx});
  goHome();
}
function loadSettings(){
  const st = JSON.parse(localStorage.getItem('uji_settings')||'{}');
  if(st.theme) { document.body.className = `theme-${st.theme}`; themeSelect.value = st.theme; }
  if(typeof st.sfx !== 'undefined') { appState.sfxOn = st.sfx; soundSelect.value = st.sfx? 'on':'off'; }
}
function applySettings(s){
  document.body.className = `theme-${s.theme}`;
  appState.sfxOn = s.sfx;
}

function reloadAd(){
  // simple visual reload of ad area
  adBar.textContent = '[Iklan] (reload ' + new Date().toLocaleTimeString() + ')';
}

// utilities
function shuffle(a){
  for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}
  return a;
}

init();




/* Small UX: close overlay if clicked */
overlay.addEventListener('click',()=>{ closeLevelModal(); });
