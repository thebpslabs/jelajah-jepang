// Wait for the DOM to be fully loaded before running the script
document.addEventListener('DOMContentLoaded', () => {

    // --- FIREBASE IMPORTS AND SETUP --- //
    import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js';
    import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js';
    import { getFirestore, collection, getDocs, limit, orderBy, query } from 'https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js';
    import { getFunctions, httpsCallable } from 'https://www.gstatic.com/firebasejs/10.9.0/firebase-functions.js';

    // Your web app's Firebase configuration
    // IMPORTANT: Replace with your actual Firebase project configuration
    const firebaseConfig = {
        apiKey: "YOUR_API_KEY",
        authDomain: "YOUR_AUTH_DOMAIN",
        projectId: "YOUR_PROJECT_ID",
        storageBucket: "YOUR_STORAGE_BUCKET",
        messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
        appId: "YOUR_APP_ID"
    };

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);
    const functions = getFunctions(app);

    let currentUser = null;
    onAuthStateChanged(auth, (user) => {
        currentUser = user;
        updateUserUI(); // Update UI when auth state changes
        if (gameState.currentPage === 'hasil-page') {
            updateResultPageUI(); // Update results page UI for login button
        }
    });


    // --- ACHIEVEMENTS DATA --- //
    // A central place to define all possible achievements in the game.
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
        globalLeaderboard: [], // ADDED: To store the fetched global scores
        playerData: null,
        gameJournal: [],
        achievementQueue: [],
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
            journalBtn: document.getElementById('journal-btn'),
            submitGlobalBtn: document.getElementById('submit-global-btn') // ADDED: New button selector
        },
        jejakPetualanganPage: {
            tabs: document.querySelectorAll('#jejak-petualangan-page .tab-btn'),
            achievementsGrid: document.getElementById('achievements-grid'),
            leaderboardContent: document.getElementById('leaderboard'),
            leaderboardBody: document.getElementById('leaderboard-body'),
            backBtn: document.getElementById('back-to-home-from-log'),
            localLeaderboardTab: document.getElementById('local-leaderboard-tab'),
            globalLeaderboardTab: document.getElementById('global-leaderboard-tab'),
            localLeaderboardContent: document.getElementById('local-leaderboard-content'),
            globalLeaderboardContent: document.getElementById('global-leaderboard-content')
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
        journalOverlay: {
             overlay: document.getElementById('journal-overlay'),
             content: document.getElementById('journal-content'),
             closeBtn: document.getElementById('journal-close-btn')
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
            username: 'Petualang',
            level: 1,
            xp: 0,
            totalGamesPlayed: 0,
            highScore: 0,
            achievements: [],
            perfectScores: {},
            unlockedLevels: {
                'Restoran': 1,
                'Minimarket': 1,
                'Kereta': 1,
                'Apotek': 1
            }
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
        if (savedLeaderboard) {
            gameState.localLeaderboard = JSON.parse(savedLeaderboard);
        }

        const savedSoundSetting = localStorage.getItem('jepangAdventureSound');
        if (savedSoundSetting !== null) {
            gameState.soundEnabled = JSON.parse(savedSoundSetting);
        }
        
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

    // --- FIREBASE AUTHENTICATION & LEADERBOARD SUBMISSION --- //

    async function signInWithGoogle() {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
    }
    
    async function submitScoreToGlobalLeaderboard() {
        if (!currentUser) {
            console.error("No user is signed in. Score will not be submitted.");
            return;
        }
    
        // Show loading indicator here if you have one
    
        const dataToSend = {
            quizId: `${gameState.currentCategory.replace(' ', '')}_${gameState.currentLevel.toLowerCase()}`,
            userAnswers: gameState.gameJournal.map(entry => ({
                question: entry.question,
                userAnswer: entry.userAnswer
            }))
        };
        
        const submitScore = httpsCallable(functions, 'submitScore');
    
        try {
            const result = await submitScore(dataToSend);
            console.log('Score submitted successfully!', result.data);
            alert("Skor Anda telah dikirim ke Papan Peringkat Global!");
        } catch (error) {
            console.error('Failed to submit score to global leaderboard:', error);
            alert("Gagal mengirim skor. Coba lagi.");
        }
    }


    // --- LEVEL & XP SYSTEM --- //

    function calculateXpForNextLevel(currentLevel) {
        const tier = Math.floor((currentLevel - 1) / 10);
        return (tier + 1) * 100;
    }

    function addXp(score) {
        const earnedXp = Math.floor(score * 0.02);
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
        
        // Show Google username if logged in
        if (currentUser && currentUser.displayName) {
             UIElements.mainMenu.currentUserDisplay.textContent = currentUser.displayName;
             UIElements.mainMenu.userDisplayMode.style.display = 'flex';
             UIElements.mainMenu.userEditMode.style.display = 'none';
        } else {
             UIElements.mainMenu.currentUserDisplay.textContent = username;
        }
        
        UIElements.mainMenu.levelDisplay.textContent = `Level ${level}`;
        
        const xpNeeded = calculateXpForNextLevel(level);
        const xpPercentage = (xp / xpNeeded) * 100;
        
        UIElements.mainMenu.xpBarInner.style.width = `${xpPercentage}%`;
        UIElements.mainMenu.xpText.textContent = `${Math.floor(xp)} / ${xpNeeded} XP`;
    }

    function navigateTo(pageId) {
        gameState.currentPage = pageId;
        UIElements.pages.forEach(page => page.classList.remove('active'));
        const targetPage = document.getElementById(pageId);
        if (targetPage) targetPage.classList.add('active');
        setRandomBackground();

        if (pageId === 'jejak-petualangan-page') {
            displayAchievements();
            // Default to local leaderboard view
            displayLeaderboard('local');
            UIElements.jejakPetualanganPage.localLeaderboardTab.classList.add('active');
            UIElements.jejakPetualanganPage.globalLeaderboardTab.classList.remove('active');
            UIElements.jejakPetualanganPage.localLeaderboardContent.classList.add('active');
            UIElements.jejakPetualanganPage.globalLeaderboardContent.classList.remove('active');
        } else if (pageId === 'level-page') {
            updateLevelUnlocks();
        } else if (pageId === 'hasil-page') {
            updateResultPageUI();
        }
    }

    function updateResultPageUI() {
        // Show the global submission button if user is logged in
        if (currentUser) {
            UIElements.hasilPage.submitGlobalBtn.style.display = 'block';
            UIElements.hasilPage.submitGlobalBtn.innerHTML = 'Kirim Skor Global';
        } else {
             UIElements.hasilPage.submitGlobalBtn.style.display = 'block';
             UIElements.hasilPage.submitGlobalBtn.innerHTML = `<img src="assets/google-icon.png" alt="Google Icon" class="icon-small"> Masuk & Kirim Skor Global`;
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
            } catch (error) {
                console.error("Error playing sound:", error);
            }
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
        gameState.gameJournal = [];

        try {
            const categoryToFileMap = {
                'Restoran': 'database_restoran.json',
                'Minimarket': 'database_minimarket.json',
                'Kereta': 'database_kereta.json',
                'Apotek': 'database_apotek.json'
            };

            const fileName = categoryToFileMap[category];
            if (!fileName) {
                alert(`Database untuk kategori "${category}" tidak ditemukan.`);
                return;
            }

            const response = await fetch(fileName);
            if (!response.ok) throw new Error(`Network response was not ok: ${response.statusText}`);
            const quizDatabase = await response.json();
            const questionPool = quizDatabase[level]?.[category];

            if (!questionPool || questionPool.length === 0) {
                 alert('Soal untuk kategori atau level ini belum tersedia.');
                 return;
            }
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
        const progress = (gameState.currentQuestionIndex / gameState.questions.length) * 100;
        UIElements.quizPage.progressBar.style.width = `${progress}%`;
        UIElements.quizPage.currentScoreDisplay.textContent = `Skor: ${gameState.score}`;

        const question = gameState.questions[gameState.currentQuestionIndex];
        UIElements.quizPage.title.textContent = `Petualangan di ${gameState.currentCategory}`;
        UIElements.quizPage.questionText.textContent = question.question;
        
        UIElements.quizPage.image.src = `assets/${question.image}`;
        const attributionPath = `assets/${question.image}`.replace(/\.(jpg|jpeg|png|gif)$/, '.txt');

        fetch(attributionPath)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Attribution file not found.');
                }
                return response.text();
            })
            .then(text => {
                const [attributionText, rawUrl] = text.split('\n');
                const url = rawUrl ? rawUrl.replace(/^Profile:\s*/, '').trim() : '';

                UIElements.quizPage.attribution.textContent = attributionText || '';
                UIElements.quizPage.attribution.style.display = 'block';

                if (url) {
                    UIElements.quizPage.imageLink.href = url;
                    UIElements.quizPage.imageLink.style.cursor = 'pointer';
                } else {
                    UIElements.quizPage.imageLink.href = '#';
                    UIElements.quizPage.imageLink.style.cursor = 'default';
                }
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
            button.classList.add('answer-btn');
            const colorClass = `${gameState.currentCategory.replace(' ', '.')}-btn`;
            button.classList.add(colorClass);
            button.addEventListener('click', () => handleAnswer(answer));
            UIElements.quizPage.answerButtons.appendChild(button);
        });
        startTimer();
    }

    function startTimer() {
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
            if (gameState.timeLeft <= 0) {
                clearInterval(gameState.questionTimer);
                gameState.timeLeft = 0;
            }
        }, 100);
    }

    function showScorePopup(text, type = '') {
        const popup = document.createElement('div');
        popup.textContent = text;
        popup.className = 'score-popup';
        if (type) popup.classList.add(type);
        UIElements.quizPage.scorePopupContainer.appendChild(popup);
        setTimeout(() => popup.remove(), 1500);
    }

    function handleAnswer(selectedAnswer) {
        clearInterval(gameState.questionTimer);
        UIElements.quizPage.timerBar.style.transition = 'none';
        UIElements.quizPage.answerButtons.querySelectorAll('.answer-btn').forEach(btn => btn.classList.add('disabled'));

        const question = gameState.questions[gameState.currentQuestionIndex];
        const isCorrect = selectedAnswer === question.correct;

        gameState.gameJournal.push({
            question: question.question,
            answers: question.answers,
            correctAnswer: question.correct,
            userAnswer: selectedAnswer
        });

        let questionPoints = 0;
        let timerBonus = 0;
        let comboBonus = 0;

        if (isCorrect) {
            playSound(UIElements.sounds.correct);
            UIElements.feedbackOverlay.title.textContent = 'Benar!';
            gameState.comboStreak++;
            gameState.correctAnswersCount++;

            if (gameState.currentLevel === 'level1') {
                questionPoints = 100;
            } else if (gameState.currentLevel === 'level2') {
                questionPoints = 125;
            } else if (gameState.currentLevel === 'level3') {
                questionPoints = 150;
            }
            
            if (gameState.timeLeft > 0) {
                timerBonus = Math.floor(gameState.timeLeft * 10);
            }
            
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

    function nextQuestion() {
        gameState.currentQuestionIndex++;
        if (gameState.currentQuestionIndex < gameState.questions.length) {
            displayQuestion();
        } else {
            endQuiz();
        }
    }

    /**
     * The main function called when a quiz round ends.
     * Handles updating player stats, XP, leaderboard, and achievements.
     */
    function endQuiz() {
        const { playerData } = gameState;
        
        playerData.totalGamesPlayed++;
        if (gameState.score > playerData.highScore) {
            playerData.highScore = gameState.score;
        }

        // --- LOCAL LEADERBOARD LOGIC (KEPT AS IS) ---
        gameState.localLeaderboard.push({
            name: playerData.username,
            score: gameState.score,
            category: `${gameState.currentCategory} (Lvl ${gameState.currentLevel.slice(-1)})`,
            date: new Date().toISOString()
        });

        addXp(gameState.score);
        checkAndUnlockLevels();
        const newlyUnlocked = checkAchievements();
        saveGameData(); 
        updateUserUI();
        displayResults();
        navigateTo('hasil-page');
        
        // --- NEW: LOGIC TO HANDLE GLOBAL SUBMISSION ---
        UIElements.hasilPage.submitGlobalBtn.style.display = 'block';
        updateResultPageUI();

        if (newlyUnlocked.length > 0) {
            gameState.achievementQueue = newlyUnlocked;
            setTimeout(() => {
                processAchievementQueue();
            }, 500);
        }
    }


    // --- RESULT, LEADERBOARD, & ACHIEVEMENTS --- //

    function displayResults() {
        const correctAnswers = gameState.correctAnswersCount;
        let result = {};
        if (correctAnswers === 10) {
            result = { text: "SEMPURNA!", subtext: "Kerja bagus, master! Teruslah berlatih!", image: "Success2.jpg" };
        } else if (correctAnswers >= 7) {
            result = { text: "Kamu sudah siap ke Jepang!", subtext: "Hampir sempurna! Sedikit lagi!", image: "Success1.jpg" };
        } else if (correctAnswers >= 4) {
            result = { text: "Perlu persiapan sedikit lagi!", subtext: "Jangan menyerah, ayo coba lagi!", image: "Fail2.jpg" };
        } else {
            result = { text: "Kamu belum siap ke Jepang...", subtext: "Bisa bahasa Jepang jadi lebih tenang. Ayo semangat!", image: "Fail1.jpg" };
        }

        UIElements.hasilPage.scoreText.textContent = `Skor: ${gameState.score} (${correctAnswers}/10)`;
        UIElements.hasilPage.resultText.textContent = result.text;
        UIElements.hasilPage.resultSubtext.textContent = result.subtext;
        UIElements.hasilPage.image.src = `assets/${result.image}`;
    }
    
    function displayJournal() {
        const content = UIElements.journalOverlay.content;
        content.innerHTML = '';

        if (gameState.gameJournal.length === 0) {
            content.innerHTML = '<p>Jurnal tidak tersedia untuk sesi ini.</p>';
            return;
        }

        gameState.gameJournal.forEach(entry => {
            const item = document.createElement('div');
            item.className = 'journal-item';

            const questionText = document.createElement('p');
            questionText.className = 'journal-question';
            questionText.textContent = entry.question;
            item.appendChild(questionText);

            entry.answers.forEach(answerText => {
                const answer = document.createElement('div');
                answer.className = 'journal-answer';
                answer.textContent = answerText;

                if (answerText === entry.correctAnswer) {
                    answer.classList.add('correct');
                }
                
                if (answerText === entry.userAnswer) {
                    answer.classList.add('user-answer');
                    if (entry.userAnswer !== entry.correctAnswer) {
                         answer.classList.add('incorrect');
                    }
                }
                item.appendChild(answer);
            });
            content.appendChild(item);
        });
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
            
            if (isUnlocked) {
                item.addEventListener('click', () => {
                    playSound(UIElements.sounds.click);
                    showAchievementPopup(id);
                });
            }

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
    
    // --- LEADERBOARD DISPLAY LOGIC ---
    async function displayLeaderboard(type) {
        if (type === 'local') {
            displayLocalLeaderboard();
        } else if (type === 'global') {
            await fetchGlobalLeaderboard();
            displayGlobalLeaderboard();
        }
    }
    
    function displayLocalLeaderboard() {
        const leaderboardBody = UIElements.jejakPetualanganPage.localLeaderboardContent.querySelector('tbody');
        leaderboardBody.innerHTML = '';
        const topScores = [...gameState.localLeaderboard].sort((a, b) => b.score - a.score).slice(0, 50);

        if (topScores.length === 0) {
            leaderboardBody.innerHTML = '<tr><td colspan="4">Belum ada skor tercatat. Jadilah yang pertama!</td></tr>';
            return;
        }
        topScores.forEach((entry, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `<td>${index + 1}</td><td>${entry.name}</td><td style="text-align: right;">${entry.score}</td><td>${entry.category}</td>`;
            leaderboardBody.appendChild(row);
        });
    }

    async function fetchGlobalLeaderboard() {
        const globalLeaderboardRef = collection(db, 'globalLeaderboard');
        const q = query(globalLeaderboardRef, orderBy('score', 'desc'), limit(50));
        
        try {
            const querySnapshot = await getDocs(q);
            gameState.globalLeaderboard = querySnapshot.docs.map(doc => doc.data());
        } catch (error) {
            console.error("Error fetching global leaderboard:", error);
            gameState.globalLeaderboard = [];
        }
    }
    
    function displayGlobalLeaderboard() {
        const leaderboardBody = UIElements.jejakPetualanganPage.globalLeaderboardContent.querySelector('tbody');
        leaderboardBody.innerHTML = '';
        
        if (gameState.globalLeaderboard.length === 0) {
            leaderboardBody.innerHTML = '<tr><td colspan="4">Belum ada skor global tercatat. Kirim skor Anda!</td></tr>';
            return;
        }
        
        gameState.globalLeaderboard.forEach((entry, index) => {
            const row = document.createElement('tr');
            let userName = entry.name || 'Unknown User';
            
            // Highlight current user's score
            if (currentUser && entry.userId === currentUser.uid) {
                row.classList.add('current-user-row');
                userName = "Anda"; // Or get their display name
            }

            row.innerHTML = `<td>${index + 1}</td><td>${userName}</td><td style="text-align: right;">${entry.score}</td><td>${entry.quizId}</td>`;
            leaderboardBody.appendChild(row);
        });
    }

    function checkAchievements() {
        const { playerData, score } = gameState;
        const newlyUnlocked = [];

        const hasAchievement = (id) => playerData.achievements.includes(id);

        if (!hasAchievement('FIRST_GAME') && playerData.totalGamesPlayed >= 1) newlyUnlocked.push('FIRST_GAME');
        if (!hasAchievement('PLAY_10') && playerData.totalGamesPlayed >= 10) newlyUnlocked.push('PLAY_10');
        if (!hasAchievement('PLAY_20') && playerData.totalGamesPlayed >= 20) newlyUnlocked.push('PLAY_20');
        if (!hasAchievement('PLAY_30') && playerData.totalGamesPlayed >= 30) newlyUnlocked.push('PLAY_30');
        if (!hasAchievement('PLAY_50') && playerData.totalGamesPlayed >= 50) newlyUnlocked.push('PLAY_50');
        if (!hasAchievement('PLAY_100') && playerData.totalGamesPlayed >= 100) newlyUnlocked.push('PLAY_100');
        if (!hasAchievement('SCORE_1000') && score > 1000) newlyUnlocked.push('SCORE_1000');
        if (!hasAchievement('SCORE_1500') && score > 1500) newlyUnlocked.push('SCORE_1500');
        if (!hasAchievement('SCORE_2000') && score > 2000) newlyUnlocked.push('SCORE_2000');
        if (!hasAchievement('SCORE_3000') && score > 3000) newlyUnlocked.push('SCORE_3000');
        
        const perfectId = `PERFECT_${gameState.currentLevel.toUpperCase()}_${gameState.currentCategory}`;
        if (gameState.correctAnswersCount === 10 && ALL_ACHIEVEMENTS[perfectId] && !hasAchievement(perfectId)) {
            newlyUnlocked.push(perfectId);
        }

        if (!hasAchievement('PERFECT_ALL_L1')) {
            const l1Categories = ['Restoran', 'Minimarket', 'Kereta', 'Apotek'];
            const allL1Perfect = l1Categories.every(cat => playerData.perfectScores[`level1_${cat}`]);
            if (allL1Perfect) {
                newlyUnlocked.push('PERFECT_ALL_L1');
            }
        }
        
        if (newlyUnlocked.length > 0) {
            playerData.achievements.push(...newlyUnlocked);
        }
        
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
        if (gameState.achievementQueue.length > 0) {
            const achievementId = gameState.achievementQueue.shift();
            showAchievementPopup(achievementId);
        }
    }


    // --- LEVEL UNLOCKING --- //
    function checkAndUnlockLevels() {
        // This function only proceeds if the player got a perfect score.
        if (gameState.correctAnswersCount !== 10) return;

        const { playerData, currentLevel, currentCategory } = gameState;

        // Mark this category/level combo as perfected
        const perfectKey = `${currentLevel}_${currentCategory}`;
        playerData.perfectScores[perfectKey] = true;

        // Unlock the next level for the current category if applicable
        const currentMaxLevel = playerData.unlockedLevels[currentCategory];
        if (currentLevel === 'level1' && currentMaxLevel < 2) {
            playerData.unlockedLevels[currentCategory] = 2;
        } else if (currentLevel === 'level2' && currentMaxLevel < 3) {
            playerData.unlockedLevels[currentCategory] = 3;
        }
    }

    function updateLevelUnlocks() {
        const selectedLevelNum = parseInt(UIElements.levelPage.difficultySelect.value.replace('level', ''));
        const unlockedLevels = gameState.playerData.unlockedLevels;

        UIElements.levelPage.categoryBtns.forEach(btn => {
            const category = btn.dataset.category;
            const maxUnlockedForCategory = unlockedLevels[category] || 1;

            btn.disabled = maxUnlockedForCategory < selectedLevelNum;
        });
    }

    // --- UTILITY FUNCTIONS --- //
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
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

    // Main Menu Navigation
    UIElements.mainMenu.startBtn.addEventListener('click', () => {
        playSound(UIElements.sounds.click);
        navigateTo('level-page');
    });
    UIElements.mainMenu.adventureLogBtn.addEventListener('click', () => {
        playSound(UIElements.sounds.click);
        navigateTo('jejak-petualangan-page');
    });
    UIElements.mainMenu.settingsBtn.addEventListener('click', () => {
        playSound(UIElements.sounds.click);
        toggleOverlay('settings-overlay', true);
    });
    UIElements.mainMenu.guidebookBtn.addEventListener('click', () => {
        playSound(UIElements.sounds.click);
        navigateTo('guidebook-page');
    });

    // MODIFIED: Added listener for difficulty change
    UIElements.levelPage.difficultySelect.addEventListener('change', updateLevelUnlocks);
    UIElements.levelPage.categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            playSound(UIElements.sounds.click);
            const category = btn.dataset.category;
            const level = UIElements.levelPage.difficultySelect.value;
            startQuiz(level, category);
        });
    });
    UIElements.levelPage.backBtn.addEventListener('click', () => navigateTo('main-menu'));

    UIElements.quizPage.exitBtn.addEventListener('click', () => {
        clearInterval(gameState.questionTimer);
        navigateTo('main-menu');
    });
    UIElements.feedbackOverlay.nextBtn.addEventListener('click', () => {
        playSound(UIElements.sounds.click);
        toggleOverlay('feedback-overlay', false);
        nextQuestion();
    });

    UIElements.hasilPage.homeBtn.addEventListener('click', () => navigateTo('level-page'));
    UIElements.hasilPage.retryBtn.addEventListener('click', () => {
        playSound(UIElements.sounds.click);
        startQuiz(gameState.currentLevel, gameState.currentCategory);
    });
    UIElements.hasilPage.shareBtn.addEventListener('click', async () => {
        const shareText = `I just scored ${gameState.score} in Petualangan di Jepang! Can you beat my score?`;
        const shareUrl = 'https://kuis-bahasa-jepang.pages.dev/';

        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Petualangan di Jepang - Kuis Bahasa Jepang',
                    text: shareText,
                    url: shareUrl,
                });
            } catch (error) { console.error('Error sharing:', error); }
        } else {
            try {
                await navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`);
                alert('Hasil & link game telah disalin ke clipboard!');
            } catch (err) { alert('Gagal menyalin.'); }
        }
    });

    UIElements.hasilPage.journalBtn.addEventListener('click', () => {
        playSound(UIElements.sounds.click);
        displayJournal();
        toggleOverlay('journal-overlay', true);
    });
    
    // --- NEW: GLOBAL LEADERBOARD SUBMISSION LISTENER ---
    UIElements.hasilPage.submitGlobalBtn.addEventListener('click', async () => {
        playSound(UIElements.sounds.click);
        
        if (currentUser) {
            await submitScoreToGlobalLeaderboard();
        } else {
            // Sign in with Google and then submit the score
            try {
                await signInWithGoogle();
                // onAuthStateChanged listener will handle the UI and then a second click will submit
                alert("Berhasil masuk! Silakan klik tombol lagi untuk mengirimkan skor.");
            } catch (error) {
                console.error("Login gagal:", error);
                alert("Gagal masuk. Coba lagi.");
            }
        }
    });


    UIElements.jejakPetualanganPage.backBtn.addEventListener('click', () => navigateTo('main-menu'));
    UIElements.jejakPetualanganPage.tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            playSound(UIElements.sounds.click);
            UIElements.jejakPetualanganPage.tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            document.querySelectorAll('#jejak-petualangan-page .tab-content').forEach(c => c.classList.remove('active'));
            document.getElementById(tab.dataset.tab).classList.add('active');
            
            // NEW: Fetch and display the correct leaderboard based on the tab clicked
            const leaderboardType = tab.dataset.tab.replace('-content', '');
            displayLeaderboard(leaderboardType);
        });
    });
    
    UIElements.guidebookPage.backBtn.addEventListener('click', () => navigateTo('main-menu'));
    UIElements.guidebookPage.tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            playSound(UIElements.sounds.click);
            UIElements.guidebookPage.tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            document.querySelectorAll('#guidebook-page .tab-content').forEach(c => c.classList.remove('active'));
            document.getElementById(tab.dataset.tab).classList.add('active');
        });
    });

    UIElements.settingsOverlay.closeBtn.addEventListener('click', () => toggleOverlay('settings-overlay', false));
    UIElements.settingsOverlay.soundToggleBtn.addEventListener('click', () => {
        gameState.soundEnabled = !gameState.soundEnabled;
        updateSoundButtonUI();
        localStorage.setItem('jepangAdventureSound', JSON.stringify(gameState.soundEnabled));
        playSound(UIElements.sounds.click);
    });
    UIElements.settingsOverlay.resetBtn.addEventListener('click', () => {
        toggleOverlay('settings-overlay', false);
        toggleOverlay('confirmation-overlay', true);
    });

    // MODIFIED: Corrected function name typo
    UIElements.confirmationOverlay.confirmBtn.addEventListener('click', () => {
        resetCurrentPlayerData();
        toggleOverlay('confirmation-overlay', false);
    });
     UIElements.confirmationOverlay.cancelBtn.addEventListener('click', () => toggleOverlay('confirmation-overlay', false));

    UIElements.achievementPopup.okBtn.addEventListener('click', () => {
        playSound(UIElements.sounds.click);
        toggleOverlay('achievement-unlocked-overlay', false);
        processAchievementQueue();
    });
    UIElements.achievementPopup.shareBtn.addEventListener('click', async () => {
        playSound(UIElements.sounds.click);
        const title = UIElements.achievementPopup.shareBtn.dataset.achievementTitle;
        const shareText = `I just unlocked the "${title}" achievement in Petualangan di Jepang!`;
        const shareUrl = 'https://kuis-bahasa-jepang.pages.dev/';

        if (navigator.share) {
            try {
                await navigator.share({ title: 'Achievement Unlocked!', text: shareText, url: shareUrl });
            } catch (error) { console.error('Error sharing achievement:', error); }
        } else {
            try {
                await navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`);
                alert('Pencapaian & link game telah disalin ke clipboard!');
            } catch (err) { alert('Gagal menyalin.'); }
        }
    });
    
    UIElements.journalOverlay.closeBtn.addEventListener('click', () => {
        playSound(UIElements.sounds.click);
        toggleOverlay('journal-overlay', false);
    });

    // --- INITIALIZATION --- //
    function init() {
        console.log('Initializing Japanese Adventure PWA v5...');
        loadGameData();
        navigateTo('main-menu');
    }

    init();
});