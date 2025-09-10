// app.js

// Shuffle utility
function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// Global state
let state = {
    level: localStorage.getItem('kbj_level') || 'Belum pernah ke Jepang',
    category: null,
    questions: [],
    currentIndex: 0,
    score: 0
};

let settings = {
    theme: localStorage.getItem('kbj_theme') || 'fun',
    sound: true,
    notifications: true
};

let attempts = JSON.parse(localStorage.getItem('kbj_attempts') || '[]');

// DOM elements
const levelBtnValue = document.getElementById('levelBtnValue');
const levelBtn = document.getElementById('levelBtn');
const mulaiBtn = document.getElementById('mulaiBtn');
const statusBtn = document.getElementById('statusBtn');
const settingsBtn = document.getElementById('settingsBtn');
const contentArea = document.getElementById('contentArea');
const mainButtons = document.getElementById('mainButtons');
const feedbackEl = document.getElementById('feedback');
const levelPopup = document.getElementById('levelPopup');
const settingsPopup = document.getElementById('settingsPopup');
const statusPopup = document.getElementById('statusPopup');

const colors = ['#ffe4f0','#f0fff4','#fff4e6','#e6f0ff','#fff0f6'];

function randomBg() {
    document.body.style.background = colors[Math.floor(Math.random() * colors.length)];
}

// Initialize home
function init() {
    levelBtnValue.textContent = state.level;
    mainButtons.style.display = 'flex';
    contentArea.innerHTML = '';
    feedbackEl.className = 'feedback';
    document.body.setAttribute('data-theme', settings.theme);
    randomBg();
}

// Bind main actions
function bindActions() {
    // Level selection
    levelBtn.addEventListener('click', () => {
        levelPopup.innerHTML = '';
        ['Belum pernah ke Jepang','Pernah ke Jepang','Sering ke Jepang'].forEach(lvl => {
            const b = document.createElement('button');
            b.className = 'btn';
            b.textContent = lvl;
            b.addEventListener('click', () => {
                state.level = lvl;
                levelBtnValue.textContent = lvl;
                localStorage.setItem('kbj_level', lvl);
                levelPopup.classList.remove('show');
            });
            levelPopup.appendChild(b);
        });
        levelPopup.classList.add('show');
    });

    // Settings
    settingsBtn.addEventListener('click', openSettings);

    // Status
    statusBtn.addEventListener('click', openStatus);

    // Mulai quiz
    mulaiBtn.addEventListener('click', onMulai);
}

// Open Settings popup
function openSettings() {
    settingsPopup.innerHTML = '';
    ['fun','light','dark'].forEach(t => {
        const b = document.createElement('button');
        b.className = 'btn';
        b.textContent = 'Tema ' + t;
        b.addEventListener('click', () => {
            settings.theme = t;
            localStorage.setItem('kbj_theme', t);
            document.body.setAttribute('data-theme', t);
            settingsPopup.classList.remove('show');
        });
        settingsPopup.appendChild(b);
    });

    const soundBtn = document.createElement('button');
    soundBtn.className = 'btn';
    soundBtn.textContent = 'Suara: ' + (settings.sound ? 'On' : 'Off');
    soundBtn.addEventListener('click', () => {
        settings.sound = !settings.sound;
        soundBtn.textContent = 'Suara: ' + (settings.sound ? 'On' : 'Off');
    });
    settingsPopup.appendChild(soundBtn);

    const notifBtn = document.createElement('button');
    notifBtn.className = 'btn';
    notifBtn.textContent = 'Notifikasi: ' + (settings.notifications ? 'On' : 'Off');
    notifBtn.addEventListener('click', () => {
        settings.notifications = !settings.notifications;
        notifBtn.textContent = 'Notifikasi: ' + (settings.notifications ? 'On' : 'Off');
    });
    settingsPopup.appendChild(notifBtn);

    settingsPopup.classList.add('show');
}

// Open Status popup
function openStatus() {
    statusPopup.innerHTML = '';
    if(attempts.length === 0){
        statusPopup.innerHTML = '<div>Tidak ada data percobaan</div>';
        statusPopup.classList.add('show');
        return;
    }
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 200;
    statusPopup.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0,0,canvas.width,canvas.height);

    attempts.forEach((a,i) => {
        ctx.fillStyle = '#ff6b00';
        ctx.fillRect(i*35, canvas.height-(a.score*15), 30, a.score*15);
        ctx.fillStyle = '#000';
        ctx.fillText(a.category, i*35, canvas.height-2);
    });

    const delBtn = document.createElement('button');
    delBtn.className = 'btn';
    delBtn.textContent = 'Hapus Semua';
    delBtn.addEventListener('click', () => {
        attempts = [];
        localStorage.setItem('kbj_attempts', JSON.stringify(attempts));
        statusPopup.classList.remove('show');
    });
    statusPopup.appendChild(delBtn);

    statusPopup.classList.add('show');
}

// On Mulai clicked
function onMulai() {
    mainButtons.style.display = 'none';
    const cats = ['Restoran','Minimarket','Rumah Sakit','Kereta'];
    const catPics = ['assets/restaurant1.jpg','assets/minimarket1.jpg','assets/hospital1.jpg','assets/train1.jpg'];
    contentArea.innerHTML = '<div class="category-grid"></div><button class="homeBtn">Kembali ke Home</button>';
    const grid = contentArea.querySelector('.category-grid');

    cats.forEach((c,i)=>{
        const div = document.createElement('div');
        div.className='cat';
        div.dataset.cat = c;
        div.innerHTML = `<img src="${catPics[i]}"><div>${c}</div>`;
        div.addEventListener('click',()=>{ 
            state.category = c; 
            startQuiz(); 
        });
        grid.appendChild(div);
    });

    contentArea.querySelector('.homeBtn').addEventListener('click', goHome);
    randomBg();
}

// Start quiz
function startQuiz() {
    if(!DATABASE[state.level] || !DATABASE[state.level][state.category]){
        alert('Database kosong untuk level/category ini!');
        init();
        return;
    }

    state.questions = shuffleArray([...DATABASE[state.level][state.category]]);
    state.questions.forEach(q=>{q.options=shuffleArray([...q.options]);});
    state.currentIndex=0; state.score=0;
    renderQuestion();
}

// Render current question
function renderQuestion() {
    const q = state.questions[state.currentIndex];
    contentArea.innerHTML = `
    <div class='question-box'>
        <div class='qnum'>Pertanyaan ${state.currentIndex+1}/${state.questions.length}</div>
        <div class='qtext'>${q.q}</div>
        ${q.pic?`<img src='${q.pic}' style='width:200px;height:120px;object-fit:cover;border-radius:12px;margin-bottom:12px;'>`:''}
        <div class='answers'>${q.options.map(o=>`<div class='answer'>${o}</div>`).join('')}</div>
        <div class='progress-wrap'><div class='progress-bar' style='width:${(state.currentIndex/state.questions.length)*100}%'></div></div>
        <button class='homeBtn'>Kembali ke Home</button>
    </div>`;

    document.querySelectorAll('.answer').forEach(el=>{
        el.addEventListener('click', ()=> checkAnswer(el.textContent));
    });
    contentArea.querySelector('.homeBtn').addEventListener('click', goHome);
    randomBg();
}

// Check answer
function checkAnswer(selected) {
    const q = state.questions[state.currentIndex];
    const correct = (selected === q.answer);
    if(correct) state.score++;
    showFeedback(correct, q.explanation, q.picNext);
}

// Show feedback popup
function showFeedback(correct, explanation, pic){
    feedbackEl.innerHTML = `
    <div>${correct?'Benar!':'Salah!'}</div>
    <div>${explanation}</div>
    ${pic?`<img src='${pic}'>`:''}
    <button class='btn'>Next</button>`;
    feedbackEl.classList.add('show');

    feedbackEl.querySelector('button').addEventListener('click', nextQuestion);
}

// Next question
function nextQuestion(){
    feedbackEl.classList.remove('show');
    state.currentIndex++;
    if(state.currentIndex >= state.questions.length) showResults();
    else renderQuestion();
}

// Show results
function showResults(){
    contentArea.innerHTML = `
    <div class='results'>
        <div>Skor: ${state.score}/${state.questions.length}</div>
    </div>
    <button class='homeBtn'>Kembali ke Home</button>`;

    contentArea.querySelector('.homeBtn').addEventListener('click', goHome);

    attempts.push({score:state.score,category:state.category,date:new Date().toLocaleDateString()});
    localStorage.setItem('kbj_attempts', JSON.stringify(attempts));
}

// Go back home
function goHome(){
    init();
}

// Initialize on load
window.onload = ()=>{ init(); bindActions(); };

// Updated app.js with fixes

function createOverlay() {
    let overlay = document.getElementById('popupOverlay');
    if(!overlay){
        overlay = document.createElement('div');
        overlay.id='popupOverlay';
        overlay.style.position='fixed';
        overlay.style.top=0;
        overlay.style.left=0;
        overlay.style.width='100%';
        overlay.style.height='100%';
        overlay.style.background='rgba(0,0,0,0.4)';
        overlay.style.zIndex='50';
        overlay.style.display='none';
        document.body.appendChild(overlay);
    }
    return overlay;
}

const overlay = createOverlay();

function showPopup(popup){
    overlay.style.display='block';
    popup.classList.add('show');
}

function closePopup(popup){
    overlay.style.display='none';
    popup.classList.remove('show');
}

// Level button
levelBtn.addEventListener('click', () => {
    levelPopup.innerHTML = '';
    ['Belum pernah ke Jepang','Pernah ke Jepang','Sering ke Jepang'].forEach(lvl => {
        const b = document.createElement('button');
        b.className = 'btn';
        b.textContent = lvl;
        b.addEventListener('click', () => {
            state.level = lvl;
            levelBtnValue.textContent = lvl;
            localStorage.setItem('kbj_level', lvl);
            closePopup(levelPopup);
        });
        levelPopup.appendChild(b);
    });
    showPopup(levelPopup);
});

// Settings button
settingsBtn.addEventListener('click', () => {
    settingsPopup.innerHTML = '';
    ['fun','light','dark'].forEach(t => {
        const b = document.createElement('btn');
        b.className='btn';
        b.textContent='Tema '+t;
        b.addEventListener('click', ()=>{
            settings.theme = t;
            localStorage.setItem('kbj_theme', t);
            applyTheme();
        });
        settingsPopup.appendChild(b);
    });
    // Sound and Notifications buttons
    const soundBtn = document.createElement('button');
    soundBtn.className='btn';
    soundBtn.textContent='Suara: '+(settings.sound?'On':'Off');
    soundBtn.addEventListener('click', ()=>{settings.sound=!settings.sound;soundBtn.textContent='Suara: '+(settings.sound?'On':'Off');});
    settingsPopup.appendChild(soundBtn);

    const notifBtn = document.createElement('button');
    notifBtn.className='btn';
    notifBtn.textContent='Notifikasi: '+(settings.notifications?'On':'Off');
    notifBtn.addEventListener('click', ()=>{settings.notifications=!settings.notifications;notifBtn.textContent='Notifikasi: '+(settings.notifications?'On':'Off');});
    settingsPopup.appendChild(notifBtn);

    // Back button
    const backBtn = document.createElement('button');
    backBtn.className='btn';
    backBtn.textContent='Kembali';
    backBtn.addEventListener('click', ()=>closePopup(settingsPopup));
    settingsPopup.appendChild(backBtn);

    showPopup(settingsPopup);
});

// Apply theme to body
function applyTheme(){
    document.body.setAttribute('data-theme',settings.theme);
    if(settings.theme==='fun') randomBg();
    else document.body.style.background=settings.theme==='dark'?'#000':'#fff';
}

// Status popup
statusBtn.addEventListener('click', openStatus);
function openStatus(){
    statusPopup.innerHTML='';
    if(attempts.length===0){statusPopup.innerHTML='<div>Tidak ada data percobaan</div>'; showPopup(statusPopup); return;}
    const canvas=document.createElement('canvas');canvas.width=400;canvas.height=200;
    statusPopup.appendChild(canvas);
    const ctx=canvas.getContext('2d');ctx.clearRect(0,0,canvas.width,canvas.height);
    attempts.forEach((a,i)=>{
        ctx.fillStyle='#ff6b00';
        ctx.fillRect(i*35,canvas.height-(a.score*15),30,a.score*15);
        ctx.fillStyle='#000';
        ctx.fillText(a.category,i*35,canvas.height-2);
    });
    const delBtn=document.createElement('button');delBtn.className='btn';delBtn.textContent='Hapus Semua';
    delBtn.addEventListener('click',()=>{
        attempts=[];localStorage.setItem('kbj_attempts',JSON.stringify(attempts));
        closePopup(statusPopup);
    });
    statusPopup.appendChild(delBtn);

    const backBtn=document.createElement('button');backBtn.className='btn';backBtn.textContent='Kembali';
    backBtn.addEventListener('click',()=>closePopup(statusPopup));
    statusPopup.appendChild(backBtn);

    showPopup(statusPopup);
}

// Show results with messages
function showResults(){
    let msg='', submsg='', emoji='';
    if(state.score<=3){msg='Kamu belum siap ke Jepang...';submsg='Bisa bahasa Jepang jadi lebih tenang. Ayo semangat!';emoji='😅';}
    else if(state.score<=6){msg='Perlu persiapan sedikit lagi!';submsg='Jangan menyerah, ayo coba lagi!';emoji='🤔';}
    else if(state.score<=9){msg='Kamu sudah siap ke Jepang!';submsg='Tapi bisakah kamu dapat nilai sempurna?';emoji='🎉';}
    else {msg='Apakah kamu orang Jepang?';submsg='Selamat! Nilai sempurna! Coba kategori lainnya!';emoji='🏆';}

    contentArea.innerHTML=`
        <div class='results'>
            <div>Skor: ${state.score}/${state.questions.length}</div>
            <div>${msg} ${emoji}</div>
            <div>${submsg}</div>
        </div>
        <button class='homeBtn'>Kembali ke Home</button>
    `;
    contentArea.querySelector('.homeBtn').addEventListener('click', goHome);

    attempts.push({score:state.score,category:state.category,date:new Date().toLocaleDateString()});
    localStorage.setItem('kbj_attempts',JSON.stringify(attempts));
}

