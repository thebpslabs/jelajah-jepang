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
        // Add more achievements for Level 2 and 3 here...
    };


    // --- STATE MANAGEMENT --- //
    let achievementPopupQueue = []; // NEW: Queue for showing multiple achievement popups
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
        sessionReview: [], // NEW: Stores questions and answers from the last game for the Journal
    };

    // --- DOM ELEMENT SELECTORS --- //
    const UIElements = {
        pages: document.querySelectorAll('.page'),
        appContainer: document.getElementById('app-container'),
        mainMenu: {
            title: document.getElementById('main-title'),
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
            imageContainer: document.getElementById('quiz-image-container'),
            imageLink: document.getElementById('quiz-image-link'),
            image: document.getElementById('quiz-image'),
            attribution: document.getElementById('image-attribution'),
            questionText: document.getElementById('question-text'),
            answerButtons: document.getElementById('answer-buttons'),
            progressBar: document.getElementById('progress-bar'),
            scorePopupContainer: document.getElementById('score-popup-container'),
            currentScoreDisplay: document.getElementById('current-score-display'),
            timerBar: document.getElementById('timer-bar-inner')
        },
        hasilPage: {
            image: document.getElementById('result-image'),
            scoreText: document.getElementById('score-text'),
            resultText: document.getElementById('result-text'),
            resultSubtext: document.getElementById('result-subtext'),
            homeBtn: document.getElementById('home-btn'),
            shareBtn: document.getElementById('share-btn'),
            retryBtn: document.getElementById('retry-btn'),
            journalBtn: document.getElementById('journal-btn'), // NEW
        },
        jejakPetualanganPage: {
            tabs: document.querySelectorAll('#jejak-petualangan-page .tab-btn'),
            achievementsGrid: document.getElementById('achievements-grid'),
            leaderboardContent: document.getElementById('leaderboard'),
            leaderboardBody: document.getElementById('leaderboard-body'),
            backBtn: document.getElementById('back-to-home-from-log')
        },
        guidebookPage: {
            tabs: document.querySelectorAll('#guidebook-page .tab-btn'),
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
        journalPopup: { // NEW
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
    // ... (createNewPlayerData, loadGameData, saveGameData, resetCurrentPlayerData functions are unchanged)
    function createNewPlayerData() {
        return {
            username: 'Petualang',
            level: 1,
            xp: 0,
            totalGamesPlayed: 0,
            highScore: 0,
            achievements: [],
            perfectScores: {},
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
    // ... (calculateXpForNextLevel, addXp functions are unchanged)
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
    // ... (updateUserUI, navigateTo, toggleOverlay, setRandomBackground, updateSoundButtonUI functions are unchanged)
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
        gameState.currentPage = pageId;
        UIElements.pages.forEach(page => page.classList.remove('active'));
        const targetPage = document.getElementById(pageId);
        if (targetPage) targetPage.classList.add('active');
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
        if (overlay) {
            if (show) overlay.classList.add('active');
            else overlay.classList.remove('active');
        }
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
        gameState.currentLevel = level;
        gameState.currentCategory = category;
        gameState.currentQuestionIndex = 0;
        gameState.score = 0;
        gameState.comboStreak = 0;
        gameState.correctAnswersCount = 0;
        gameState.sessionReview = []; // Clear previous game's journal
        
        // ... (rest of startQuiz is unchanged)
        try {
            const categoryToFileMap = {
                'Restoran': 'database_restoran.json', 'Minimarket': 'database_minimarket.json',
                'Kereta': 'database_kereta.json', 'Apotek': 'database_apotek.json'
            };
            const fileName = categoryToFileMap[category];
            if (!fileName) { alert(`Database untuk kategori "${category}" tidak ditemukan.`); return; }
            const response = await fetch(fileName);
            if (!response.ok) throw new Error(`Network response was not ok: ${response.statusText}`);
            const quizDatabase = await response.json();
            const questionPool = quizDatabase[level]?.[category];
            if (!questionPool || questionPool.length === 0) { alert('Soal untuk kategori atau level ini belum tersedia.'); return; }
            gameState.questions = shuffleArray([...questionPool]).slice(0, 10);
            if (gameState.questions.length > 0) {
                navigateTo('quiz-page');
                displayQuestion();
            } else {
                alert('Tidak ada soal yang valid untuk memulai kuis.');
            }
        } catch (error) {
            console.error('Could not load or start quiz:', error);
            alert(`Gagal memuat data kuis untuk ${category}. Pastikan file database yang benar ada dan coba lagi.`);
        }
    }
    
    function displayQuestion() {
        // ... (displayQuestion is unchanged)
        const progress = (gameState.currentQuestionIndex / gameState.questions.length) * 100;
        UIElements.quizPage.progressBar.style.width = `${progress}%`;
        UIElements.quizPage.currentScoreDisplay.textContent = `Skor: ${gameState.score}`;
        const question = gameState.questions[gameState.currentQuestionIndex];
        UIElements.quizPage.title.textContent = `Petualangan di ${gameState.currentCategory}`;
        UIElements.quizPage.questionText.textContent = question.question;
        UIElements.quizPage.image.src = `assets/${question.image}`;
        const attributionPath = `assets/${question.image}`.replace(/\.(jpg|jpeg|png|gif)$/, '.txt');
        fetch(attributionPath)
            .then(response => { if (!response.ok) { throw new Error('Attribution file not found.'); } return response.text(); })
            .then(text => {
                const [attributionText, rawUrl] = text.split('\n');
                const url = rawUrl ? rawUrl.replace(/^Profile:\s*/, '').trim() : '';
                UIElements.quizPage.attribution.textContent = attributionText || '';
                UIElements.quizPage.attribution.style.display = 'block';
                if (url) { UIElements.quizPage.imageLink.href = url; UIElements.quizPage.imageLink.style.cursor = 'pointer'; }
                else { UIElements.quizPage.imageLink.href = '#'; UIElements.quizPage.imageLink.style.cursor = 'default'; }
            })
            .catch(error => {
                console.warn('Could not fetch attribution file:', error.message);
                UIElements.quizPage.attribution.style.display = 'none';
                UIElements.quizPage.imageLink.href = '#';
                UIElements.quizPage.imageLink.style.cursor = 'default';
            });
        UIElements.quizPage.answerButtons.innerHTML = '';
        const shuffledAnswers = shuffleArray([...question.answers]);
        shuffledAnswers.forEach(answer => {
            const button = document.createElement('button');
            button.textContent = answer;
            button.classList.add('answer-btn', `${gameState.currentCategory.replace(' ', '.')}-btn`);
            button.addEventListener('click', () => handleAnswer(answer));
            UIElements.quizPage.answerButtons.appendChild(button);
        });
        startTimer();
    }
    
    function startTimer() {
        // ... (startTimer is unchanged)
        clearInterval(gameState.questionTimer);
        gameState.timeLeft = 10;
        const timerBar = UIElements.quizPage.timerBar;
        timerBar.style.transition = 'none';
        timerBar.style.width = '100%';
        void timerBar.offsetWidth;
        timerBar.style.transition = 'width 10s linear';
        timerBar.style.width = '0%';
        gameState.questionTimer = setInterval(() => {
            gameState.timeLeft -= 0.1;
            if (gameState.timeLeft <= 0) { clearInterval(gameState.questionTimer); gameState.timeLeft = 0; }
        }, 100);
    }
    
    function showScorePopup(text, type = '') { /* ... unchanged ... */ }
    
    function handleAnswer(selectedAnswer) {
        clearInterval(gameState.questionTimer);
        UIElements.quizPage.timerBar.style.transition = 'none';
        UIElements.quizPage.answerButtons.querySelectorAll('.answer-btn').forEach(btn => btn.classList.add('disabled'));
        const question = gameState.questions[gameState.currentQuestionIndex];
        const isCorrect = selectedAnswer === question.correct;

        // NEW: Record the question and answer for the journal
        gameState.sessionReview.push({
            questionText: question.question,
            answers: question.answers, // Original order
            userAnswer: selectedAnswer,
            correctAnswer: question.correct,
        });
        
        // ... (rest of handleAnswer logic is unchanged)
        let questionPoints = 0, timerBonus = 0, comboBonus = 0;
        if (isCorrect) {
            playSound(UIElements.sounds.correct);
            UIElements.feedbackOverlay.title.textContent = 'Benar!';
            gameState.comboStreak++;
            gameState.correctAnswersCount++;
            if (gameState.currentLevel === 'level1') questionPoints = 100;
            else if (gameState.currentLevel === 'level2') questionPoints = 125;
            else if (gameState.currentLevel === 'level3') questionPoints = 150;
            if (gameState.timeLeft > 0) timerBonus = Math.floor(gameState.timeLeft * 10);
            if (gameState.comboStreak >= 2) {
                comboBonus = (gameState.comboStreak - 1) * 10;
                 showScorePopup(`Combo ${gameState.comboStreak}x! +${comboBonus}`);
            }
        } else {
            playSound(UIElements.sounds.wrong);
            UIElements.feedbackOverlay.title.textContent = 'Salah!';
            gameState.comboStreak = 0;
        }
        const totalPoints = questionPoints + timerBonus + comboBonus;
        gameState.score += totalPoints;
        setTimeout(() => { if (totalPoints > 0) showScorePopup('+' + totalPoints) }, 300);
        UIElements.quizPage.currentScoreDisplay.textContent = `Skor: ${gameState.score}`;
        UIElements.feedbackOverlay.text.textContent = question.feedback;
        toggleOverlay('feedback-overlay', true);
    }
    
    function nextQuestion() { /* ... unchanged ... */ }

    function endQuiz() {
        const { playerData } = gameState;
        playerData.totalGamesPlayed++;
        if (gameState.score > playerData.highScore) { playerData.highScore = gameState.score; }
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
        
        const newlyUnlocked = checkAchievements(); // Check before saving data
        saveGameData();
        updateUserUI();
        displayResults();
        navigateTo('hasil-page');

        // MODIFIED: Add all new achievements to the queue
        if (newlyUnlocked.length > 0) {
            achievementPopupQueue.push(...newlyUnlocked);
            setTimeout(processAchievementQueue, 500); // Process the first one
        }
    }

    // --- RESULT, LEADERBOARD, & ACHIEVEMENTS --- //
    
    function displayResults() { /* ... unchanged ... */ }

    function displayAchievements() {
        const grid = UIElements.jejakPetualanganPage.achievementsGrid;
        grid.innerHTML = '';
        for (const id in ALL_ACHIEVEMENTS) {
            const achievement = ALL_ACHIEVEMENTS[id];
            const isUnlocked = gameState.playerData.achievements.includes(id);
            const item = document.createElement('div');
            item.className = `achievement-item ${isUnlocked ? 'unlocked' : 'locked'}`;
            item.title = `${achievement.title}\n${achievement.description}`;
            
            // NEW: Add click listener to each achievement item
            item.addEventListener('click', () => {
                playSound(UIElements.sounds.click);
                showAchievementPopup(id);
            });

            const icon = document.createElement('img');
            icon.src = achievement.icon;
            icon.alt = achievement.title;
            icon.className = 'achievement-icon';
            const title = document.createElement('p');
            title.className = 'achievement-title';
            title.textContent = achievement.title;
            item.appendChild(icon);
            item.appendChild(title);
            grid.appendChild(item);
        }
    }
    
    function displayLeaderboard() { /* ... unchanged ... */ }
    function checkAchievements() { /* ... unchanged ... */ }

    function showAchievementPopup(achievementId) {
        const achievement = ALL_ACHIEVEMENTS[achievementId];
        if (!achievement) return;
        UIElements.achievementPopup.icon.src = achievement.icon;
        UIElements.achievementPopup.title.textContent = achievement.title;
        UIElements.achievementPopup.desc.textContent = achievement.description;
        UIElements.achievementPopup.shareBtn.dataset.achievementTitle = achievement.title;
        toggleOverlay('achievement-unlocked-overlay', true);
    }

    /**
     * NEW: Processes the achievement queue to show popups one by one.
     */
    function processAchievementQueue() {
        if (achievementPopupQueue.length > 0) {
            const nextAchievementId = achievementPopupQueue.shift(); // Get and remove the next item
            showAchievementPopup(nextAchievementId);
        }
    }

    /**
     * NEW: Displays the post-game journal.
     */
    function displayJournal() {
        const content = UIElements.journalPopup.content;
        content.innerHTML = ''; // Clear previous journal

        gameState.sessionReview.forEach((item, index) => {
            const journalItem = document.createElement('div');
            journalItem.className = 'journal-item';

            const questionText = document.createElement('p');
            questionText.className = 'journal-question';
            questionText.textContent = `${index + 1}. ${item.questionText}`;
            journalItem.appendChild(questionText);

            item.answers.forEach(answer => {
                const answerEl = document.createElement('div');
                answerEl.className = 'journal-answer';
                answerEl.textContent = answer;

                if (answer === item.correctAnswer) {
                    answerEl.classList.add('correct');
                }
                if (answer === item.userAnswer) {
                    answerEl.classList.add('user-answer');
                    if (item.userAnswer !== item.correctAnswer) {
                        answerEl.classList.add('incorrect');
                    }
                }
                journalItem.appendChild(answerEl);
            });

            content.appendChild(journalItem);
        });
        
        toggleOverlay('journal-overlay', true);
    }

    // --- LEVEL UNLOCKING --- //
    // ... (unchanged)

    // --- UTILITY FUNCTIONS --- //
    // ... (unchanged)

    // --- EVENT LISTENERS --- //

    // ... (Main Menu, Level Page, Quiz Page listeners are unchanged)

    // Hasil Page Listeners
    UIElements.hasilPage.homeBtn.addEventListener('click', () => navigateTo('level-page'));
    UIElements.hasilPage.retryBtn.addEventListener('click', () => { /* ... */ });
    UIElements.hasilPage.shareBtn.addEventListener('click', async () => { /* ... */ });
    // NEW: Journal button listener
    UIElements.hasilPage.journalBtn.addEventListener('click', () => {
        playSound(UIElements.sounds.click);
        displayJournal();
    });

    // ... (Jejak Petualangan, Guidebook, Settings, Confirmation listeners are unchanged)

    // Achievement Popup Listeners
    UIElements.achievementPopup.okBtn.addEventListener('click', () => {
        playSound(UIElements.sounds.click);
        toggleOverlay('achievement-unlocked-overlay', false);
        // MODIFIED: Process the next achievement in the queue when OK is clicked
        setTimeout(processAchievementQueue, 300); // Short delay for smoother transition
    });
    UIElements.achievementPopup.shareBtn.addEventListener('click', async () => { /* ... */ });

    // NEW: Journal Popup Listener
    UIElements.journalPopup.closeBtn.addEventListener('click', () => {
        playSound(UIElements.sounds.click);
        toggleOverlay('journal-overlay', false);
    });

    // --- INITIALIZATION --- //
    function init() {
        console.log('Initializing Japanese Adventure v5...');
        loadGameData();
        navigateTo('main-menu');
    }

    init();
});