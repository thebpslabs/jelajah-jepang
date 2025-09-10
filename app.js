// Wait for the DOM to be fully loaded before running the script
document.addEventListener('DOMContentLoaded', () => {

    // --- STATE MANAGEMENT --- //
    // This object holds the current state of the game
    const gameState = {
        currentPage: 'main-menu', // Tracks the currently visible page
        soundEnabled: true,       // Controls whether sounds are on or off
        currentLevel: 'level1',   // Selected difficulty level
        currentCategory: null,    // Selected quiz category
        questions: [],            // Array of questions for the current quiz
        currentQuestionIndex: 0,  // Index of the current question
        score: 0,                 // Player's score for the current round
        userData: {               // Data stored locally on the user's device
            attempts: [],         // Array of quiz attempt objects {date, score, level, category}
            unlockedLevels: ['level1'] // Levels the user has access to
        }
    };

    // --- DOM ELEMENT SELECTORS --- //
    // A central place to store references to all the HTML elements we'll need
    const UIElements = {
        pages: document.querySelectorAll('.page'),
        appContainer: document.getElementById('app-container'),
        mainMenu: {
            title: document.getElementById('main-title'),
            startBtn: document.getElementById('start-btn'),
            adventureLogBtn: document.getElementById('adventure-log-btn'),
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
            progressBar: document.getElementById('progress-bar')
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
             confirmBtn: document.getElementById('confirm-reset-btn'),
             cancelBtn: document.getElementById('cancel-reset-btn')
        },
        sounds: {
            click: document.getElementById('click-sound'),
            correct: document.getElementById('correct-sound'),
            wrong: document.getElementById('wrong-sound')
        }
    };
    
    let adventureChartInstance = null; // To hold the Chart.js instance

    // --- DATA HANDLING --- //

    /**
     * Loads user data from localStorage. If no data exists, it initializes it.
     */
    function loadUserData() {
        const savedData = localStorage.getItem('jepangAdventureData');
        if (savedData) {
            gameState.userData = JSON.parse(savedData);
            // Ensure unlockedLevels is always an array
            if (!gameState.userData.unlockedLevels) {
                gameState.userData.unlockedLevels = ['level1'];
            }
        }
        // Load sound settings
        const savedSoundSetting = localStorage.getItem('jepangAdventureSound');
        if (savedSoundSetting !== null) {
            gameState.soundEnabled = JSON.parse(savedSoundSetting);
        }
        updateSoundButtonUI();
    }

    /**
     * Saves the current user data to localStorage.
     */
    function saveUserData() {
        localStorage.setItem('jepangAdventureData', JSON.stringify(gameState.userData));
    }

    /**
     * Saves the current sound setting to localStorage.
     */
    function saveSoundSetting() {
        localStorage.setItem('jepangAdventureSound', JSON.stringify(gameState.soundEnabled));
    }

    /**
     * Deletes all user data from the game and localStorage.
     */
    function resetUserData() {
        gameState.userData = {
            attempts: [],
            unlockedLevels: ['level1']
        };
        saveUserData();
        alert('Data petualangan telah direset!');
        updateLevelUnlocks(); // Re-lock levels in the UI
    }

    // --- UI & NAVIGATION --- //

    /**
     * Changes the currently visible page.
     * @param {string} pageId - The ID of the page to show.
     */
    function navigateTo(pageId) {
        playSound(UIElements.sounds.click);
        gameState.currentPage = pageId;

        // Hide all pages
        UIElements.pages.forEach(page => {
            page.classList.remove('active');
        });

        // Show the target page
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.add('active');
            // Set a new random background image each time a page is navigated to
            setRandomBackground();
        }

        // Special actions for specific pages
        if (pageId === 'jejak-petualangan-page') {
            displayAdventureLog();
        } else if (pageId === 'level-page') {
            updateLevelUnlocks();
        }
    }
    
    /**
     * Opens or closes an overlay.
     * @param {string} overlayId - The ID of the overlay element.
     * @param {boolean} show - True to show, false to hide.
     */
    function toggleOverlay(overlayId, show) {
        const overlay = document.getElementById(overlayId);
        if (overlay) {
            if (show) {
                overlay.classList.add('active');
            } else {
                overlay.classList.remove('active');
            }
        }
    }


    /**
     * Sets a random background image to the app container.
     */
    function setRandomBackground() {
        // Generate a random number between 1 and 10
        const bgIndex = Math.floor(Math.random() * 10) + 1;
        UIElements.appContainer.style.backgroundImage = `url('assets/Background${bgIndex}.jpg')`;
    }
    
    /**
     * Updates the UI of the sound toggle button based on the current state.
     */
    function updateSoundButtonUI() {
        UIElements.settingsOverlay.soundToggleBtn.textContent = `Sounds: ${gameState.soundEnabled ? 'ON' : 'OFF'}`;
    }

    // --- SOUND --- //

    /**
     * Plays a sound if sound is enabled in the game state.
     * @param {HTMLAudioElement} soundElement - The audio element to play.
     */
    function playSound(soundElement) {
        if (gameState.soundEnabled && soundElement) {
            soundElement.currentTime = 0; // Rewind to the start
            soundElement.play();
        }
    }
    
    // --- QUIZ LOGIC --- //

    /**
     * Starts the quiz after a level and category are selected.
     * @param {string} level - The selected difficulty level (e.g., 'level1').
     * @param {string} category - The selected category (e.g., 'Restoran').
     */
    async function startQuiz(level, category) {
        gameState.currentLevel = level;
        gameState.currentCategory = category;
        gameState.currentQuestionIndex = 0;
        gameState.score = 0;

        try {
            // Fetch the entire database
            const response = await fetch('database.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const db = await response.json();
            
            // Get questions for the selected level and category
            const questionPool = db[level]?.[category];

            if (!questionPool || questionPool.length === 0) {
                 console.error(`No questions found for level '${level}' and category '${category}'.`);
                 alert('Soal untuk kategori ini belum tersedia. Silakan pilih yang lain.');
                 navigateTo('level-page');
                 return;
            }

            // Shuffle the question pool and pick the first 10
            gameState.questions = shuffleArray([...questionPool]).slice(0, 10);
            
            if (gameState.questions.length > 0) {
                navigateTo('quiz-page');
                displayQuestion();
            } else {
                alert('Tidak ada soal yang tersedia untuk kategori ini.');
                navigateTo('level-page');
            }
        } catch (error) {
            console.error('Could not load quiz data:', error);
            alert('Gagal memuat data kuis. Silakan coba lagi.');
        }
    }

    /**
     * Displays the current question and answer options.
     */
    function displayQuestion() {
        // Update progress bar
        const progress = ((gameState.currentQuestionIndex) / gameState.questions.length) * 100;
        UIElements.quizPage.progressBar.style.width = `${progress}%`;

        const question = gameState.questions[gameState.currentQuestionIndex];
        
        UIElements.quizPage.title.textContent = `Petualangan di ${gameState.currentCategory}`;
        UIElements.quizPage.questionText.textContent = question.question;
        UIElements.quizPage.image.src = `assets/${question.image}`;
        
        // Clear previous answer buttons
        UIElements.quizPage.answerButtons.innerHTML = '';
        
        // Shuffle and create new answer buttons
        const shuffledAnswers = shuffleArray([...question.answers]);
        shuffledAnswers.forEach(answer => {
            const button = document.createElement('button');
            button.textContent = answer;
            button.classList.add('answer-btn');
            // Add category-specific color class
            const colorClass = `${gameState.currentCategory.replace(' ', '.')}-btn`;
            button.classList.add(colorClass);
            button.addEventListener('click', () => handleAnswer(answer));
            UIElements.quizPage.answerButtons.appendChild(button);
        });
    }

    /**
     * Handles the user's answer selection.
     * @param {string} selectedAnswer - The answer text selected by the user.
     */
    function handleAnswer(selectedAnswer) {
        const question = gameState.questions[gameState.currentQuestionIndex];
        const isCorrect = selectedAnswer === question.correct;
        
        if (isCorrect) {
            gameState.score++;
            UIElements.feedbackOverlay.title.textContent = 'Benar!';
            playSound(UIElements.sounds.correct);
        } else {
            UIElements.feedbackOverlay.title.textContent = 'Salah!';
            playSound(UIElements.sounds.wrong);
        }
        
        UIElements.feedbackOverlay.text.textContent = question.feedback;
        toggleOverlay('feedback-overlay', true);
    }
    
    /**
     * Moves to the next question or ends the quiz if all questions are answered.
     */
    function nextQuestion() {
        gameState.currentQuestionIndex++;
        if (gameState.currentQuestionIndex < gameState.questions.length) {
            displayQuestion();
        } else {
            // End of quiz
            endQuiz();
        }
    }
    
    /**
     * Finalizes the quiz, saves the score, and navigates to the result page.
     */
    function endQuiz() {
        // Save attempt data
        const attempt = {
            date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
            score: (gameState.score / gameState.questions.length) * 100,
            level: gameState.currentLevel,
            category: gameState.currentCategory
        };
        gameState.userData.attempts.push(attempt);
        
        checkAndUnlockLevels(); // Check if a new level should be unlocked
        saveUserData(); // Save after updating attempts and unlocks
        
        displayResults();
        navigateTo('hasil-page');
        // Update final progress bar state
        UIElements.quizPage.progressBar.style.width = '100%';
    }

    // --- RESULT & ADVENTURE LOG --- //

    /**
     * Displays the results on the "Hasil" page based on the final score.
     */
    function displayResults() {
        const score = gameState.score;
        const total = gameState.questions.length;
        let result = {};

        if (score >= 10) {
            result = { text: "Apakah kamu orang Jepang?!", subtext: "Selamat! Nilai sempurna! Ayo coba kategori lainnya!", image: "Success2.jpg" };
        } else if (score >= 7) {
            result = { text: "Kamu sudah siap ke Jepang!", subtext: "Tapi bisakah kamu dapat nilai sempurna?", image: "Success1.jpg" };
        } else if (score >= 4) {
            result = { text: "Perlu persiapan sedikit lagi!", subtext: "Jangan menyerah, ayo coba lagi!!", image: "fail2.jpg" };
        } else {
            result = { text: "Kamu belum siap ke Jepang...", subtext: "Bisa bahasa Jepang jadi lebih tenang. Ayo semangat!", image: "fail1.jpg" };
        }
        
        UIElements.hasilPage.scoreText.textContent = `${score} / ${total}`;
        UIElements.hasilPage.resultText.textContent = result.text;
        UIElements.hasilPage.resultSubtext.textContent = result.subtext;
        UIElements.hasilPage.image.src = `assets/${result.image}`;
    }
    
    /**
     * Displays the user's stats and progress chart on the "Jejak Petualangan" page.
     */
    function displayAdventureLog() {
        const attempts = gameState.userData.attempts;
        const totalAttempts = attempts.length;

        // Calculate stats
        const totalScore = attempts.reduce((sum, attempt) => sum + attempt.score, 0);
        const averageScore = totalAttempts > 0 ? (totalScore / totalAttempts).toFixed(1) : 0;
        
        // Update pangkat
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

        // Update UI Text
        UIElements.jejakPetualanganPage.totalAttempts.textContent = totalAttempts;
        UIElements.jejakPetualanganPage.averageScore.textContent = `${averageScore}%`;
        
        // --- Chart Logic ---
        const last7Days = getLast7Days();
        const dailyAttempts = last7Days.map(date => {
            return attempts.filter(attempt => attempt.date === date).length;
        });

        const chartCtx = UIElements.jejakPetualanganPage.chart.getContext('2d');
        if(adventureChartInstance) {
            adventureChartInstance.destroy(); // Destroy previous chart to redraw
        }
        adventureChartInstance = new Chart(chartCtx, {
            type: 'bar',
            data: {
                labels: last7Days.map(d => d.slice(5)), // Show MM-DD
                datasets: [{
                    label: 'Jumlah Petualangan (7 Hari Terakhir)',
                    data: dailyAttempts,
                    backgroundColor: 'rgba(255, 215, 0, 0.8)',
                    borderColor: 'rgba(255, 215, 0, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                           stepSize: 1
                        }
                    }
                }
            }
        });
    }

    // --- LEVEL UNLOCKING --- //

    /**
     * Checks if the user's performance warrants unlocking the next level.
     */
    function checkAndUnlockLevels() {
        const categories = ["Restoran", "Minimarket", "Kereta", "Rumah Sakit"];
        const unlockThreshold = 80;

        // Check for unlocking level 2
        if (!gameState.userData.unlockedLevels.includes('level2')) {
            const level1Scores = categories.map(cat => {
                const categoryAttempts = gameState.userData.attempts.filter(a => a.level === 'level1' && a.category === cat);
                // Get the highest score for this category
                return categoryAttempts.length > 0 ? Math.max(...categoryAttempts.map(a => a.score)) : 0;
            });
            // If every category has a score of 80% or more
            if (level1Scores.every(score => score >= unlockThreshold)) {
                gameState.userData.unlockedLevels.push('level2');
            }
        }
        
        // Check for unlocking level 3
        if (gameState.userData.unlockedLevels.includes('level2') && !gameState.userData.unlockedLevels.includes('level3')) {
             const level2Scores = categories.map(cat => {
                const categoryAttempts = gameState.userData.attempts.filter(a => a.level === 'level2' && a.category === cat);
                return categoryAttempts.length > 0 ? Math.max(...categoryAttempts.map(a => a.score)) : 0;
            });
            if (level2Scores.every(score => score >= unlockThreshold)) {
                gameState.userData.unlockedLevels.push('level3');
            }
        }
    }
    
    /**
     * Updates the difficulty dropdown UI to enable/disable levels based on unlocks.
     */
    function updateLevelUnlocks() {
        const unlocked = gameState.userData.unlockedLevels;
        UIElements.levelPage.difficultySelect.querySelectorAll('option').forEach(option => {
           if (option.value === 'level2') {
               option.disabled = !unlocked.includes('level2');
               option.innerHTML = unlocked.includes('level2') ? 'Pernah ke Jepang' : '&#x1F512; Pernah ke Jepang';
           } else if (option.value === 'level3') {
               option.disabled = !unlocked.includes('level3');
               option.innerHTML = unlocked.includes('level3') ? 'Sering ke Jepang' : '&#x1F512; Sering ke Jepang';
           }
        });
    }


    // --- UTILITY FUNCTIONS --- //
    
    /**
     * Shuffles an array in place.
     * @param {Array} array - The array to shuffle.
     * @returns {Array} The shuffled array.
     */
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]]; // ES6 destructuring swap
        }
        return array;
    }

    /**
     * Gets an array of the last 7 dates in YYYY-MM-DD format.
     * @returns {Array<string>}
     */
    function getLast7Days() {
        const dates = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            dates.push(d.toISOString().split('T')[0]);
        }
        return dates;
    }


    // --- EVENT LISTENERS --- //
    
    // Main Menu Navigation
    UIElements.mainMenu.startBtn.addEventListener('click', () => navigateTo('level-page'));
    UIElements.mainMenu.adventureLogBtn.addEventListener('click', () => navigateTo('jejak-petualangan-page'));
    UIElements.mainMenu.settingsBtn.addEventListener('click', () => {
        playSound(UIElements.sounds.click);
        toggleOverlay('settings-overlay', true);
    });
    
    // Level Page
    UIElements.levelPage.difficultySelect.addEventListener('change', (e) => {
        gameState.currentLevel = e.target.value;
    });
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
    UIElements.quizPage.exitBtn.addEventListener('click', () => navigateTo('main-menu'));
    UIElements.feedbackOverlay.nextBtn.addEventListener('click', () => {
        playSound(UIElements.sounds.click);
        toggleOverlay('feedback-overlay', false);
        nextQuestion();
    });

    // Hasil Page
    UIElements.hasilPage.homeBtn.addEventListener('click', () => navigateTo('main-menu'));
    UIElements.hasilPage.retryBtn.addEventListener('click', () => {
        playSound(UIElements.sounds.click);
        // Restart the quiz with the same level and category
        startQuiz(gameState.currentLevel, gameState.currentCategory);
    });
    UIElements.hasilPage.shareBtn.addEventListener('click', async () => {
        playSound(UIElements.sounds.click);
        const shareData = {
            title: 'Petualangan di Jepang',
            text: `Skorku di Petualangan Jepang: ${gameState.score}/${gameState.questions.length}! Bisakah kamu mengalahkanku?`,
            url: window.location.href
        };
        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                // Fallback for browsers that don't support Web Share API
                alert('Fitur share tidak didukung di browser ini. Silakan salin link secara manual.');
            }
        } catch (err) {
            console.error('Error sharing:', err);
        }
    });

    // Jejak Petualangan Page
    UIElements.jejakPetualanganPage.backBtn.addEventListener('click', () => navigateTo('main-menu'));

    // Settings Overlay
    UIElements.settingsOverlay.closeBtn.addEventListener('click', () => {
        playSound(UIElements.sounds.click);
        toggleOverlay('settings-overlay', false);
    });
    UIElements.settingsOverlay.soundToggleBtn.addEventListener('click', () => {
        gameState.soundEnabled = !gameState.soundEnabled;
        updateSoundButtonUI();
        saveSoundSetting();
        playSound(UIElements.sounds.click);
    });
    UIElements.settingsOverlay.resetBtn.addEventListener('click', () => {
        playSound(UIElements.sounds.click);
        toggleOverlay('settings-overlay', false); // Hide settings
        toggleOverlay('confirmation-overlay', true); // Show confirmation
    });

    // Confirmation Overlay
    UIElements.confirmationOverlay.confirmBtn.addEventListener('click', () => {
        playSound(UIElements.sounds.click);
        resetUserData();
        toggleOverlay('confirmation-overlay', false);
    });
     UIElements.confirmationOverlay.cancelBtn.addEventListener('click', () => {
        playSound(UIElements.sounds.click);
        toggleOverlay('confirmation-overlay', false);
    });


    // --- INITIALIZATION --- //

    /**
     * The main function to initialize the application.
     */
    function init() {
        console.log('Initializing Japanese Adventure PWA...');
        loadUserData();
        navigateTo('main-menu'); // Start at the main menu
        UIElements.mainMenu.title.classList.add('pulse'); // Start pulse animation
    }

    // Run the app
    init();

});
