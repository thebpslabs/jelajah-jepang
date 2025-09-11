// Wait for the DOM to be fully loaded before running the script
document.addEventListener('DOMContentLoaded', () => {

    // --- STATE MANAGEMENT --- //
    const gameState = {
        currentPage: 'main-menu',
        soundEnabled: true,
        currentLevel: 'level1',
        currentCategory: null,
        questions: [],
        currentQuestionIndex: 0,こヴぇｒ
        // NEW: Updated scoring and timer variables
        score: 0,
        comboStreak: 0, // Tracks consecutive correct answers
        questionTimer: null, // Holds the interval ID for the timer
        timeLeft: 0, // Time left on the timer
        // NEW: Multi-user data structure
        allUsersData: {}, // Object to hold all user profiles
        currentUser: 'Petualang', // Default user name
        allTimeScores: [] // Array to hold all scores for the leaderboard
    };

    // --- EMBEDDED QUIZ DATABASE --- //
    // The contents of database.json are placed here to avoid local file loading issues.
    // DELETED: The large quizDatabase object is now removed from here.

    // --- DOM ELEMENT SELECTORS --- //
    const UIElements = {
        pages: document.querySelectorAll('.page'),
// ... existing code ... */
    async function startQuiz(level, category) {
        gameState.currentLevel = level;
        gameState.currentCategory = category;
        gameState.currentQuestionIndex = 0;
// ... existing code ... */
        gameState.score = 0;
        gameState.comboStreak = 0;

        try {
            // NEW: Fetch questions from the external JSON file
            const response = await fetch('database.json');
            if (!response.ok) {
                // If the fetch fails, throw an error to be caught below
                throw new Error(`Network response was not ok: ${response.statusText}`);
            }
            const quizDatabase = await response.json();

            const questionPool = quizDatabase[level]?.[category];

            if (!questionPool || questionPool.length === 0) {
                 alert('Soal untuk kategori ini belum tersedia. Silakan pilih yang lain.');
                 navigateTo('level-page');
                 return;
            }
            gameState.questions = shuffleArray([...questionPool]).slice(0, 10);
            if (gameState.questions.length > 0) {
                navigateTo('quiz-page');
                displayQuestion();
            } else {
                alert('Tidak ada soal yang tersedia untuk kategori ini.');
                navigateTo('level-page');
            }
        } catch (error) {
            console.error('Could not load or start quiz:', error);
            alert('Gagal memuat data kuis. Pastikan file database.json ada dan coba lagi.');
        }
    }

    /**
// ... existing code ... */
        shuffledAnswers.forEach(answer => {
            const button = document.createElement('button');
            button.textContent = answer;
            button.classList.add('answer-btn');
            const colorClass = `${gameState.currentCategory.replace(' ', '.')}-btn`;
            button.classList.add(colorClass);
            button.addEventListener('click', () => handleAnswer(answer)); // MODIFIED: Removed second argument
            UIElements.quizPage.answerButtons.appendChild(button);
        });

// ... existing code ... */
    function startTimer() {
        clearInterval(gameState.questionTimer); // Clear any existing timer
        gameState.timeLeft = 10; // 10 seconds per question
        const timerBar = UIElements.quizPage.timerBar;
        
        // This makes the animation start immediately from full
        timerBar.style.transition = 'none';
        timerBar.style.width = '100%';
        // This forces a browser repaint, so the next transition works
        void timerBar.offsetWidth; 
        
        timerBar.style.transition = 'width 10s linear';
        timerBar.style.width = '0%';

        gameState.questionTimer = setInterval(() => {
            gameState.timeLeft -= 0.1;
            if (gameState.timeLeft <= 0) {
                // MODIFIED: Just stop the timer. Don't force an incorrect answer.
                // The user can still answer but will get no time bonus.
                clearInterval(gameState.questionTimer);
                gameState.timeLeft = 0;
            }
        }, 100);
    }
    
    /**
// ... existing code ... */
    /**
     * MODIFIED: Handles the entire scoring logic for an answer.
     * @param {string} selectedAnswer - The answer text selected by the user.
     */
    function handleAnswer(selectedAnswer) {
        clearInterval(gameState.questionTimer); // Stop the timer
        UIElements.quizPage.timerBar.style.transition = 'none'; // Stop animation
        
        // Disable answer buttons to prevent multiple clicks
// ... existing code ... */
        UIElements.quizPage.answerButtons.querySelectorAll('.answer-btn').forEach(btn => btn.classList.add('disabled'));

        const question = gameState.questions[gameState.currentQuestionIndex];
        const isCorrect = selectedAnswer === question.correct;
        
        let questionPoints = 0;
        let timerBonus = 0;
// ... existing code ... */
            
            // 1. Base points
            questionPoints = 100;
            
            // 2. Timer bonus (MODIFIED: Only award if time is left)
            if (gameState.timeLeft > 0) {
                timerBonus = Math.floor(gameState.timeLeft * 10); // 10 points per second left
            }

            // 3. Combo bonus
            if (gameState.comboStreak === 10) {
// ... existing code ... */
                 showScorePopup(`Combo ${gameState.comboStreak}x! +${comboBonus}`);
            }

        } else {
            playSound(UIElements.sounds.wrong);
            UIElements.feedbackOverlay.title.textContent = 'Salah!'; // MODIFIED: No more "Time's Up" message here
            gameState.comboStreak = 0; // Reset combo streak
        }
        
// ... existing code ... */

