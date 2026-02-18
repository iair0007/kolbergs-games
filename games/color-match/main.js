/**
 * Color Match Challenge - Main Logic
 */

// ==========================================
// AUDIO CONTEXT
// ==========================================
let audioContext = null;
let audioUnlocked = false;

function initAudioContext() {
    if (audioContext) return audioContext;
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        console.log('AudioContext created');
    } catch (e) {
        console.warn('Could not create AudioContext:', e);
    }
    return audioContext;
}

function unlockAudio() {
    if (audioUnlocked) return Promise.resolve();

    initAudioContext();

    return new Promise((resolve) => {
        if (audioContext && audioContext.state === 'suspended') {
            audioContext.resume().then(() => {
                console.log('AudioContext resumed');
                audioUnlocked = true;
                resolve();
            });
        } else {
            audioUnlocked = true;
            resolve();
        }
    });
}

// ==========================================
// LANGUAGE SYSTEM
// ==========================================
let currentLanguage = 'he'; // Default to Hebrew

const translations = {
    he: {
        gameTitle: 'אתגר התאמת הצבעים',
        gameSubtitle: 'Color Match Challenge',
        gameDescription: 'התאם צבעים לפני שנגמר הזמן!',
        difficultyLabel: 'בחר רמת קושי:',
        startBtn: 'התחל משחק!',
        scoreLabel: 'ניקוד:',
        questionText: 'איזה צבע זה?',
        backToDifficulty: '← חזרה לבחירת רמה',
        finalScoreLabel: 'ניקוד סופי:',
        accuracyLabel: 'דיוק:',
        bestStreakLabel: 'רצף הכי טוב:',
        playAgain: 'שחק שוב',
        mainMenu: '🏠 תפריט ראשי',
        completeTitle: 'כל הכבוד!'
    },
    en: {
        gameTitle: 'Color Match Challenge',
        gameSubtitle: 'אתגר התאמת הצבעים',
        gameDescription: 'Match the colors before time runs out!',
        difficultyLabel: 'Select Difficulty:',
        startBtn: 'Start Game!',
        scoreLabel: 'Score:',
        questionText: 'What color is this?',
        backToDifficulty: '← Back to Difficulty',
        finalScoreLabel: 'Final Score:',
        accuracyLabel: 'Accuracy:',
        bestStreakLabel: 'Best Streak:',
        playAgain: 'Play Again',
        mainMenu: '🏠 Main Menu',
        completeTitle: 'Well Done!'
    }
};

function updateLanguage(lang) {
    currentLanguage = lang;
    const t = translations[lang];

    // Update HTML direction
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', lang === 'he' ? 'rtl' : 'ltr');

    // Update text elements
    document.getElementById('game-title').textContent = t.gameTitle;
    document.getElementById('game-subtitle').textContent = t.gameSubtitle;
    document.getElementById('game-description').textContent = t.gameDescription;
    document.getElementById('difficulty-label').textContent = t.difficultyLabel;
    document.getElementById('start-btn-text').textContent = t.startBtn;
    document.getElementById('score-label').textContent = t.scoreLabel;
    document.getElementById('question-text').textContent = t.questionText;
    document.getElementById('back-to-difficulty').textContent = t.backToDifficulty;
    document.getElementById('final-score-label').textContent = t.finalScoreLabel;
    document.getElementById('accuracy-label').textContent = t.accuracyLabel;
    document.getElementById('best-streak-label').textContent = t.bestStreakLabel;
    document.getElementById('play-again-text').textContent = t.playAgain;
    document.getElementById('main-menu-text').textContent = t.mainMenu;

    // Update difficulty buttons
    document.querySelectorAll('.diff-name').forEach(el => {
        el.textContent = el.dataset[lang];
    });
    document.querySelectorAll('.diff-info').forEach(el => {
        el.textContent = el.dataset[lang];
    });
}

// ==========================================
// SPEECH SYNTHESIS
// ==========================================
function speakColor(colorName) {
    if ('speechSynthesis' in window) {
        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(colorName);
        utterance.lang = currentLanguage === 'he' ? 'he-IL' : 'en-US';
        utterance.rate = 0.9;
        utterance.pitch = 1;

        window.speechSynthesis.speak(utterance);
    }
}

// ==========================================
// GAME STATE
// ==========================================
const GameState = {
    score: 0,
    round: 1,
    totalRounds: 10,
    streak: 0,
    bestStreak: 0,
    correctAnswers: 0,
    difficulty: 'easy',
    timeLeft: 10,
    maxTime: 10,
    currentColor: null,
    options: [],
    timerInterval: null,
    isAnswered: false
};

// ==========================================
// DOM ELEMENTS
// ==========================================
let elements = {};

// ==========================================
// INITIALIZATION
// ==========================================
function init() {
    cacheElements();
    setupEventListeners();
}

function cacheElements() {
    elements = {
        // Language buttons
        langBtns: document.querySelectorAll('.lang-btn'),

        // Difficulty buttons
        difficultyBtns: document.querySelectorAll('.difficulty-btn'),

        // Game elements
        score: document.getElementById('score'),
        currentRound: document.getElementById('current-round'),
        totalRounds: document.getElementById('total-rounds'),
        streak: document.getElementById('streak'),
        streakDisplay: document.getElementById('streak-display'),
        timerBar: document.getElementById('timer-bar'),
        colorBox: document.getElementById('color-box'),
        questionText: document.getElementById('question-text'),
        optionsContainer: document.getElementById('options-container'),

        // Complete screen
        finalScore: document.getElementById('final-score'),
        accuracy: document.getElementById('accuracy'),
        bestStreak: document.getElementById('best-streak'),
        completeTitle: document.querySelector('.complete-title')
    };
}

function setupEventListeners() {
    // Language selection
    elements.langBtns.forEach(btn => {
        btn.addEventListener('click', () => selectLanguage(btn));
        btn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            selectLanguage(btn);
        }, { passive: false });
    });

    // Difficulty selection
    elements.difficultyBtns.forEach(btn => {
        btn.addEventListener('click', () => selectDifficulty(btn));
        btn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            selectDifficulty(btn);
        }, { passive: false });
    });

    // Start game button
    const startBtn = document.getElementById('start-game');
    startBtn.addEventListener('click', startGame);
    startBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        startGame();
    }, { passive: false });

    // Back to difficulty button
    const backBtn = document.getElementById('back-to-difficulty');
    backBtn.addEventListener('click', () => {
        clearInterval(GameState.timerInterval);
        showScreen('welcome-screen');
    });

    // Play again button
    document.getElementById('play-again').addEventListener('click', startGame);

    // Back to menu button
    document.getElementById('back-to-menu').addEventListener('click', () => {
        showScreen('welcome-screen');
    });
}

function selectLanguage(btn) {
    elements.langBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    updateLanguage(btn.dataset.lang);
}

function selectDifficulty(btn) {
    elements.difficultyBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    GameState.difficulty = btn.dataset.difficulty;
}

// ==========================================
// SCREEN NAVIGATION
// ==========================================
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

// ==========================================
// GAME LOGIC
// ==========================================
function startGame() {
    unlockAudio().then(() => {
        resetGameState();
        showScreen('game-screen');
        startRound();
    });
}

function resetGameState() {
    const settings = DIFFICULTY_SETTINGS[GameState.difficulty];

    GameState.score = 0;
    GameState.round = 1;
    GameState.totalRounds = settings.totalRounds;
    GameState.streak = 0;
    GameState.bestStreak = 0;
    GameState.correctAnswers = 0;
    GameState.maxTime = settings.timePerRound;

    updateUI();
}

function startRound() {
    GameState.isAnswered = false;
    GameState.timeLeft = GameState.maxTime;

    // Select random color
    const colorPool = COLORS[GameState.difficulty];
    GameState.currentColor = colorPool[Math.floor(Math.random() * colorPool.length)];

    // Generate options
    generateOptions();

    // Update UI
    updateRoundUI();

    // Start timer
    startTimer();
}

function generateOptions() {
    const settings = DIFFICULTY_SETTINGS[GameState.difficulty];
    const colorPool = COLORS[GameState.difficulty];
    const optionsCount = settings.optionsCount;

    // Start with correct answer
    GameState.options = [GameState.currentColor];

    // Add random wrong answers
    while (GameState.options.length < optionsCount) {
        const randomColor = colorPool[Math.floor(Math.random() * colorPool.length)];
        if (!GameState.options.find(c => c.name === randomColor.name)) {
            GameState.options.push(randomColor);
        }
    }

    // Shuffle options
    GameState.options.sort(() => Math.random() - 0.5);
}

function updateRoundUI() {
    // Update color display
    elements.colorBox.style.backgroundColor = GameState.currentColor.hex;

    // Update round counter
    elements.currentRound.textContent = GameState.round;
    elements.totalRounds.textContent = GameState.totalRounds;

    // Create option buttons
    elements.optionsContainer.innerHTML = '';

    // Add class for 6 options layout
    if (GameState.options.length === 6) {
        elements.optionsContainer.classList.add('six-options');
    } else {
        elements.optionsContainer.classList.remove('six-options');
    }

    GameState.options.forEach(color => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';

        // Add audio speaker icon
        const speaker = document.createElement('span');
        speaker.className = 'audio-speaker';
        speaker.textContent = '🔊';
        speaker.addEventListener('click', (e) => {
            e.stopPropagation();
            const colorName = currentLanguage === 'he' ? color.nameHe : color.name;
            speakColor(colorName);
        });
        speaker.addEventListener('touchstart', (e) => {
            e.stopPropagation();
            e.preventDefault();
            const colorName = currentLanguage === 'he' ? color.nameHe : color.name;
            speakColor(colorName);
        }, { passive: false });

        // Add color name
        const colorText = document.createElement('span');
        colorText.textContent = currentLanguage === 'he' ? color.nameHe : color.name;

        btn.appendChild(speaker);
        btn.appendChild(colorText);
        btn.dataset.colorName = color.name;

        btn.addEventListener('click', () => checkAnswer(color));
        btn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            checkAnswer(color);
        }, { passive: false });

        elements.optionsContainer.appendChild(btn);
    });
}

function startTimer() {
    if (GameState.timerInterval) {
        clearInterval(GameState.timerInterval);
    }

    const startTime = Date.now();
    const duration = GameState.maxTime * 1000;

    GameState.timerInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, duration - elapsed);
        const percentage = (remaining / duration) * 100;

        GameState.timeLeft = remaining / 1000;

        // Update timer bar
        elements.timerBar.style.width = percentage + '%';

        // Change color based on time
        if (percentage > 50) {
            elements.timerBar.className = 'timer-bar';
        } else if (percentage > 25) {
            elements.timerBar.className = 'timer-bar warning';
        } else {
            elements.timerBar.className = 'timer-bar danger';
        }

        // Time's up
        if (remaining <= 0) {
            clearInterval(GameState.timerInterval);
            if (!GameState.isAnswered) {
                handleWrongAnswer();
            }
        }
    }, 50);
}

function checkAnswer(selectedColor) {
    if (GameState.isAnswered) return;

    GameState.isAnswered = true;
    clearInterval(GameState.timerInterval);

    const isCorrect = selectedColor.name === GameState.currentColor.name;

    // Visual feedback
    const buttons = elements.optionsContainer.querySelectorAll('.option-btn');
    buttons.forEach(btn => {
        if (btn.dataset.colorName === selectedColor.name) {
            btn.classList.add(isCorrect ? 'correct' : 'wrong');
        }
        if (btn.dataset.colorName === GameState.currentColor.name) {
            btn.classList.add('correct');
        }
        btn.style.pointerEvents = 'none';
    });

    if (isCorrect) {
        handleCorrectAnswer();
    } else {
        handleWrongAnswer();
    }

    // Move to next round after delay
    setTimeout(() => {
        if (GameState.round < GameState.totalRounds) {
            GameState.round++;
            startRound();
        } else {
            endGame();
        }
    }, 1500);
}

function handleCorrectAnswer() {
    GameState.correctAnswers++;
    GameState.streak++;

    if (GameState.streak > GameState.bestStreak) {
        GameState.bestStreak = GameState.streak;
    }

    // Calculate score
    let points = 100; // Base points

    // Speed bonus (answered in first 2 seconds)
    if (GameState.timeLeft >= GameState.maxTime - 2) {
        points += 50;
    }

    // Streak bonus
    if (GameState.streak > 1) {
        points += 25 * (GameState.streak - 1);
    }

    GameState.score += points;

    updateUI();
}

function handleWrongAnswer() {
    GameState.streak = 0;
    updateUI();
}

function updateUI() {
    elements.score.textContent = GameState.score;
    elements.streak.textContent = GameState.streak;

    // Show/hide streak display
    if (GameState.streak > 0) {
        elements.streakDisplay.style.opacity = '1';
    } else {
        elements.streakDisplay.style.opacity = '0.3';
    }
}

function endGame() {
    clearInterval(GameState.timerInterval);

    // Calculate accuracy
    const accuracy = Math.round((GameState.correctAnswers / GameState.totalRounds) * 100);

    // Check for perfect round bonus
    if (accuracy === 100) {
        GameState.score += 500;
    }

    // Update complete screen
    elements.finalScore.textContent = GameState.score;
    elements.accuracy.textContent = accuracy + '%';
    elements.bestStreak.textContent = GameState.bestStreak;
    elements.completeTitle.textContent = translations[currentLanguage].completeTitle;

    // Save high score
    const highScoreKey = `colorMatch_${GameState.difficulty}_highScore`;
    const currentHighScore = localStorage.getItem(highScoreKey) || 0;
    if (GameState.score > currentHighScore) {
        localStorage.setItem(highScoreKey, GameState.score);
    }

    showScreen('complete-screen');
}

// ==========================================
// START
// ==========================================
document.addEventListener('DOMContentLoaded', init);
