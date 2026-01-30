/**
 * Hebrew Hero - Main Game Logic
 * An educational Hebrew reading and writing game for kids ages 6-8
 */

// ==========================================
// GAME STATE
// ==========================================
const GameState = {
    difficulty: 'easy',
    currentMode: null,
    currentQuestion: 0,
    totalQuestions: 5,
    correctAnswers: 0,
    stars: 0,
    coins: 0,
    totalStars: 0,
    totalCoins: 0,
    timerEnabled: false,
    soundEnabled: true,
    activeLetters: null, // null means all letters active
    currentTarget: null,
    currentWord: null,
    selectedLetters: [],
    isTracing: false,
    traceGuideVisible: true
};

// ==========================================
// INITIALIZATION
// ==========================================
function init() {
    loadProgress();
    setupEventListeners();
    setupSettingsPanel();
    updateStatsDisplay();
}

function loadProgress() {
    const saved = localStorage.getItem('hebrewHeroProgress');
    if (saved) {
        const data = JSON.parse(saved);
        GameState.totalStars = data.totalStars || 0;
        GameState.totalCoins = data.totalCoins || 0;
        GameState.difficulty = data.difficulty || 'easy';
        GameState.activeLetters = data.activeLetters || null;
        GameState.timerEnabled = data.timerEnabled || false;
        GameState.soundEnabled = data.soundEnabled !== false;
    }
}

function saveProgress() {
    localStorage.setItem('hebrewHeroProgress', JSON.stringify({
        totalStars: GameState.totalStars,
        totalCoins: GameState.totalCoins,
        difficulty: GameState.difficulty,
        activeLetters: GameState.activeLetters,
        timerEnabled: GameState.timerEnabled,
        soundEnabled: GameState.soundEnabled
    }));
}

function updateStatsDisplay() {
    document.getElementById('stars-amount').textContent = GameState.totalStars;
    document.getElementById('coins-amount').textContent = GameState.totalCoins;
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
// EVENT LISTENERS
// ==========================================
function setupEventListeners() {
    // Difficulty buttons on welcome screen
    document.querySelectorAll('.difficulty-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            GameState.difficulty = btn.dataset.difficulty;
        });
    });

    // Start game button
    document.getElementById('start-game').addEventListener('click', () => {
        showScreen('mode-screen');
    });

    // Mode selection
    document.querySelectorAll('.mode-card').forEach(card => {
        card.addEventListener('click', () => {
            const mode = card.dataset.mode;
            startGame(mode);
        });
    });

    // Back buttons
    document.getElementById('back-to-welcome').addEventListener('click', () => {
        showScreen('welcome-screen');
    });

    // Word game controls
    document.getElementById('clear-word')?.addEventListener('click', clearWordSlots);
    document.getElementById('check-word')?.addEventListener('click', checkWord);

    // Trace game controls
    document.getElementById('toggle-guide')?.addEventListener('click', toggleTraceGuide);
    document.getElementById('clear-canvas')?.addEventListener('click', clearCanvas);
    document.getElementById('submit-trace')?.addEventListener('click', submitTrace);

    // Sound match reveal hint
    document.getElementById('reveal-hint')?.addEventListener('click', revealLetterHint);

    // Complete screen buttons
    document.getElementById('play-again')?.addEventListener('click', () => {
        startGame(GameState.currentMode);
    });
    document.getElementById('back-to-modes')?.addEventListener('click', () => {
        showScreen('mode-screen');
    });
    document.getElementById('back-to-menu')?.addEventListener('click', () => {
        showScreen('welcome-screen');
    });

    // Game screen back buttons - go back to mode selection
    document.getElementById('match-back-to-modes')?.addEventListener('click', () => {
        showScreen('mode-screen');
    });
    document.getElementById('word-back-to-modes')?.addEventListener('click', () => {
        showScreen('mode-screen');
    });
    document.getElementById('trace-back-to-modes')?.addEventListener('click', () => {
        showScreen('mode-screen');
    });
    document.getElementById('sound-back-to-modes')?.addEventListener('click', () => {
        showScreen('mode-screen');
    });

    // Settings toggle
    document.getElementById('settings-toggle').addEventListener('click', () => {
        document.getElementById('settings-panel').classList.toggle('visible');
    });
}

// ==========================================
// SETTINGS PANEL
// ==========================================
function setupSettingsPanel() {
    // Populate letter toggles
    const container = document.getElementById('letters-toggle');
    HEBREW_LETTERS.forEach(letterData => {
        const label = document.createElement('label');
        label.className = 'letter-toggle';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = letterData.letter;
        checkbox.checked = !GameState.activeLetters || GameState.activeLetters.includes(letterData.letter);

        const span = document.createElement('span');
        span.textContent = letterData.letter;

        label.appendChild(checkbox);
        label.appendChild(span);
        container.appendChild(label);
    });

    // Set initial values
    document.getElementById('setting-difficulty').value = GameState.difficulty;
    document.getElementById('setting-timer').checked = GameState.timerEnabled;
    document.getElementById('setting-sound').checked = GameState.soundEnabled;

    // Save settings
    document.getElementById('save-settings').addEventListener('click', () => {
        GameState.difficulty = document.getElementById('setting-difficulty').value;
        GameState.timerEnabled = document.getElementById('setting-timer').checked;
        GameState.soundEnabled = document.getElementById('setting-sound').checked;

        // Get active letters
        const checkedLetters = Array.from(document.querySelectorAll('#letters-toggle input:checked'))
            .map(input => input.value);
        GameState.activeLetters = checkedLetters.length === HEBREW_LETTERS.length ? null : checkedLetters;

        // Update difficulty buttons
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.classList.toggle('selected', btn.dataset.difficulty === GameState.difficulty);
        });

        saveProgress();
        document.getElementById('settings-panel').classList.remove('visible');
    });

    // Close settings
    document.getElementById('close-settings').addEventListener('click', () => {
        document.getElementById('settings-panel').classList.remove('visible');
    });
}

// ==========================================
// GAME START
// ==========================================
function startGame(mode) {
    GameState.currentMode = mode;
    GameState.currentQuestion = 0;
    GameState.correctAnswers = 0;
    GameState.stars = 0;
    GameState.coins = 0;

    const config = DIFFICULTY_CONFIG[GameState.difficulty];
    GameState.totalQuestions = config.questionsPerRound;

    switch (mode) {
        case 'letter-match':
            showScreen('letter-match-screen');
            nextLetterMatch();
            break;
        case 'build-word':
            showScreen('build-word-screen');
            nextBuildWord();
            break;
        case 'trace-letter':
            showScreen('trace-letter-screen');
            setupTraceCanvas();
            nextTraceLetter();
            break;
        case 'sound-match':
            showScreen('sound-match-screen');
            nextSoundMatch();
            break;
    }
}

// ==========================================
// LETTER MATCH GAME
// ==========================================
function nextLetterMatch() {
    if (GameState.currentQuestion >= GameState.totalQuestions) {
        showCompleteScreen();
        return;
    }

    GameState.currentQuestion++;
    updateProgress('match');

    const config = DIFFICULTY_CONFIG[GameState.difficulty];
    const letterPool = getAvailableLetters();

    // Pick random target letter
    const targetIndex = Math.floor(Math.random() * letterPool.length);
    const targetLetter = letterPool[targetIndex];
    GameState.currentTarget = targetLetter;

    // Display target
    document.getElementById('target-letter').textContent = targetLetter.letter;
    document.getElementById('target-letter').classList.add('bounce-in');
    setTimeout(() => {
        document.getElementById('target-letter').classList.remove('bounce-in');
    }, 500);

    // Generate options
    const options = [targetLetter];
    const otherLetters = letterPool.filter(l => l.letter !== targetLetter.letter);

    while (options.length < config.optionsCount && otherLetters.length > 0) {
        const randomIndex = Math.floor(Math.random() * otherLetters.length);
        options.push(otherLetters.splice(randomIndex, 1)[0]);
    }

    // Shuffle options
    shuffleArray(options);

    // Render options
    const optionsContainer = document.getElementById('letter-options');
    optionsContainer.innerHTML = '';

    options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'option-btn letter-option';
        btn.textContent = opt.letter;
        btn.addEventListener('click', () => checkLetterMatch(opt.letter, btn));
        optionsContainer.appendChild(btn);
    });

    clearFeedback('match');
}

function checkLetterMatch(selectedLetter, button) {
    const config = DIFFICULTY_CONFIG[GameState.difficulty];
    const isCorrect = selectedLetter === GameState.currentTarget.letter;

    if (isCorrect) {
        button.classList.add('correct');
        GameState.correctAnswers++;
        GameState.stars += config.starsPerCorrect;
        GameState.coins += config.coinsPerCorrect;
        showFeedback('match', true);
        playSound('correct');

        setTimeout(() => {
            nextLetterMatch();
        }, 1200);
    } else {
        button.classList.add('wrong');
        showFeedback('match', false);
        playSound('wrong');
        button.disabled = true;
    }
}

// ==========================================
// BUILD WORD GAME
// ==========================================
function nextBuildWord() {
    if (GameState.currentQuestion >= GameState.totalQuestions) {
        showCompleteScreen();
        return;
    }

    GameState.currentQuestion++;
    updateProgress('word');

    const config = DIFFICULTY_CONFIG[GameState.difficulty];
    const wordPool = config.wordPool.filter(w => {
        if (!GameState.activeLetters) return true;
        return w.word.split('').every(char => GameState.activeLetters.includes(char));
    });

    if (wordPool.length === 0) {
        // Fallback to all words if none match active letters
        const fallbackPool = HEBREW_WORDS.filter(w => w.difficulty === GameState.difficulty || w.difficulty === 'easy');
        GameState.currentWord = fallbackPool[Math.floor(Math.random() * fallbackPool.length)];
    } else {
        GameState.currentWord = wordPool[Math.floor(Math.random() * wordPool.length)];
    }

    const word = GameState.currentWord;
    GameState.selectedLetters = [];

    // Display hint
    document.getElementById('word-emoji').textContent = word.emoji;
    document.getElementById('word-hint').textContent = word.hint;

    // Create slots
    const slotsContainer = document.getElementById('word-slots');
    slotsContainer.innerHTML = '';

    for (let i = 0; i < word.word.length; i++) {
        const slot = document.createElement('div');
        slot.className = 'word-slot';
        slot.dataset.index = i;
        slot.addEventListener('click', () => removeLetterFromSlot(i));
        slotsContainer.appendChild(slot);
    }

    // Create letter bank (scrambled)
    const letters = word.word.split('');
    shuffleArray(letters);

    const bankContainer = document.getElementById('letter-bank');
    bankContainer.innerHTML = '';

    letters.forEach((letter, index) => {
        const btn = document.createElement('button');
        btn.className = 'bank-letter';
        btn.textContent = letter;
        btn.dataset.letter = letter;
        btn.dataset.index = index;
        btn.addEventListener('click', () => selectBankLetter(letter, btn));
        bankContainer.appendChild(btn);
    });

    clearFeedback('word');
}

function selectBankLetter(letter, button) {
    if (button.classList.contains('used')) return;

    const slots = document.querySelectorAll('.word-slot');
    const emptySlotIndex = GameState.selectedLetters.length;

    if (emptySlotIndex >= slots.length) return;

    button.classList.add('used');
    GameState.selectedLetters.push({
        letter: letter,
        buttonIndex: button.dataset.index
    });

    slots[emptySlotIndex].textContent = letter;
    slots[emptySlotIndex].classList.add('filled');

    playSound('click');
}

function removeLetterFromSlot(slotIndex) {
    if (slotIndex >= GameState.selectedLetters.length) return;

    const removed = GameState.selectedLetters.splice(slotIndex, 1)[0];

    // Re-enable the bank button
    const bankBtn = document.querySelector(`.bank-letter[data-index="${removed.buttonIndex}"]`);
    if (bankBtn) bankBtn.classList.remove('used');

    // Update all slots
    const slots = document.querySelectorAll('.word-slot');
    slots.forEach((slot, i) => {
        if (i < GameState.selectedLetters.length) {
            slot.textContent = GameState.selectedLetters[i].letter;
            slot.classList.add('filled');
        } else {
            slot.textContent = '';
            slot.classList.remove('filled');
        }
    });

    playSound('click');
}

function clearWordSlots() {
    GameState.selectedLetters = [];

    document.querySelectorAll('.word-slot').forEach(slot => {
        slot.textContent = '';
        slot.classList.remove('filled');
    });

    document.querySelectorAll('.bank-letter').forEach(btn => {
        btn.classList.remove('used');
    });

    playSound('click');
}

function checkWord() {
    const config = DIFFICULTY_CONFIG[GameState.difficulty];
    const builtWord = GameState.selectedLetters.map(s => s.letter).join('');
    const targetWord = GameState.currentWord.word;

    if (builtWord.length !== targetWord.length) {
        showFeedback('word', false, 'השלם את כל האותיות');
        return;
    }

    const isCorrect = builtWord === targetWord;

    if (isCorrect) {
        GameState.correctAnswers++;
        GameState.stars += config.starsPerCorrect;
        GameState.coins += config.coinsPerCorrect;
        showFeedback('word', true);
        playSound('correct');

        // Highlight correct
        document.querySelectorAll('.word-slot').forEach(slot => {
            slot.classList.add('correct');
        });

        setTimeout(() => {
            nextBuildWord();
        }, 1500);
    } else {
        showFeedback('word', false);
        playSound('wrong');

        // Shake the slots
        document.getElementById('word-slots').classList.add('shake');
        setTimeout(() => {
            document.getElementById('word-slots').classList.remove('shake');
        }, 500);
    }
}

// ==========================================
// TRACE LETTER GAME
// ==========================================
let traceCanvas, traceCtx;

function setupTraceCanvas() {
    traceCanvas = document.getElementById('trace-canvas');
    traceCtx = traceCanvas.getContext('2d');

    // Set canvas size
    const container = traceCanvas.parentElement;
    const size = Math.min(container.clientWidth - 40, 300);
    traceCanvas.width = size;
    traceCanvas.height = size;

    // Drawing events
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;

    function startDrawing(e) {
        isDrawing = true;
        const coords = getCoords(e);
        lastX = coords.x;
        lastY = coords.y;
    }

    function draw(e) {
        if (!isDrawing) return;
        e.preventDefault();

        const coords = getCoords(e);

        traceCtx.strokeStyle = '#4a90d9';
        traceCtx.lineWidth = 12;
        traceCtx.lineCap = 'round';
        traceCtx.lineJoin = 'round';

        traceCtx.beginPath();
        traceCtx.moveTo(lastX, lastY);
        traceCtx.lineTo(coords.x, coords.y);
        traceCtx.stroke();

        lastX = coords.x;
        lastY = coords.y;
    }

    function stopDrawing() {
        isDrawing = false;
    }

    function getCoords(e) {
        const rect = traceCanvas.getBoundingClientRect();
        const scaleX = traceCanvas.width / rect.width;
        const scaleY = traceCanvas.height / rect.height;

        if (e.touches) {
            return {
                x: (e.touches[0].clientX - rect.left) * scaleX,
                y: (e.touches[0].clientY - rect.top) * scaleY
            };
        }
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    }

    // Mouse events
    traceCanvas.addEventListener('mousedown', startDrawing);
    traceCanvas.addEventListener('mousemove', draw);
    traceCanvas.addEventListener('mouseup', stopDrawing);
    traceCanvas.addEventListener('mouseout', stopDrawing);

    // Touch events
    traceCanvas.addEventListener('touchstart', startDrawing, { passive: false });
    traceCanvas.addEventListener('touchmove', draw, { passive: false });
    traceCanvas.addEventListener('touchend', stopDrawing);
}

function nextTraceLetter() {
    if (GameState.currentQuestion >= GameState.totalQuestions) {
        showCompleteScreen();
        return;
    }

    GameState.currentQuestion++;
    updateProgress('trace');

    const letterPool = getAvailableLetters();
    const targetLetter = letterPool[Math.floor(Math.random() * letterPool.length)];
    GameState.currentTarget = targetLetter;

    // Display guide letter
    const guideEl = document.getElementById('trace-guide-letter');
    guideEl.textContent = targetLetter.letter;
    guideEl.style.opacity = GameState.traceGuideVisible ? '0.4' : '0';

    // Clear canvas
    clearCanvas();
    clearFeedback('trace');
}

function toggleTraceGuide() {
    GameState.traceGuideVisible = !GameState.traceGuideVisible;
    const guideEl = document.getElementById('trace-guide-letter');
    guideEl.style.opacity = GameState.traceGuideVisible ? '0.4' : '0';

    const btn = document.getElementById('toggle-guide');
    btn.querySelector('span:first-child').textContent = GameState.traceGuideVisible ? '👁️' : '👁️‍🗨️';
}

function clearCanvas() {
    if (traceCtx) {
        traceCtx.clearRect(0, 0, traceCanvas.width, traceCanvas.height);
    }
}

function submitTrace() {
    const config = DIFFICULTY_CONFIG[GameState.difficulty];

    // Calculate "coverage" - how much of the canvas has been drawn on
    const imageData = traceCtx.getImageData(0, 0, traceCanvas.width, traceCanvas.height);
    const pixels = imageData.data;
    let drawnPixels = 0;

    for (let i = 3; i < pixels.length; i += 4) {
        if (pixels[i] > 0) drawnPixels++;
    }

    const coverage = drawnPixels / (traceCanvas.width * traceCanvas.height);

    // Simple scoring: if they drew something (at least 3% coverage), it's a "nice try"
    // For a real app, you'd use more sophisticated recognition
    const minCoverage = 0.03;
    const isGoodAttempt = coverage >= minCoverage;

    if (isGoodAttempt) {
        GameState.correctAnswers++;
        // Give partial or full points based on coverage
        const coverageBonus = Math.min(1, coverage / 0.15); // Max bonus at 15% coverage
        GameState.stars += Math.floor(config.starsPerCorrect * coverageBonus);
        GameState.coins += Math.floor(config.coinsPerCorrect * coverageBonus);

        showFeedback('trace', true, 'יפה מאוד! ✏️');
        playSound('correct');

        setTimeout(() => {
            nextTraceLetter();
        }, 1500);
    } else {
        showFeedback('trace', false, 'נסה לצייר את האות');
        playSound('wrong');
    }
}

// ==========================================
// SOUND MATCH GAME
// ==========================================
function nextSoundMatch() {
    if (GameState.currentQuestion >= GameState.totalQuestions) {
        showCompleteScreen();
        return;
    }

    GameState.currentQuestion++;
    updateProgress('sound');

    const config = DIFFICULTY_CONFIG[GameState.difficulty];
    const letterPool = getAvailableLetters();

    // Pick random target letter
    const targetIndex = Math.floor(Math.random() * letterPool.length);
    const targetLetter = letterPool[targetIndex];
    GameState.currentTarget = targetLetter;

    // Display letter name (audio would go here)
    const nameDisplay = document.getElementById('letter-name-display');
    const hebrewName = nameDisplay.querySelector('.letter-name-hebrew');
    hebrewName.textContent = targetLetter.name;

    // Reset hint button
    const hintBtn = document.getElementById('reveal-hint');
    hintBtn.style.display = config.hintsEnabled ? 'inline-block' : 'none';
    hintBtn.dataset.revealed = 'false';
    hintBtn.textContent = '💡 הצג רמז';

    // Generate options
    const options = [targetLetter];
    const otherLetters = letterPool.filter(l => l.letter !== targetLetter.letter);

    while (options.length < config.optionsCount && otherLetters.length > 0) {
        const randomIndex = Math.floor(Math.random() * otherLetters.length);
        options.push(otherLetters.splice(randomIndex, 1)[0]);
    }

    shuffleArray(options);

    // Render options
    const optionsContainer = document.getElementById('sound-options');
    optionsContainer.innerHTML = '';

    options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'option-btn letter-option';
        btn.textContent = opt.letter;
        btn.addEventListener('click', () => checkSoundMatch(opt.letter, btn));
        optionsContainer.appendChild(btn);
    });

    clearFeedback('sound');
}

function revealLetterHint() {
    const btn = document.getElementById('reveal-hint');
    if (btn.dataset.revealed === 'true') return;

    btn.dataset.revealed = 'true';
    btn.textContent = `רמז: ${GameState.currentTarget.transliteration}`;
}

function checkSoundMatch(selectedLetter, button) {
    const config = DIFFICULTY_CONFIG[GameState.difficulty];
    const isCorrect = selectedLetter === GameState.currentTarget.letter;

    if (isCorrect) {
        button.classList.add('correct');
        GameState.correctAnswers++;
        GameState.stars += config.starsPerCorrect;
        GameState.coins += config.coinsPerCorrect;
        showFeedback('sound', true);
        playSound('correct');

        setTimeout(() => {
            nextSoundMatch();
        }, 1200);
    } else {
        button.classList.add('wrong');
        showFeedback('sound', false);
        playSound('wrong');
        button.disabled = true;
    }
}

// ==========================================
// COMPLETE SCREEN
// ==========================================
function showCompleteScreen() {
    // Update totals
    GameState.totalStars += GameState.stars;
    GameState.totalCoins += GameState.coins;
    saveProgress();
    updateStatsDisplay();

    // Show earned rewards
    document.getElementById('earned-stars').textContent = GameState.stars;
    document.getElementById('earned-coins').textContent = GameState.coins;

    // Calculate accuracy
    const accuracy = Math.round((GameState.correctAnswers / GameState.totalQuestions) * 100);
    document.getElementById('accuracy-text').textContent = `דיוק: ${accuracy}%`;

    showScreen('complete-screen');

    // Trigger celebration
    createConfetti();
    playSound('complete');
}

function createConfetti() {
    const container = document.getElementById('confetti-container');
    container.innerHTML = '';

    const colors = ['#FFD700', '#FF6B6B', '#4ECB71', '#45B7D1', '#FF69B4', '#9B59B6'];

    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti-piece';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDelay = Math.random() * 2 + 's';
        confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
        container.appendChild(confetti);
    }
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================
function getAvailableLetters() {
    const config = DIFFICULTY_CONFIG[GameState.difficulty];
    let pool = config.letterPool;

    if (GameState.activeLetters && GameState.activeLetters.length > 0) {
        pool = pool.filter(l => GameState.activeLetters.includes(l.letter));
    }

    // Fallback if pool is too small
    if (pool.length < 3) {
        pool = HEBREW_LETTERS.filter(l => l.difficulty === 'easy');
    }

    return pool;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function updateProgress(gameType) {
    const progressBar = document.getElementById(`${gameType}-progress`);
    const progressText = document.getElementById(`${gameType}-progress-text`);

    const percent = ((GameState.currentQuestion - 1) / GameState.totalQuestions) * 100;
    progressBar.style.width = percent + '%';
    progressText.textContent = `${GameState.currentQuestion}/${GameState.totalQuestions}`;
}

function showFeedback(gameType, isCorrect, customMessage) {
    const container = document.getElementById(`${gameType}-feedback`);

    let message;
    if (customMessage) {
        message = customMessage;
    } else if (isCorrect) {
        message = ENCOURAGEMENT[Math.floor(Math.random() * ENCOURAGEMENT.length)];
    } else {
        message = TRY_AGAIN[Math.floor(Math.random() * TRY_AGAIN.length)];
    }

    container.textContent = message;
    container.className = `feedback-container ${isCorrect ? 'correct' : 'wrong'}`;
}

function clearFeedback(gameType) {
    const container = document.getElementById(`${gameType}-feedback`);
    container.textContent = '';
    container.className = 'feedback-container';
}

function playSound(type) {
    if (!GameState.soundEnabled) return;

    // Simple audio feedback using Web Audio API or Audio elements
    // For now, using a simple beep pattern
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        switch (type) {
            case 'correct':
                oscillator.frequency.value = 880;
                gainNode.gain.value = 0.1;
                oscillator.start();
                setTimeout(() => {
                    oscillator.frequency.value = 1100;
                    setTimeout(() => oscillator.stop(), 100);
                }, 100);
                break;
            case 'wrong':
                oscillator.frequency.value = 200;
                gainNode.gain.value = 0.1;
                oscillator.start();
                setTimeout(() => oscillator.stop(), 150);
                break;
            case 'click':
                oscillator.frequency.value = 600;
                gainNode.gain.value = 0.05;
                oscillator.start();
                setTimeout(() => oscillator.stop(), 50);
                break;
            case 'complete':
                // Play a happy tune
                oscillator.frequency.value = 523;
                gainNode.gain.value = 0.1;
                oscillator.start();
                setTimeout(() => {
                    oscillator.frequency.value = 659;
                    setTimeout(() => {
                        oscillator.frequency.value = 784;
                        setTimeout(() => oscillator.stop(), 150);
                    }, 150);
                }, 150);
                break;
        }
    } catch (e) {
        // Audio not supported, fail silently
    }
}

// ==========================================
// INIT
// ==========================================
window.onload = init;
