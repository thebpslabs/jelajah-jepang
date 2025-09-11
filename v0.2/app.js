// Wait for the DOM to be fully loaded before running the script
document.addEventListener('DOMContentLoaded', () => {

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
        // NEW: Counter for correct answers in a round
        correctAnswersCount: 0, 
        questionTimer: null,
        timeLeft: 0,
        allUsersData: {},
        currentUser: 'Petualang',
        allTimeScores: []
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
            changeUserBtn: document.getElementById('change-user-btn'),
            userSelect: document.getElementById('user-select'),
            newUserInput: document.getElementById('new-username-input'),
            saveUserBtn: document.getElementById('save-user-btn'),
            startBtn: document.getElementById('start-btn'),
            adventureLogBtn: document.getElementById('adventure-log-btn'),
            // NEW: Guidebook button
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
            image: document.getElementById('quiz-image'),
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
            statsContent: document.getElementById('stats'),
            leaderboardContent: document.getElementById('leaderboard'),
            leaderboardBody: document.getElementById('leaderboard-body'),
            pangkatImage: document.getElementById('pangkat-image'),
            pangkatText: document.getElementById('pangkat-text'),
            totalAttempts: document.getElementById('total-attempts'),
            averageScore: document.getElementById('average-score'),
            chart: document.getElementById('adventure-chart'),
            backBtn: document.getElementById('back-to-home-from-log')
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
             usernameText: document.getElementById('confirm-reset-username'),
             confirmBtn: document.getElementById('confirm-reset-btn'),
             cancelBtn: document.getElementById('cancel-reset-btn')
        },
        // NEW: Guidebook overlay elements
        guidebookOverlay: {
            overlay: document.getElementById('guidebook-overlay'),
            tabs: document.querySelectorAll('#guidebook-overlay .tab-btn'),
            closeBtn: document.getElementById('close-guidebook-btn')
        },
        sounds: {
            click: document.getElementById('click-sound'),
            correct: document.getElementById('correct-sound'),
            wrong: document.getElementById('wrong-sound')
        }
    };
    
    let adventureChartInstance = null;

    // --- DATA HANDLING & USER PROFILES --- //
    
    /**
     * NEW: Creates a default user profile object with category-specific level tracking.
     * @returns {object} A new user data object.
     */
    function createNewUserData() {
        return {
            attempts: [],
            // NEW: Tracks unlocked level per category. Value is the max level unlocked.
            unlockedLevels: {
                'Restoran': 1,
                'Minimarket': 1,
                'Kereta': 1,
                'Rumah Sakit': 1
            }
        };
    }

    /**
     * MODIFIED: Loads all game data and ensures user data structure is up-to-date.
     */
    function loadGameData() {
        const savedUsers = localStorage.getItem('jepangAdventureUsers');
        if (savedUsers) {
            gameState.allUsersData = JSON.parse(savedUsers);
        }

        const savedScores = localStorage.getItem('jepangAdventureLeaderboard');
        if (savedScores) {
            gameState.allTimeScores = JSON.parse(savedScores);
        }
        
        const lastUser = localStorage.getItem('jepangAdventureLastUser');
        if (lastUser && gameState.allUsersData[lastUser]) {
            gameState.currentUser = lastUser;
        } else {
            gameState.currentUser = 'Petualang';
        }

        if (!gameState.allUsersData[gameState.currentUser]) {
            gameState.allUsersData[gameState.currentUser] = createNewUserData();
        } else {
            // Data migration for old users: if unlockedLevels is an array, convert it.
            const currentUserData = gameState.allUsersData[gameState.currentUser];
            if (Array.isArray(currentUserData.unlockedLevels)) {
                 const newUnlockedLevels = createNewUserData().unlockedLevels;
                 // Can add more complex migration if needed, but for now this is fine
                 currentUserData.unlockedLevels = newUnlockedLevels;
            }
        }
        
        const savedSoundSetting = localStorage.getItem('jepangAdventureSound');
        if (savedSoundSetting !== null) {
            gameState.soundEnabled = JSON.parse(savedSoundSetting);
        }
        updateSoundButtonUI();
        updateUserUI();
    }

    function saveGameData() {
        localStorage.setItem('jepangAdventureUsers', JSON.stringify(gameState.allUsersData));
        localStorage.setItem('jepangAdventureLastUser', gameState.currentUser);
        localStorage.setItem('jepangAdventureLeaderboard', JSON.stringify(gameState.allTimeScores));
    }
    
    function resetCurrentUserData() {
        gameState.allUsersData[gameState.currentUser] = createNewUserData();
        saveGameData();
        alert(`Data petualangan untuk ${gameState.currentUser} telah direset!`);
        updateLevelUnlocks();
    }

    function switchUser(username) {
        if (!username || username.trim() === '') return;

        gameState.currentUser = username.trim();
        if (!gameState.allUsersData[gameState.currentUser]) {
            gameState.allUsersData[gameState.currentUser] = createNewUserData();
        }
        saveGameData();
        updateUserUI();
    }
    
    function updateUserUI() {
        UIElements.mainMenu.currentUserDisplay.textContent = gameState.currentUser;
        const userSelect = UIElements.mainMenu.userSelect;
        userSelect.innerHTML = '';
        Object.keys(gameState.allUsersData).forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            if (name === gameState.currentUser) option.selected = true;
            userSelect.appendChild(option);
        });
        const newOption = document.createElement('option');
        newOption.value = 'new_user';
        newOption.textContent = '--- Buat Petualang Baru ---';
        userSelect.appendChild(newOption);
        UIElements.mainMenu.newUserInput.style.display = 'none';
        UIElements.mainMenu.newUserInput.value = '';
    }

    // --- UI & NAVIGATION --- //
    function navigateTo(pageId) {
        playSound(UIElements.sounds.click);
        gameState.currentPage = pageId;
        UIElements.pages.forEach(page => page.classList.remove('active'));
        const targetPage = document.getElementById(pageId);
        if (targetPage) targetPage.classList.add('active');
        setRandomBackground();
        
        if (pageId === 'jejak-petualangan-page') {
            displayAdventureLog();
            displayLeaderboard();
        } else if (pageId === 'level-page') {
            // Update locks based on currently selected difficulty
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
    function playSound(soundElement) {
        if (gameState.soundEnabled && soundElement) {
            soundElement.currentTime = 0;
            soundElement.play();
        }
    }
    
    // --- QUIZ LOGIC --- //
    async function startQuiz(level, category) {
        gameState.currentLevel = level;
        gameState.currentCategory = category;
        gameState.currentQuestionIndex = 0;
        gameState.score = 0;
        gameState.comboStreak = 0;
        gameState.correctAnswersCount = 0; // Reset correct answer count

        try {
            const response = await fetch('database.json');
            if (!response.ok) throw new Error(`Network response was not ok: ${response.statusText}`);
            const quizDatabase = await response.json();
            const questionPool = quizDatabase[level]?.[category];

            if (!questionPool || questionPool.length === 0) {
                 alert('Soal untuk kategori ini belum tersedia.');
                 return;
            }
            gameState.questions = shuffleArray([...questionPool]).slice(0, 10);
            if (gameState.questions.length > 0) {
                navigateTo('quiz-page');
                displayQuestion();
            } else {
                alert('Tidak ada soal yang tersedia untuk kategori ini.');
            }
        } catch (error) {
            console.error('Could not load or start quiz:', error);
            alert('Gagal memuat data kuis. Pastikan file database.json ada dan coba lagi.');
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
            gameState.correctAnswersCount++; // Increment correct answer counter
            questionPoints = 100;
            if (gameState.timeLeft > 0) {
                timerBonus = Math.floor(gameState.timeLeft * 10);
            }
            if (gameState.comboStreak === 10) {
                comboBonus = 50;
                showScorePopup('Sempurna! +' + comboBonus, 'perfect');
            } else if (gameState.comboStreak >= 8) {
                comboBonus = 30;
                 showScorePopup(`Combo ${gameState.comboStreak}x! +${comboBonus}`);
            } else if (gameState.comboStreak >= 5) {
                comboBonus = 20;
                 showScorePopup(`Combo ${gameState.comboStreak}x! +${comboBonus}`);
            } else if (gameState.comboStreak >= 2) {
                comboBonus = 10;
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
    
    function endQuiz() {
        const currentUserData = gameState.allUsersData[gameState.currentUser];
        const attempt = {
            date: new Date().toISOString().split('T')[0],
            score: gameState.score,
            level: gameState.currentLevel,
            category: gameState.currentCategory,
            correctCount: gameState.correctAnswersCount
        };
        currentUserData.attempts.push(attempt);
        
        gameState.allTimeScores.push({
            name: gameState.currentUser,
            score: gameState.score,
            category: `${gameState.currentCategory} (Lvl ${gameState.currentLevel.slice(-1)})`,
            date: new Date().toISOString()
        });

        checkAndUnlockLevels(); // Check for level up
        saveGameData();
        displayResults();
        navigateTo('hasil-page');
    }

    // --- RESULT & ADVENTURE LOG --- //
    function displayResults() {
        const correctAnswers = gameState.correctAnswersCount;
        let result = {};
        if (correctAnswers === 10) {
            result = { text: "SEMPURNA! Level Berikutnya Terbuka!", subtext: "Kerja bagus, master! Kamu telah membuka tantangan baru di kategori ini.", image: "Success2.jpg" };
        } else if (correctAnswers >= 7) {
            result = { text: "Kamu sudah siap ke Jepang!", subtext: "Hampir sempurna! Sedikit lagi untuk membuka level berikutnya!", image: "Success1.jpg" };
        } else if (correctAnswers >= 4) {
            result = { text: "Perlu persiapan sedikit lagi!", subtext: "Jangan menyerah, ayo coba lagi!!", image: "fail2.jpg" };
        } else {
            result = { text: "Kamu belum siap ke Jepang...", subtext: "Bisa bahasa Jepang jadi lebih tenang. Ayo semangat!", image: "fail1.jpg" };
        }
        
        UIElements.hasilPage.scoreText.textContent = `Skor Akhir: ${gameState.score} (${correctAnswers}/10 Benar)`;
        UIElements.hasilPage.resultText.textContent = result.text;
        UIElements.hasilPage.resultSubtext.textContent = result.subtext;
        UIElements.hasilPage.image.src = `assets/${result.image}`;
    }
    
    function displayAdventureLog() {
        const currentUserData = gameState.allUsersData[gameState.currentUser];
        const attempts = currentUserData.attempts;
        const totalAttempts = attempts.length;
        const totalScore = attempts.reduce((sum, attempt) => sum + attempt.score, 0);
        const averageScore = totalAttempts > 0 ? Math.round(totalScore / totalAttempts) : 0;
        
        if (totalAttempts >= 20) {
             UIElements.jejakPetualanganPage.pangkatImage.src = 'assets/pangkat3.jpg';
             UIElements.jejakPetualanganPage.pangkatText.textContent = 'Pangkat 3';
        } else if (totalAttempts >= 10) {
            UIElements.jejakPetualanganPage.pangkatImage.src = 'assets/pangkat2.jpg';
            UIElements.jejakPetualanganPage.pangkatText.textContent = 'Pangkat 2';
        } else {
            UIElements.jejakPetualanganPage.pangkatImage.src = 'assets/pangkat1.jpg';
            UIElements.jejakPetualanganPage.pangkatText.textContent = 'Pangkat 1';
        }
        
        UIElements.jejakPetualanganPage.totalAttempts.textContent = totalAttempts;
        UIElements.jejakPetualanganPage.averageScore.textContent = averageScore;
        const last7Days = getLast7Days();
        const dailyAttempts = last7Days.map(date => attempts.filter(a => a.date === date).length);

        if(adventureChartInstance) adventureChartInstance.destroy();
        adventureChartInstance = new Chart(UIElements.jejakPetualanganPage.chart.getContext('2d'), {
            type: 'bar',
            data: { labels: last7Days.map(d => d.slice(5)), datasets: [{ label: `Petualangan ${gameState.currentUser}`, data: dailyAttempts, backgroundColor: 'rgba(255, 215, 0, 0.8)' }] },
            options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }
        });
    }

    function displayLeaderboard() {
        const leaderboardBody = UIElements.jejakPetualanganPage.leaderboardBody;
        leaderboardBody.innerHTML = '';
        const topScores = [...gameState.allTimeScores].sort((a, b) => b.score - a.score).slice(0, 10);

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

    // --- LEVEL UNLOCKING --- //

    /**
     * NEW: Checks if the user got a perfect score to unlock the next level for that category.
     */
    function checkAndUnlockLevels() {
        // Must get 10 correct answers to level up
        if (gameState.correctAnswersCount !== 10) return;

        const currentUserData = gameState.allUsersData[gameState.currentUser];
        const currentCategory = gameState.currentCategory;
        const currentMaxLevel = currentUserData.unlockedLevels[currentCategory];

        if (gameState.currentLevel === 'level1' && currentMaxLevel < 2) {
            currentUserData.unlockedLevels[currentCategory] = 2;
            console.log(`Unlocked Level 2 for ${currentCategory}!`);
        } else if (gameState.currentLevel === 'level2' && currentMaxLevel < 3) {
            currentUserData.unlockedLevels[currentCategory] = 3;
            console.log(`Unlocked Level 3 for ${currentCategory}!`);
        }
    }
    
    /**
     * NEW: Updates the category buttons on the level page to show which are locked/unlocked
     * for the currently selected difficulty.
     */
    function updateLevelUnlocks() {
        const selectedLevelNum = parseInt(UIElements.levelPage.difficultySelect.value.replace('level', ''));
        const unlockedLevels = gameState.allUsersData[gameState.currentUser].unlockedLevels;

        UIElements.levelPage.categoryBtns.forEach(btn => {
            const category = btn.dataset.category;
            const maxUnlockedForCategory = unlockedLevels[category];

            // A category is playable if its max unlocked level is >= the selected level
            if (maxUnlockedForCategory >= selectedLevelNum) {
                btn.disabled = false;
            } else {
                btn.disabled = true;
            }
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

    function getLast7Days() {
        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toISOString().split('T')[0];
        }).reverse();
    }

    // --- EVENT LISTENERS --- //
    
    // Main Menu User Profile
    UIElements.mainMenu.changeUserBtn.addEventListener('click', () => {
        UIElements.mainMenu.userDisplayMode.style.display = 'none';
        UIElements.mainMenu.userEditMode.style.display = 'block';
    });
    UIElements.mainMenu.userSelect.addEventListener('change', (e) => {
        UIElements.mainMenu.newUserInput.style.display = (e.target.value === 'new_user') ? 'block' : 'none';
        if(e.target.value === 'new_user') UIElements.mainMenu.newUserInput.focus();
    });
    UIElements.mainMenu.saveUserBtn.addEventListener('click', () => {
        let selectedUser = UIElements.mainMenu.userSelect.value;
        const newUser = UIElements.mainMenu.newUserInput.value.trim();
        if (selectedUser === 'new_user' && newUser) {
            switchUser(newUser);
        } else if (selectedUser !== 'new_user') {
            switchUser(selectedUser);
        }
        UIElements.mainMenu.userDisplayMode.style.display = 'block';
        UIElements.mainMenu.userEditMode.style.display = 'none';
    });
    
    // Main Menu Navigation
    UIElements.mainMenu.startBtn.addEventListener('click', () => navigateTo('level-page'));
    UIElements.mainMenu.adventureLogBtn.addEventListener('click', () => navigateTo('jejak-petualangan-page'));
    UIElements.mainMenu.settingsBtn.addEventListener('click', () => toggleOverlay('settings-overlay', true));
    // NEW: Guidebook listener
    UIElements.mainMenu.guidebookBtn.addEventListener('click', () => toggleOverlay('guidebook-overlay', true));
    
    // Level Page
    // NEW: Add listener to difficulty select to update locks on change
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

    // Quiz Page
    UIElements.quizPage.exitBtn.addEventListener('click', () => {
        clearInterval(gameState.questionTimer);
        navigateTo('main-menu');
    });
    UIElements.feedbackOverlay.nextBtn.addEventListener('click', () => {
        playSound(UIElements.sounds.click);
        toggleOverlay('feedback-overlay', false);
        nextQuestion();
    });

    // Hasil Page
    UIElements.hasilPage.homeBtn.addEventListener('click', () => navigateTo('main-menu'));
    UIElements.hasilPage.retryBtn.addEventListener('click', () => {
        playSound(UIElements.sounds.click);
        startQuiz(gameState.currentLevel, gameState.currentCategory);
    });
    UIElements.hasilPage.shareBtn.addEventListener('click', async () => {
        // Share logic remains the same
    });

    // Jejak Petualangan Page
    UIElements.jejakPetualanganPage.backBtn.addEventListener('click', () => navigateTo('main-menu'));
    UIElements.jejakPetualanganPage.tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            UIElements.jejakPetualanganPage.tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            document.querySelectorAll('#jejak-petualangan-page .tab-content').forEach(c => c.classList.remove('active'));
            document.getElementById(tab.dataset.tab).classList.add('active');
        });
    });

    // Settings Overlay
    UIElements.settingsOverlay.closeBtn.addEventListener('click', () => toggleOverlay('settings-overlay', false));
    UIElements.settingsOverlay.soundToggleBtn.addEventListener('click', () => {
        gameState.soundEnabled = !gameState.soundEnabled;
        updateSoundButtonUI();
        localStorage.setItem('jepangAdventureSound', JSON.stringify(gameState.soundEnabled));
        playSound(UIElements.sounds.click);
    });
    UIElements.settingsOverlay.resetBtn.addEventListener('click', () => {
        UIElements.confirmationOverlay.usernameText.textContent = gameState.currentUser;
        toggleOverlay('settings-overlay', false);
        toggleOverlay('confirmation-overlay', true);
    });

    // Confirmation Overlay
    UIElements.confirmationOverlay.confirmBtn.addEventListener('click', () => {
        resetCurrentUserData();
        toggleOverlay('confirmation-overlay', false);
    });
     UIElements.confirmationOverlay.cancelBtn.addEventListener('click', () => toggleOverlay('confirmation-overlay', false));

    // NEW: Guidebook Overlay Listeners
    UIElements.guidebookOverlay.closeBtn.addEventListener('click', () => toggleOverlay('guidebook-overlay', false));
    UIElements.guidebookOverlay.tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            UIElements.guidebookOverlay.tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            document.querySelectorAll('#guidebook-overlay .tab-content').forEach(c => c.classList.remove('active'));
            document.getElementById(tab.dataset.tab).classList.add('active');
        });
    });

    // --- INITIALIZATION --- //
    function init() {
        console.log('Initializing Japanese Adventure PWA v3...');
        loadGameData();
        navigateTo('main-menu');
    }

    init();
});

