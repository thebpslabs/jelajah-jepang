// Wait for the DOM to be fully loaded before running the script
document.addEventListener('DOMContentLoaded', () => {

    // --- ACHIEVEMENTS DATA --- //
    const ALL_ACHIEVEMENTS = {
        'FIRST_GAME': { title: 'Langkah Pertama', description: 'Selesaikan game pertamamu.', icon: 'assets/achievements/first_game.png' },
        'PLAY_10': { title: 'Petualang Junior', description: 'Mainkan 10 game.', icon: 'assets/achievements/play_10.png' },
        'PLAY_20': { title: 'Petualang Giat', description: 'Mainkan 20 game.', icon: 'assets/achievements/play_20.png' },
        'PLAY_30': { title: 'Petualang Senior', description: 'Mainkan 30 game.', icon: 'assets/achievements/play_30.png' },
        'PLAY_50': { title: 'Petualang Veteran', description: 'Mainkan 50 game.', icon: 'assets/achievements/play_50.png' },
        'PLAY_100': { title: 'Legenda Jepang', description: 'Mainkan 100 game.', icon: 'assets/achievements/play_100.png' },
        'SCORE_1000': { title: 'Skor Tinggi', description: 'Raih skor lebih dari 1000.', icon: 'assets/achievements/score_1000.png' },
        'SCORE_1500': { title: 'Skor Fantastis', description: 'Raih skor lebih dari 1500.', icon: 'assets/achievements/score_1500.png' },
        'SCORE_2000': { title: 'Skor Master', description: 'Raih skor lebih dari 2000.', icon: 'assets/achievements/score_2000.png' },
        'SCORE_3000': { title: 'Skor Dewa', description: 'Raih skor lebih dari 3000.', icon: 'assets/achievements/score_3000.png' },
        'PERFECT_L1_Restoran': { title: 'Sempurna: Restoran L1', description: 'Skor sempurna di Restoran Level 1.', icon: 'assets/achievements/perfect.png' },
        'PERFECT_L1_Minimarket': { title: 'Sempurna: Minimarket L1', description: 'Skor sempurna di Minimarket Level 1.', icon: 'assets/achievements/perfect.png' },
        'PERFECT_L1_Kereta': { title: 'Sempurna: Kereta L1', description: 'Skor sempurna di Kereta Level 1.', icon: 'assets/achievements/perfect.png' },
        'PERFECT_L1_Apotek': { title: 'Sempurna: Apotek L1', description: 'Skor sempurna di Apotek Level 1.', icon: 'assets/achievements/perfect.png' },
        'PERFECT_ALL_L1': { title: 'Master Level 1', description: 'Skor sempurna di semua kategori Level 1.', icon: 'assets/achievements/master_level.png' },
    };


    // --- STATE MANAGEMENT --- //
    let achievementPopupQueue = []; // Queue for showing multiple achievement popups
    const gameState = {
        currentPage: 'main-menu',
        soundEnabled: true,
        currentLevel: 'level1',
        currentCategory: null,
        questions: [],
        currentQuestionIndex: 0,
        score: 0,
        comboStreak: 0,
        correctAnswersCount: 0,
        questionTimer: null,
        timeLeft: 0,
        localLeaderboard: [],
        playerData: null,
        sessionReview: [], // Stores questions and answers from the last game for the Journal
    };

    // --- DOM ELEMENT SELECTORS --- //
    const UIElements = {
        pages: document.querySelectorAll('.page'),
        appContainer: document.getElementById('app-container'),
        mainMenu: {
            userDisplayMode: document.getElementById('user-display-mode'),
            userEditMode: document.getElementById('user-edit-mode'),
            currentUserDisplay: document.getElementById('current-username-display'),
            changeNameBtn: document.getElementById('change-name-btn'),
            newUserInput: document.getElementById('new-username-input'),
            saveUserBtn: document.getElementById('save-user-btn'),
            levelDisplay: document.getElementById('level-display'),
            xpBarInner: document.getElementById('xp-bar-inner'),
            xpText: document.getElementById('xp-text'),
            startBtn: document.getElementById('start-btn'),
            adventureLogBtn: document.getElementById('adventure-log-btn'),
            guidebookBtn: document.getElementById('guidebook-btn'),
            settingsBtn: document.getElementById('settings-btn')
        },
        levelPage: {
            difficultySelect: document.getElementById('difficulty-select'),
            categoryBtns: document.querySelectorAll('.category-btn'),
            backBtn: document.getElementById('back-to-home-from-level')
        },
        quizPage: {
            exitBtn: document.getElementById('exit-quiz-btn'),
            title: document.getElementById('quiz-title'),
            questionText: document.getElementById('question-text'),
            answerButtons: document.getElementById('answer-buttons'),
            progressBar: document.getElementById('progress-bar'),
            currentScoreDisplay: document.getElementById('current-score-display'),
        },
        hasilPage: {
            shareBtn: document.getElementById('share-btn'),
            journalBtn: document.getElementById('journal-btn'),
            retryBtn: document.getElementById('retry-btn'),
            homeBtn: document.getElementById('home-btn'),
        },
        jejakPetualanganPage: {
            tabs: document.querySelectorAll('#jejak-petualangan-page .tab-btn'),
            achievementsGrid: document.getElementById('achievements-grid'),
            leaderboardBody: document.getElementById('leaderboard-body'),
            backBtn: document.getElementById('back-to-home-from-log')
        },
        guidebookPage: {
            backBtn: document.getElementById('back-to-home-from-guide')
        },
        settingsOverlay: {
            overlay: document.getElementById('settings-overlay'),
            soundToggleBtn: document.getElementById('sound-toggle-btn'),
            resetBtn: document.getElementById('reset-adventure-btn'),
            closeBtn: document.getElementById('close-settings-btn')
        },
        feedbackOverlay: {
            overlay: document.getElementById('feedback-overlay'),
            title: document.getElementById('feedback-title'),
            text: document.getElementById('feedback-text'),
            nextBtn: document.getElementById('next-question-btn')
        },
        confirmationOverlay: {
             overlay: document.getElementById('confirmation-overlay'),
             confirmBtn: document.getElementById('confirm-reset-btn'),
             cancelBtn: document.getElementById('cancel-reset-btn')
        },
        achievementPopup: {
            overlay: document.getElementById('achievement-unlocked-overlay'),
            icon: document.getElementById('achievement-popup-icon'),
            title: document.getElementById('achievement-popup-title'),
            desc: document.getElementById('achievement-popup-desc'),
            shareBtn: document.getElementById('achievement-popup-share-btn'),
            okBtn: document.getElementById('achievement-popup-ok-btn'),
        },
        journalPopup: {
            overlay: document.getElementById('journal-overlay'),
            content: document.getElementById('journal-content'),
            closeBtn: document.getElementById('journal-close-btn'),
        },
        sounds: {
            click: document.getElementById('click-sound'),
            correct: document.getElementById('correct-sound'),
            wrong: document.getElementById('wrong-sound')
        }
    };

    // --- DATA HANDLING & PLAYER PROFILE --- //
    function createNewPlayerData() {
        return {
            username: 'Petualang', level: 1, xp: 0,
            totalGamesPlayed: 0, highScore: 0,
            achievements: [], perfectScores: {},
            unlockedLevels: { 'Restoran': 1, 'Minimarket': 1, 'Kereta': 1, 'Apotek': 1 }
        };
    }
    function loadGameData() {
        const savedPlayerData = localStorage.getItem('jepangAdventurePlayerData');
        if (savedPlayerData) {
            gameState.playerData = JSON.parse(savedPlayerData);
            if (!gameState.playerData.perfectScores) gameState.playerData.perfectScores = {};
            if (!gameState.playerData.unlockedLevels) gameState.playerData.unlockedLevels = createNewPlayerData().unlockedLevels;
        } else {
            gameState.playerData = createNewPlayerData();
        }
        const savedLeaderboard = localStorage.getItem('jepangAdventureLeaderboard');
        if (savedLeaderboard) { gameState.localLeaderboard = JSON.parse(savedLeaderboard); }
        const savedSoundSetting = localStorage.getItem('jepangAdventureSound');
        if (savedSoundSetting !== null) { gameState.soundEnabled = JSON.parse(savedSoundSetting); }
        updateSoundButtonUI();
        updateUserUI();
    }
    function saveGameData() {
        localStorage.setItem('jepangAdventurePlayerData', JSON.stringify(gameState.playerData));
        localStorage.setItem('jepangAdventureLeaderboard', JSON.stringify(gameState.localLeaderboard));
    }
    function resetCurrentPlayerData() {
        gameState.playerData = createNewPlayerData();
        gameState.localLeaderboard = []; 
        saveGameData();
        updateUserUI();
        alert(`Data petualangan telah direset!`);
    }

    // --- LEVEL & XP SYSTEM --- //
    function calculateXpForNextLevel(currentLevel) {
        const tier = Math.floor((currentLevel - 1) / 10);
        return (tier + 1) * 100;
    }
    function addXp(score) {
        const earnedXp = Math.floor(score * 0.01);
        gameState.playerData.xp += earnedXp;
        let xpNeeded = calculateXpForNextLevel(gameState.playerData.level);
        while (gameState.playerData.xp >= xpNeeded) {
            gameState.playerData.xp -= xpNeeded;
            gameState.playerData.level++;
            xpNeeded = calculateXpForNextLevel(gameState.playerData.level);
        }
    }

    // --- UI & NAVIGATION --- //
    function updateUserUI() {
        const { username, level, xp } = gameState.playerData;
        UIElements.mainMenu.currentUserDisplay.textContent = username;
        UIElements.mainMenu.levelDisplay.textContent = `Level ${level}`;
        const xpNeeded = calculateXpForNextLevel(level);
        const xpPercentage = (xp / xpNeeded) * 100;
        UIElements.mainMenu.xpBarInner.style.width = `${xpPercentage}%`;
        UIElements.mainMenu.xpText.textContent = `${Math.floor(xp)} / ${xpNeeded} XP`;
    }
    function navigateTo(pageId) {
        playSound(UIElements.sounds.click);
        UIElements.pages.forEach(page => page.classList.remove('active'));
        document.getElementById(pageId).classList.add('active');
        setRandomBackground();
        if (pageId === 'jejak-petualangan-page') {
            displayAchievements();
            displayLeaderboard();
        } else if (pageId === 'level-page') {
            updateLevelUnlocks();
        }
    }
    function toggleOverlay(overlayId, show) {
        const overlay = document.getElementById(overlayId);
        if (show) overlay.classList.add('active');
        else overlay.classList.remove('active');
    }
    function setRandomBackground() {
        const bgIndex = Math.floor(Math.random() * 10) + 1;
        UIElements.appContainer.style.backgroundImage = `url('assets/Background${bgIndex}.jpg')`;
    }
    function updateSoundButtonUI() {
        UIElements.settingsOverlay.soundToggleBtn.textContent = `Sounds: ${gameState.soundEnabled ? 'ON' : 'OFF'}`;
    }

    // --- SOUND --- //
    async function playSound(soundElement) {
        if (gameState.soundEnabled && soundElement) {
            try {
                soundElement.currentTime = 0;
                await soundElement.play();
            } catch (error) { console.error("Error playing sound:", error); }
        }
    }

    // --- QUIZ LOGIC --- //
    async function startQuiz(level, category) {
        Object.assign(gameState, {
            currentLevel: level, currentCategory: category,
            currentQuestionIndex: 0, score: 0, comboStreak: 0,
            correctAnswersCount: 0, sessionReview: []
        });
        
        try {
            const response = await fetch(`database_${category.toLowerCase()}.json`);
            const db = await response.json();
            const questionPool = db[level]?.[category];
            gameState.questions = shuffleArray([...questionPool]).slice(0, 10);
            navigateTo('quiz-page');
            displayQuestion();
        } catch (error) {
            console.error('Could not load quiz:', error);
            alert(`Gagal memuat kuis untuk ${category}.`);
        }
    }
    
    function displayQuestion() {
        const question = gameState.questions[gameState.currentQuestionIndex];
        document.getElementById('progress-bar').style.width = `${(gameState.currentQuestionIndex / gameState.questions.length) * 100}%`;
        document.getElementById('current-score-display').textContent = `Skor: ${gameState.score}`;
        document.getElementById('quiz-title').textContent = `Petualangan di ${gameState.currentCategory}`;
        document.getElementById('question-text').textContent = question.question;
        document.getElementById('quiz-image').src = `assets/${question.image}`;

        const answerButtons = UIElements.quizPage.answerButtons;
        answerButtons.innerHTML = '';
        shuffleArray([...question.answers]).forEach(answer => {
            const button = document.createElement('button');
            button.textContent = answer;
            button.classList.add('answer-btn', `${gameState.currentCategory}-btn`);
            button.addEventListener('click', () => handleAnswer(answer));
            answerButtons.appendChild(button);
        });
        startTimer();
    }
    
    function startTimer() {
        clearInterval(gameState.questionTimer);
        gameState.timeLeft = 10;
        const timerBar = document.getElementById('timer-bar-inner');
        timerBar.style.transition = 'none';
        timerBar.style.width = '100%';
        void timerBar.offsetWidth;
        timerBar.style.transition = 'width 10s linear';
        timerBar.style.width = '0%';
        gameState.questionTimer = setInterval(() => {
            gameState.timeLeft -= 0.1;
            if (gameState.timeLeft <= 0) { clearInterval(gameState.questionTimer); }
        }, 100);
    }
    
    function handleAnswer(selectedAnswer) {
        clearInterval(gameState.questionTimer);
        const question = gameState.questions[gameState.currentQuestionIndex];
        const isCorrect = selectedAnswer === question.correct;

        gameState.sessionReview.push({
            questionText: question.question,
            answers: question.answers,
            userAnswer: selectedAnswer,
            correctAnswer: question.correct,
        });
        
        let questionPoints = 0, timerBonus = 0, comboBonus = 0;
        if (isCorrect) {
            playSound(UIElements.sounds.correct);
            gameState.comboStreak++;
            gameState.correctAnswersCount++;
            if (gameState.currentLevel === 'level1') questionPoints = 100;
            else if (gameState.currentLevel === 'level2') questionPoints = 125;
            else if (gameState.currentLevel === 'level3') questionPoints = 150;
            timerBonus = Math.floor(gameState.timeLeft * 10);
            if (gameState.comboStreak >= 2) comboBonus = (gameState.comboStreak - 1) * 10;
        } else {
            playSound(UIElements.sounds.wrong);
            gameState.comboStreak = 0;
        }
        gameState.score += questionPoints + timerBonus + comboBonus;
        document.getElementById('current-score-display').textContent = `Skor: ${gameState.score}`;
        
        UIElements.feedbackOverlay.title.textContent = isCorrect ? 'Benar!' : 'Salah!';
        UIElements.feedbackOverlay.text.textContent = question.feedback;
        toggleOverlay('feedback-overlay', true);
    }
    
    function nextQuestion() {
        gameState.currentQuestionIndex++;
        if (gameState.currentQuestionIndex < gameState.questions.length) {
            displayQuestion();
        } else {
            endQuiz();
        }
    }

    function endQuiz() {
        playerData = gameState.playerData;
        playerData.totalGamesPlayed++;
        if (gameState.score > playerData.highScore) playerData.highScore = gameState.score;
        gameState.localLeaderboard.push({
            name: playerData.username, score: gameState.score,
            category: `${gameState.currentCategory} (Lvl ${gameState.currentLevel.slice(-1)})`,
            date: new Date().toISOString()
        });
        addXp(gameState.score);
        if (gameState.correctAnswersCount === 10) {
            const perfectKey = `${gameState.currentLevel}_${gameState.currentCategory}`;
            playerData.perfectScores[perfectKey] = true;
        }
        const newlyUnlocked = checkAchievements();
        saveGameData();
        updateUserUI();
        displayResults();
        navigateTo('hasil-page');
        if (newlyUnlocked.length > 0) {
            achievementPopupQueue.push(...newlyUnlocked);
            setTimeout(processAchievementQueue, 500);
        }
    }

    // --- RESULT, LEADERBOARD, & ACHIEVEMENTS --- //
    function displayResults() {
        const correctAnswers = gameState.correctAnswersCount;
        let result = {};
        if (correctAnswers === 10) result = { text: "SEMPURNA!", subtext: "Kerja bagus, master!", image: "Success2.jpg" };
        else if (correctAnswers >= 7) result = { text: "Kamu sudah siap ke Jepang!", subtext: "Hampir sempurna!", image: "Success1.jpg" };
        else if (correctAnswers >= 4) result = { text: "Perlu persiapan sedikit lagi!", subtext: "Jangan menyerah!", image: "Fail2.jpg" };
        else result = { text: "Kamu belum siap ke Jepang...", subtext: "Ayo semangat!", image: "Fail1.jpg" };
        
        document.getElementById('score-text').textContent = `Skor: ${gameState.score} (${correctAnswers}/10)`;
        document.getElementById('result-text').textContent = result.text;
        document.getElementById('result-subtext').textContent = result.subtext;
        document.getElementById('result-image').src = `assets/${result.image}`;
    }

    function displayAchievements() {
        const grid = UIElements.jejakPetualanganPage.achievementsGrid;
        grid.innerHTML = '';
        for (const id in ALL_ACHIEVEMENTS) {
            const achievement = ALL_ACHIEVEMENTS[id];
            const isUnlocked = gameState.playerData.achievements.includes(id);
            const item = document.createElement('div');
            item.className = `achievement-item ${isUnlocked ? 'unlocked' : 'locked'}`;
            item.title = `${achievement.title}\n${achievement.description}`;
            item.addEventListener('click', () => {
                playSound(UIElements.sounds.click);
                showAchievementPopup(id);
            });
            item.innerHTML = `
                <img src="${achievement.icon}" alt="${achievement.title}" class="achievement-icon">
                <p class="achievement-title">${achievement.title}</p>`;
            grid.appendChild(item);
        }
    }
    
    function displayLeaderboard() {
        const leaderboardBody = UIElements.jejakPetualanganPage.leaderboardBody;
        leaderboardBody.innerHTML = '';
        const topScores = [...gameState.localLeaderboard].sort((a, b) => b.score - a.score).slice(0, 50);
        if (topScores.length === 0) {
            leaderboardBody.innerHTML = '<tr><td colspan="4">Belum ada skor.</td></tr>';
            return;
        }
        topScores.forEach((entry, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `<td>${index + 1}</td><td>${entry.name}</td><td style="text-align: right;">${entry.score}</td><td>${entry.category}</td>`;
            leaderboardBody.appendChild(row);
        });
    }
    
    function checkAchievements() {
        const { playerData, score } = gameState;
        const newlyUnlocked = [];
        const has = (id) => playerData.achievements.includes(id);

        if (!has('FIRST_GAME') && playerData.totalGamesPlayed >= 1) newlyUnlocked.push('FIRST_GAME');
        if (!has('PLAY_10') && playerData.totalGamesPlayed >= 10) newlyUnlocked.push('PLAY_10');
        if (!has('PLAY_50') && playerData.totalGamesPlayed >= 50) newlyUnlocked.push('PLAY_50');
        if (!has('PLAY_100') && playerData.totalGamesPlayed >= 100) newlyUnlocked.push('PLAY_100');
        if (!has('SCORE_1000') && score > 1000) newlyUnlocked.push('SCORE_1000');
        if (!has('SCORE_2000') && score > 2000) newlyUnlocked.push('SCORE_2000');
        if (!has('SCORE_3000') && score > 3000) newlyUnlocked.push('SCORE_3000');
        
        const perfectId = `PERFECT_${gameState.currentLevel.toUpperCase()}_${gameState.currentCategory}`;
        if (gameState.correctAnswersCount === 10 && ALL_ACHIEVEMENTS[perfectId] && !has(perfectId)) newlyUnlocked.push(perfectId);
        
        if (!has('PERFECT_ALL_L1')) {
            const allL1Perfect = ['Restoran', 'Minimarket', 'Kereta', 'Apotek'].every(cat => playerData.perfectScores[`level1_${cat}`]);
            if (allL1Perfect) newlyUnlocked.push('PERFECT_ALL_L1');
        }
        if (newlyUnlocked.length > 0) playerData.achievements.push(...newlyUnlocked);
        return newlyUnlocked;
    }

    function showAchievementPopup(achievementId) {
        const achievement = ALL_ACHIEVEMENTS[achievementId];
        if (!achievement) return;
        UIElements.achievementPopup.icon.src = achievement.icon;
        UIElements.achievementPopup.title.textContent = achievement.title;
        UIElements.achievementPopup.desc.textContent = achievement.description;
        UIElements.achievementPopup.shareBtn.dataset.achievementTitle = achievement.title;
        toggleOverlay('achievement-unlocked-overlay', true);
    }

    function processAchievementQueue() {
        if (achievementPopupQueue.length > 0) {
            showAchievementPopup(achievementPopupQueue.shift());
        }
    }

    function displayJournal() {
        const content = UIElements.journalPopup.content;
        content.innerHTML = '';
        gameState.sessionReview.forEach((item, index) => {
            const itemHTML = `
                <div class="journal-item">
                    <p class="journal-question">${index + 1}. ${item.questionText}</p>
                    ${item.answers.map(answer => `
                        <div class="journal-answer 
                            ${answer === item.correctAnswer ? 'correct' : ''} 
                            ${answer === item.userAnswer && item.userAnswer !== item.correctAnswer ? 'incorrect' : ''}
                            ${answer === item.userAnswer ? 'user-answer' : ''}
                        ">${answer}</div>
                    `).join('')}
                </div>`;
            content.innerHTML += itemHTML;
        });
        toggleOverlay('journal-overlay', true);
    }

    // --- EVENT LISTENERS --- //
    UIElements.mainMenu.changeNameBtn.addEventListener('click', () => {
        UIElements.mainMenu.userDisplayMode.style.display = 'none';
        UIElements.mainMenu.userEditMode.style.display = 'flex';
        UIElements.mainMenu.newUserInput.value = gameState.playerData.username;
        UIElements.mainMenu.newUserInput.focus();
    });
    UIElements.mainMenu.saveUserBtn.addEventListener('click', () => {
        const newName = UIElements.mainMenu.newUserInput.value.trim();
        if (newName) {
            gameState.playerData.username = newName;
            saveGameData();
            updateUserUI();
        }
        UIElements.mainMenu.userDisplayMode.style.display = 'flex';
        UIElements.mainMenu.userEditMode.style.display = 'none';
    });
    UIElements.mainMenu.startBtn.addEventListener('click', () => navigateTo('level-page'));
    UIElements.mainMenu.adventureLogBtn.addEventListener('click', () => navigateTo('jejak-petualangan-page'));
    UIElements.mainMenu.guidebookBtn.addEventListener('click', () => navigateTo('guidebook-page'));
    UIElements.mainMenu.settingsBtn.addEventListener('click', () => toggleOverlay('settings-overlay', true));
    
    UIElements.hasilPage.journalBtn.addEventListener('click', () => displayJournal());
    UIElements.journalPopup.closeBtn.addEventListener('click', () => toggleOverlay('journal-overlay', false));
    
    UIElements.achievementPopup.okBtn.addEventListener('click', () => {
        toggleOverlay('achievement-unlocked-overlay', false);
        setTimeout(processAchievementQueue, 300);
    });

    UIElements.achievementPopup.shareBtn.addEventListener('click', async () => {
        const title = UIElements.achievementPopup.shareBtn.dataset.achievementTitle;
        const text = `I just unlocked the "${title}" achievement in Petualangan di Jepang!`;
        const url = 'https://kuis-bahasa-jepang.pages.dev/';
        if (navigator.share) await navigator.share({ title, text, url });
        else await navigator.clipboard.writeText(`${text}\n\n${url}`), alert('Copied to clipboard!');
    });
    
    // Other simple listeners...
    ['click', 'change', 'submit'].forEach(evt => document.body.addEventListener(evt, () => playSound(UIElements.sounds.click), true));
    UIElements.feedbackOverlay.nextBtn.addEventListener('click', () => { toggleOverlay('feedback-overlay', false); nextQuestion(); });
    UIElements.settingsOverlay.closeBtn.addEventListener('click', () => toggleOverlay('settings-overlay', false));
    UIElements.confirmationOverlay.cancelBtn.addEventListener('click', () => toggleOverlay('confirmation-overlay', false));
    UIElements.settingsOverlay.resetBtn.addEventListener('click', () => toggleOverlay('confirmation-overlay', true));
    UIElements.confirmationOverlay.confirmBtn.addEventListener('click', () => { resetCurrentPlayerData(); toggleOverlay('confirmation-overlay', false); });
    UIElements.levelPage.backBtn.addEventListener('click', () => navigateTo('main-menu'));
    UIElements.jejakPetualanganPage.backBtn.addEventListener('click', () => navigateTo('main-menu'));
    UIElements.guidebookPage.backBtn.addEventListener('click', () => navigateTo('main-menu'));
    UIElements.hasilPage.homeBtn.addEventListener('click', () => navigateTo('level-page'));
    UIElements.hasilPage.retryBtn.addEventListener('click', () => startQuiz(gameState.currentLevel, gameState.currentCategory));

    // --- INITIALIZATION --- //
    loadGameData();
});