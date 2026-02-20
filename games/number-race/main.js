/**
 * Number Race - Main Game Logic
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
            }).catch(() => {
                resolve();
            });
            // Fallback: resolve after 500ms in case resume() hangs (common on iOS)
            setTimeout(resolve, 500);
        } else {
            audioUnlocked = true;
            resolve();
        }
    });
}

// ==========================================
// GAME STATE
// ==========================================
const GameState = {
    score: 0,
    questionsAnswered: 0,
    correctAnswers: 0,
    streak: 0,
    difficulty: 'easy',
    operation: 'addition',
    selectedCharacter: 'batman',
    playerPosition: 0,
    opponentPosition: 0,
    playerSpeed: 1,
    opponentSpeed: 0.6,
    currentQuestion: null,
    startTime: null,
    startTime: null,
    isGameActive: false,
    raceInterval: null
};

// ==========================================
// DOM ELEMENTS
// ==========================================
const elements = {
    // Screens
    welcomeScreen: null,
    gameScreen: null,
    completeScreen: null,

    // Welcome screen
    difficultyBtns: null,
    operationBtns: null,
    characterCards: null,
    startBtn: null,

    // Game screen
    scoreDisplay: null,
    streakDisplay: null,
    currentQuestionDisplay: null,
    totalQuestionsDisplay: null,
    questionText: null,
    answersGrid: null,
    playerRunner: null,
    opponentRunner: null,
    playerProgress: null,
    opponentProgress: null,
    playerImg: null,

    // Complete screen
    resultEmoji: null,
    resultTitle: null,
    finalScore: null,
    finalTime: null,
    accuracy: null,
    correctAnswersDisplay: null,
    playAgainBtn: null,
    backToMenuBtn: null
};

// ==========================================
// INITIALIZATION
// ==========================================
function init() {
    cacheElements();
    setupEventListeners();
    loadHighScore();
}

function cacheElements() {
    // Screens
    elements.welcomeScreen = document.getElementById('welcome-screen');
    elements.gameScreen = document.getElementById('game-screen');
    elements.completeScreen = document.getElementById('complete-screen');

    // Welcome screen
    elements.difficultyBtns = document.querySelectorAll('[data-difficulty]');
    elements.operationBtns = document.querySelectorAll('[data-operation]');
    elements.characterCards = document.querySelectorAll('[data-character]');
    elements.startBtn = document.getElementById('start-game');

    // Game screen
    elements.scoreDisplay = document.getElementById('score');
    elements.streakDisplay = document.getElementById('streak');
    elements.currentQuestionDisplay = document.getElementById('current-question');
    // elements.totalQuestionsDisplay = document.getElementById('total-questions'); // Removed
    elements.questionText = document.getElementById('question-text');
    elements.answersGrid = document.getElementById('answers-grid');
    elements.playerRunner = document.getElementById('player-runner');
    elements.opponentRunner = document.getElementById('opponent-runner');
    elements.playerProgress = document.getElementById('player-progress');
    elements.opponentProgress = document.getElementById('opponent-progress');
    elements.playerImg = document.getElementById('player-img');

    // Complete screen
    elements.resultEmoji = document.getElementById('result-emoji');
    elements.resultTitle = document.getElementById('result-title');
    elements.finalScore = document.getElementById('final-score');
    elements.finalTime = document.getElementById('final-time');
    elements.accuracy = document.getElementById('accuracy');
    elements.correctAnswersDisplay = document.getElementById('correct-answers');
    elements.playAgainBtn = document.getElementById('play-again');
    elements.backToMenuBtn = document.getElementById('back-to-menu');
}

function setupEventListeners() {
    // Difficulty selection
    elements.difficultyBtns.forEach(btn => {
        btn.addEventListener('click', () => selectDifficulty(btn));
    });

    // Operation selection
    elements.operationBtns.forEach(btn => {
        btn.addEventListener('click', () => selectOperation(btn));
    });

    // Character selection
    elements.characterCards.forEach(card => {
        card.addEventListener('click', () => selectCharacter(card));
    });

    // Start game button
    elements.startBtn.addEventListener('click', startGame);
    elements.startBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        startGame();
    }, { passive: false });

    // Play again button
    elements.playAgainBtn.addEventListener('click', startGame);

    // Back to menu button
    elements.backToMenuBtn.addEventListener('click', () => {
        showScreen('welcome-screen');
    });

    // Keyboard support for answers (1-4 keys)
    document.addEventListener('keydown', handleKeyPress);
}

// ==========================================
// SELECTION HANDLERS
// ==========================================
function selectDifficulty(btn) {
    elements.difficultyBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    GameState.difficulty = btn.dataset.difficulty;
}

function selectOperation(btn) {
    elements.operationBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    GameState.operation = btn.dataset.operation;
}

function selectCharacter(card) {
    elements.characterCards.forEach(c => c.classList.remove('active'));
    card.classList.add('active');
    GameState.selectedCharacter = card.dataset.character;
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
        updateUI();
        nextQuestion();
        startRace();
    });
}

function resetGameState() {
    const config = getDifficultyConfig(GameState.difficulty);

    GameState.score = 0;
    GameState.questionsAnswered = 0;
    GameState.correctAnswers = 0;
    GameState.streak = 0;
    GameState.playerPosition = 0;
    GameState.opponentPosition = 0;
    GameState.playerSpeed = config.opponentSpeed; // Match opponent base speed
    GameState.opponentSpeed = config.opponentSpeed;
    GameState.startTime = Date.now();
    GameState.isGameActive = true;

    // Update character image
    elements.playerImg.src = getCharacterImage(GameState.selectedCharacter);

    // Reset progress bars
    elements.playerProgress.style.width = '0%';
    elements.opponentProgress.style.width = '0%';

    // Reset runner positions
    elements.playerRunner.style.left = '0px';
    elements.opponentRunner.style.left = '0px';
}

function nextQuestion() {
    if (!GameState.isGameActive) return;

    // Generate new question
    GameState.currentQuestion = generateProblem(GameState.difficulty, GameState.operation);

    // Update question display
    elements.questionText.textContent = GameState.currentQuestion.question;

    // Update answer buttons
    elements.answersGrid.innerHTML = '';
    GameState.currentQuestion.options.forEach(option => {
        const btn = document.createElement('button');
        btn.className = 'answer-btn';
        btn.textContent = option;
        btn.dataset.answer = option;
        btn.addEventListener('click', () => checkAnswer(option, btn));
        btn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            checkAnswer(option, btn);
        }, { passive: false });
        elements.answersGrid.appendChild(btn);
    });

    updateUI();
}

function checkAnswer(selectedAnswer, btn) {
    if (!GameState.isGameActive) return;

    // Disable all answer buttons
    const allBtns = elements.answersGrid.querySelectorAll('.answer-btn');
    allBtns.forEach(b => b.disabled = true);

    const isCorrect = selectedAnswer === GameState.currentQuestion.correctAnswer;

    if (isCorrect) {
        btn.classList.add('correct');
        GameState.correctAnswers++;
        GameState.streak++;

        // Calculate score
        let points = 100;
        points += GameState.streak * 50; // Streak bonus
        GameState.score += points;

        // Visual celebration effect
        createParticleEffect(btn, 'correct');
        elements.playerRunner.classList.add('celebrate');
        setTimeout(() => elements.playerRunner.classList.remove('celebrate'), 600);

        // Speed boost
        increasePlayerSpeed();
    } else {
        btn.classList.add('wrong');
        GameState.streak = 0;
        GameState.score = Math.max(0, GameState.score - 50);

        // Speed penalty for player
        decreasePlayerSpeed();

        // Opponent speed boost
        increaseOpponentSpeed();

        // Highlight correct answer
        allBtns.forEach(b => {
            if (parseInt(b.dataset.answer) === GameState.currentQuestion.correctAnswer) {
                b.classList.add('correct');
            }
        });
    }

    GameState.questionsAnswered++;
    updateUI();

    // Move to next question after delay
    setTimeout(() => {
        nextQuestion();
    }, 1500);
}

function handleKeyPress(e) {
    if (!GameState.isGameActive) return;

    const key = e.key;
    if (key >= '1' && key <= '4') {
        const index = parseInt(key) - 1;
        const btns = elements.answersGrid.querySelectorAll('.answer-btn');
        if (btns[index] && !btns[index].disabled) {
            const answer = parseInt(btns[index].dataset.answer);
            checkAnswer(answer, btns[index]);
        }
    }
}

// ==========================================
// RACE MECHANICS
// ==========================================
function startRace() {
    if (GameState.raceInterval) {
        clearInterval(GameState.raceInterval);
    }

    GameState.raceInterval = setInterval(updateRace, 100);
}

function updateRace() {
    if (!GameState.isGameActive) return;

    // Update positions (very slow multiplier = longer race, 40-60 seconds)
    GameState.playerPosition += GameState.playerSpeed * 0.08;
    GameState.opponentPosition += GameState.opponentSpeed * 0.08;

    // Clamp positions
    GameState.playerPosition = Math.min(100, GameState.playerPosition);
    GameState.opponentPosition = Math.min(100, GameState.opponentPosition);

    // Update visual positions
    updateRunnerPositions();

    // Check win condition
    if (GameState.playerPosition >= 100 || GameState.opponentPosition >= 100) {
        endGame();
    }
}

function updateRunnerPositions() {
    const trackWidth = elements.playerRunner.parentElement.offsetWidth - 50; // 50px for runner width

    const playerLeft = (GameState.playerPosition / 100) * trackWidth;
    const opponentLeft = (GameState.opponentPosition / 100) * trackWidth;

    elements.playerRunner.style.left = `${playerLeft}px`;
    elements.opponentRunner.style.left = `${opponentLeft}px`;

    elements.playerProgress.style.width = `${GameState.playerPosition}%`;
    elements.opponentProgress.style.width = `${GameState.opponentPosition}%`;
}

function increasePlayerSpeed() {
    GameState.playerSpeed = Math.min(3, GameState.playerSpeed + 0.5);
    elements.playerRunner.classList.add('speed-boost');
    setTimeout(() => {
        elements.playerRunner.classList.remove('speed-boost');
        GameState.playerSpeed = Math.max(1, GameState.playerSpeed - 0.3);
    }, 1000);
}

function decreasePlayerSpeed() {
    GameState.playerSpeed = Math.max(0.3, GameState.playerSpeed - 0.5);
    setTimeout(() => {
        GameState.playerSpeed = Math.min(1.5, GameState.playerSpeed + 0.3);
    }, 1000);
}

function increaseOpponentSpeed() {
    GameState.opponentSpeed = Math.min(3, GameState.opponentSpeed + 0.3);
    elements.opponentRunner.classList.add('speed-boost');
    setTimeout(() => {
        elements.opponentRunner.classList.remove('speed-boost');
        const config = getDifficultyConfig(GameState.difficulty);
        GameState.opponentSpeed = Math.max(config.opponentSpeed, GameState.opponentSpeed - 0.2);
    }, 1500);
}

// ==========================================
// VISUAL EFFECTS
// ==========================================
function createParticleEffect(element, type) {
    const emoji = type === 'correct' ? '⭐' : '❌';

    // Create multiple particles
    for (let i = 0; i < 12; i++) {
        const particle = document.createElement('div');
        particle.className = `particle ${type}`;
        particle.textContent = emoji;
        particle.style.left = '50%';
        particle.style.top = '50%';
        particle.style.setProperty('--tx', `${(Math.random() - 0.5) * 200}px`);
        particle.style.setProperty('--ty', `${-Math.random() * 150 - 50}px`);
        particle.style.animationDelay = `${i * 0.05}s`;

        element.appendChild(particle);

        setTimeout(() => particle.remove(), 1000);
    }
}

// ==========================================
// GAME END
// ==========================================
function endGame() {
    GameState.isGameActive = false;

    if (GameState.raceInterval) {
        clearInterval(GameState.raceInterval);
        GameState.raceInterval = null;
    }

    const endTime = Date.now();
    const totalTime = Math.floor((endTime - GameState.startTime) / 1000);
    const minutes = Math.floor(totalTime / 60);
    const seconds = totalTime % 60;

    // Calculate accuracy
    const accuracyPercent = GameState.questionsAnswered > 0
        ? Math.round((GameState.correctAnswers / GameState.questionsAnswered) * 100)
        : 0;

    // Determine if player won
    const playerWon = GameState.playerPosition >= GameState.opponentPosition;

    // Add time bonus if won
    if (playerWon) {
        const timeBonus = Math.max(0, 500 - totalTime * 5);
        GameState.score += timeBonus;

        // Perfect race bonus
        if (accuracyPercent === 100) {
            GameState.score += 1000;
        }
    }

    // Update complete screen
    if (playerWon) {
        elements.resultEmoji.textContent = '🏆';
        elements.resultTitle.textContent = 'ניצחת!';
    } else {
        elements.resultEmoji.textContent = '😢';
        elements.resultTitle.textContent = 'נסה שוב!';
    }

    elements.finalScore.textContent = GameState.score;
    elements.finalTime.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    elements.accuracy.textContent = `${accuracyPercent}%`;
    elements.correctAnswersDisplay.textContent = `${GameState.correctAnswers}/${GameState.questionsAnswered}`;

    // Save high score
    saveHighScore();

    // Show complete screen
    showScreen('complete-screen');
}

// ==========================================
// UI UPDATES
// ==========================================
function updateUI() {
    elements.scoreDisplay.textContent = GameState.score;
    elements.streakDisplay.textContent = GameState.streak;
    elements.currentQuestionDisplay.textContent = GameState.questionsAnswered + 1;
    elements.currentQuestionDisplay.textContent = GameState.questionsAnswered + 1;
    // elements.totalQuestionsDisplay.textContent = GameState.totalQuestions; // Removed
}

// ==========================================
// LOCAL STORAGE
// ==========================================
function saveHighScore() {
    const highScore = localStorage.getItem('numberRaceHighScore') || 0;
    if (GameState.score > highScore) {
        localStorage.setItem('numberRaceHighScore', GameState.score);
    }
}

function loadHighScore() {
    const highScore = localStorage.getItem('numberRaceHighScore') || 0;
    console.log('High Score:', highScore);
}

// ==========================================
// START
// ==========================================
document.addEventListener('DOMContentLoaded', init);
