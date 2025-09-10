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
