// Wait for the DOM to be fully loaded before running the script
document.addEventListener('DOMContentLoaded', () => {

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
        // MODIFIED: No longer storing multiple users, only the local leaderboard
        localLeaderboard: [],
        // NEW: This will hold the single player's data
        playerData: null, 
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
            changeNameBtn: document.getElementById('change-name-btn'), // Changed from change-user-btn
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
            retryBtn: document.getElementById('retry-btn')
        },
        jejakPetualanganPage: {
            tabs: document.querySelectorAll('#jejak-petualangan-page .tab-btn'),
            achievementsGrid: document.getElementById('achievements-grid'), // Changed from statsContent
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
        sounds: {
            click: document.getElementById('click-sound'),
            correct: document.getElementById('correct-sound'),
            wrong: document.getElementById('wrong-sound')
        }
    };

    // --- DATA HANDLING & PLAYER PROFILE --- //

    /**
     * Creates a new, default player data object.
     * This is used for first-time players.
     */
    function createNewPlayerData() {
        return {
            username: 'Petualang',
            level: 1,
            xp: 0,
            totalGamesPlayed: 0,
            highScore: 0,
            achievements: [], // Stores IDs of unlocked achievements
            perfectScores: {}, // Stores keys like 'level1_Restoran' for tracking perfect games
            unlockedLevels: {
                'Restoran': 1,
                'Minimarket': 1,
                'Kereta': 1,
                'Apotek': 1
            }
        };
    }

    /**
     * Loads all game data from localStorage.
     * Now handles a single player profile and the local leaderboard.
     */
    function loadGameData() {
        const savedPlayerData = localStorage.getItem('jepangAdventurePlayerData');
        if (savedPlayerData) {
            gameState.playerData = JSON.parse(savedPlayerData);
            // Data migration for older save files, can be removed later
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
        updateUserUI(); // Update UI with loaded data
    }

    /**
     * Saves all game data to localStorage.
     */
    function saveGameData() {
        localStorage.setItem('jepangAdventurePlayerData', JSON.stringify(gameState.playerData));
        localStorage.setItem('jepangAdventureLeaderboard', JSON.stringify(gameState.localLeaderboard));
        // We no longer need to save the last user
    }
    
    /**
     * Resets the current player's data to default values.
     */
    function resetCurrentPlayerData() {
        gameState.playerData = createNewPlayerData();
        // Also clear the local leaderboard for a full reset
        gameState.localLeaderboard = []; 
        saveGameData();
        updateUserUI();
        alert(`Data petualangan telah direset!`);
    }

    // --- LEVEL & XP SYSTEM --- //

    /**
     * Calculates the total XP needed to reach the next level.
     * @param {number} currentLevel - The player's current level.
     * @returns {number} The XP required for the next level up.
     */
    function calculateXpForNextLevel(currentLevel) {
        const tier = Math.floor((currentLevel - 1) / 10);
        return (tier + 1) * 100;
    }

    /**
     * Adds XP to the player's profile and handles leveling up.
     * @param {number} score - The score from the completed game.
     */
    function addXp(score) {
        const earnedXp = Math.floor(score * 0.01);
        gameState.playerData.xp += earnedXp;

        let xpNeeded = calculateXpForNextLevel(gameState.playerData.level);
        
        // Loop in case a player earns enough XP for multiple levels at once
        while (gameState.playerData.xp >= xpNeeded) {
            gameState.playerData.xp -= xpNeeded;
            gameState.playerData.level++;
            // Optional: Add a "Level Up!" notification here
            xpNeeded = calculateXpForNextLevel(gameState.playerData.level);
        }
    }


    // --- UI & NAVIGATION --- //
    
    /**
     * Updates all user-facing UI elements like username, level, and XP bar.
     */
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
        // Sound is handled by the event listener now to ensure it's unlocked
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

    // ... (toggleOverlay, setRandomBackground, updateSoundButtonUI functions remain the same)
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
    // ... (startQuiz, displayQuestion, startTimer, showScorePopup, handleAnswer, nextQuestion functions largely unchanged)
    async function startQuiz(level, category) {
        gameState.currentLevel = level;
        gameState.currentCategory = category;
        gameState.currentQuestionIndex = 0;
        gameState.score = 0;
        gameState.comboStreak = 0;
        gameState.correctAnswersCount = 0;

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
     * It now handles updating player stats, adding XP, saving leaderboard scores,
     * and checking for achievements.
     */
    function endQuiz() {
        const { playerData } = gameState;
        
        // Update player stats
        playerData.totalGamesPlayed++;
        if (gameState.score > playerData.highScore) {
            playerData.highScore = gameState.score;
        }

        // Add score to local leaderboard, preserving the name at the time of play
        gameState.localLeaderboard.push({
            name: playerData.username,
            score: gameState.score,
            category: `${gameState.currentCategory} (Lvl ${gameState.currentLevel.slice(-1)})`,
            date: new Date().toISOString()
        });

        // Add XP and handle level ups
        addXp(gameState.score);

        // Check for newly unlocked achievements
        const newlyUnlocked = checkAchievements();
        
        // Mark perfect scores
        if (gameState.correctAnswersCount === 10) {
            const perfectKey = `${gameState.currentLevel}_${gameState.currentCategory}`;
            playerData.perfectScores[perfectKey] = true;
        }

        // Save all data and navigate to results
        saveGameData();
        updateUserUI(); // Update UI with new level/XP
        displayResults();
        navigateTo('hasil-page');

        // If achievements were unlocked, show the popup after a short delay
        if (newlyUnlocked.length > 0) {
            setTimeout(() => {
                showAchievementPopup(newlyUnlocked[0]);
            }, 500); // 0.5s delay to allow page transition
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

    /**
     * Renders the achievements grid in the "Pencapaian" tab.
     */
    function displayAchievements() {
        const grid = UIElements.jejakPetualanganPage.achievementsGrid;
        grid.innerHTML = ''; // Clear previous content

        for (const id in ALL_ACHIEVEMENTS) {
            const achievement = ALL_ACHIEVEMENTS[id];
            const isUnlocked = gameState.playerData.achievements.includes(id);

            const item = document.createElement('div');
            item.className = `achievement-item ${isUnlocked ? 'unlocked' : 'locked'}`;
            item.title = `${achievement.title}\n${achievement.description}`;

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

    /**
     * Displays the local leaderboard.
     */
    function displayLeaderboard() {
        const leaderboardBody = UIElements.jejakPetualanganPage.leaderboardBody;
        leaderboardBody.innerHTML = '';
        const topScores = [...gameState.localLeaderboard].sort((a, b) => b.score - a.score).slice(0, 50); // Show top 50 local scores

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
    
    /**
     * Checks all achievement conditions against player data.
     * @returns {Array} An array of newly unlocked achievement IDs.
     */
    function checkAchievements() {
        const { playerData, score } = gameState;
        const newlyUnlocked = [];

        const hasAchievement = (id) => playerData.achievements.includes(id);

        // Check each achievement
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
        
        // Check for perfect score achievement
        const perfectKey = `${gameState.currentLevel}_${gameState.currentCategory}`;
        const perfectId = `PERFECT_${gameState.currentLevel.toUpperCase()}_${gameState.currentCategory}`;
        if (gameState.correctAnswersCount === 10 && ALL_ACHIEVEMENTS[perfectId] && !hasAchievement(perfectId)) {
            newlyUnlocked.push(perfectId);
        }

        // Check for 'Master Level 1'
        if (!hasAchievement('PERFECT_ALL_L1')) {
            const l1Categories = ['Restoran', 'Minimarket', 'Kereta', 'Apotek'];
            const allL1Perfect = l1Categories.every(cat => playerData.perfectScores[`level1_${cat}`]);
            if (allL1Perfect) {
                newlyUnlocked.push('PERFECT_ALL_L1');
            }
        }
        
        // Add new achievements to player data
        if (newlyUnlocked.length > 0) {
            playerData.achievements.push(...newlyUnlocked);
        }
        
        return newlyUnlocked;
    }

    /**
     * Shows the achievement unlocked popup.
     * @param {string} achievementId - The ID of the achievement to display.
     */
    function showAchievementPopup(achievementId) {
        const achievement = ALL_ACHIEVEMENTS[achievementId];
        if (!achievement) return;

        UIElements.achievementPopup.icon.src = achievement.icon;
        UIElements.achievementPopup.title.textContent = achievement.title;
        UIElements.achievementPopup.desc.textContent = achievement.description;
        
        // Store the achievement info for the share button
        UIElements.achievementPopup.shareBtn.dataset.achievementTitle = achievement.title;

        toggleOverlay('achievement-unlocked-overlay', true);
    }


    // --- LEVEL UNLOCKING --- //
    // ... (checkAndUnlockLevels, updateLevelUnlocks functions remain the same)
    function checkAndUnlockLevels() {
        if (gameState.correctAnswersCount !== 10) return;

        const perfectKey = `${gameState.currentLevel}_${gameState.currentCategory}`;
        gameState.playerData.perfectScores[perfectKey] = true;

        // Simplified unlocking logic: perfect in any L1 category unlocks L2, any L2 unlocks L3.
        const currentUserData = gameState.playerData;
        const currentCategory = gameState.currentCategory;
        const currentMaxLevel = currentUserData.unlockedLevels[currentCategory];

        if (gameState.currentLevel === 'level1' && currentMaxLevel < 2) {
            currentUserData.unlockedLevels[currentCategory] = 2;
        } else if (gameState.currentLevel === 'level2' && currentMaxLevel < 3) {
            currentUserData.unlockedLevels[currentCategory] = 3;
        }
    }

    function updateLevelUnlocks() {
        const selectedLevelNum = parseInt(UIElements.levelPage.difficultySelect.value.replace('level', ''));
        const unlockedLevels = gameState.playerData.unlockedLevels;

        UIElements.levelPage.categoryBtns.forEach(btn => {
            const category = btn.dataset.category;
            const maxUnlockedForCategory = unlockedLevels[category] || 1;

            if (maxUnlockedForCategory >= selectedLevelNum) {
                btn.disabled = false;
            } else {
                btn.disabled = true;
            }
        });
    }

    // --- UTILITY FUNCTIONS --- //
    // ... (shuffleArray, getLast7Days functions remain the same)
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function getLast7Days() {
        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toISOString().split('T')[0];
        }).reverse();
    }
    
    // --- EVENT LISTENERS --- //

    // MODIFIED: Simplified user profile listeners for single user
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

    // ... (Other listeners remain largely the same, but with playSound calls)
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

    UIElements.jejakPetualanganPage.backBtn.addEventListener('click', () => navigateTo('main-menu'));
    UIElements.jejakPetualanganPage.tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            playSound(UIElements.sounds.click);
            UIElements.jejakPetualanganPage.tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            document.querySelectorAll('#jejak-petualangan-page .tab-content').forEach(c => c.classList.remove('active'));
            document.getElementById(tab.dataset.tab).classList.add('active');
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

    UIElements.confirmationOverlay.confirmBtn.addEventListener('click', () => {
        resetCurrentUserData();
        toggleOverlay('confirmation-overlay', false);
    });
     UIElements.confirmationOverlay.cancelBtn.addEventListener('click', () => toggleOverlay('confirmation-overlay', false));

    // NEW: Achievement Popup Listeners
    UIElements.achievementPopup.okBtn.addEventListener('click', () => {
        playSound(UIElements.sounds.click);
        toggleOverlay('achievement-unlocked-overlay', false);
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

    // --- INITIALIZATION --- //
    function init() {
        console.log('Initializing Japanese Adventure PWA v4...');
        loadGameData();
        navigateTo('main-menu');
    }

    init();
});