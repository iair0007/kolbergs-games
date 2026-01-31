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
    soundEnabled: true,
    activeLetters: null, // null means all letters active
    currentTarget: null,
    currentWord: null,
    selectedLetters: [],
    levelCompletionCount: 0 // Track wins for progression
};

// ==========================================
// INITIALIZATION
// ==========================================
function init() {
    loadProgress();
    setupEventListeners();
    updateStatsDisplay();
    // Skip welcome screen and go directly to mode selection
    showScreen('mode-screen');
}

function loadProgress() {
    const saved = localStorage.getItem('hebrewHeroProgress');
    if (saved) {
        const data = JSON.parse(saved);
        GameState.totalStars = data.totalStars || 0;
        GameState.totalCoins = data.totalCoins || 0;
        // GameState.difficulty = data.difficulty || 'easy'; // Don't auto-load difficulty, let user choose
        GameState.levelCompletionCount = data.levelCompletionCount || 0;
        GameState.soundEnabled = data.soundEnabled !== false;
    }
}

function saveProgress() {
    localStorage.setItem('hebrewHeroProgress', JSON.stringify({
        totalStars: GameState.totalStars,
        totalCoins: GameState.totalCoins,
        levelCompletionCount: GameState.levelCompletionCount,
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
    // Difficulty buttons on mode screen
    document.querySelectorAll('.difficulty-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            GameState.difficulty = btn.dataset.difficulty;
        });
    });

    // Start game button (Welcome -> Mode)
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
    document.getElementById('word-hint-btn')?.addEventListener('click', revealWordHint);

    // Complete screen buttons
    document.getElementById('play-again')?.addEventListener('click', () => {
        startGame(GameState.currentMode);
    });
    document.getElementById('next-level-btn')?.addEventListener('click', () => {
        advanceDifficulty();
        startGame(GameState.currentMode);
    });

    document.getElementById('back-to-menu')?.addEventListener('click', () => {
        showScreen('welcome-screen');
    });

    document.getElementById('back-to-modes')?.addEventListener('click', () => {
        showScreen('mode-screen');
    });

    // Game screen back buttons - go back to mode selection
    document.getElementById('match-back-to-modes')?.addEventListener('click', () => {
        showScreen('mode-screen');
    });
    document.getElementById('word-back-to-modes')?.addEventListener('click', () => {
        showScreen('mode-screen');
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
    // Filter words by difficulty (allow easier words in hard mode too)
    const wordPool = HEBREW_WORDS.filter(w => {
        if (GameState.difficulty === 'hard') return true;
        if (GameState.difficulty === 'medium') return w.difficulty !== 'hard';
        return w.difficulty === 'easy';
    });

    GameState.currentWord = wordPool[Math.floor(Math.random() * wordPool.length)];
    const word = GameState.currentWord;
    GameState.selectedLetters = [];

    // Display hint (emoji only, text hidden)
    document.getElementById('word-emoji').textContent = word.emoji;
    const hintText = document.getElementById('word-hint');
    hintText.textContent = word.hint;
    hintText.classList.remove('hidden'); // Remove the hidden class (display:none) so visibility can work
    hintText.style.visibility = 'hidden'; // Start hidden, can be revealed with button
    document.getElementById('word-hint-btn').style.display = 'inline-flex';

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

    // Create letter bank (Target letters + Distractors)
    let letters = word.word.split('');

    // Add distractors for Medium/Hard
    if (GameState.difficulty !== 'easy') {
        const numDistractors = GameState.difficulty === 'medium' ? 2 : 4;
        const allLetters = HEBREW_LETTERS.map(l => l.letter);
        for (let i = 0; i < numDistractors; i++) {
            const randomLetter = allLetters[Math.floor(Math.random() * allLetters.length)];
            letters.push(randomLetter);
        }
    }

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

// Store timeout reference at module level to clear it if needed
let hintHideTimeout = null;

function revealWordHint() {
    const hintText = document.getElementById('word-hint');
    hintText.style.visibility = 'visible';

    // Clear any existing timeout
    if (hintHideTimeout) {
        clearTimeout(hintHideTimeout);
    }

    // Set auto-hide duration based on difficulty
    const hideDurations = {
        'easy': 10000,   // 10 seconds
        'medium': 5000,  // 5 seconds
        'hard': 2000     // 2 seconds
    };

    const duration = hideDurations[GameState.difficulty] || 5000;

    // Auto-hide after duration
    hintHideTimeout = setTimeout(() => {
        hintText.style.visibility = 'hidden';
    }, duration);
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
// COMPLETE SCREEN & PROGRESSION
// ==========================================
function showCompleteScreen() {
    // Update totals
    GameState.totalStars += GameState.stars;
    GameState.totalCoins += GameState.coins;

    // Check for level progression (simplified: 3 valid rounds of any score to advance)
    // Or stricter: require high accuracy? Let's use simple completion for kids.
    const accuracy = Math.round((GameState.correctAnswers / GameState.totalQuestions) * 100);

    if (accuracy >= 60) { // Require reasonable effort
        GameState.levelCompletionCount++;
    }

    saveProgress();
    updateStatsDisplay();

    // Show earned rewards
    document.getElementById('earned-stars').textContent = GameState.stars;
    document.getElementById('earned-coins').textContent = GameState.coins;
    document.getElementById('accuracy-text').textContent = `דיוק: ${accuracy}%`;

    showScreen('complete-screen');

    // Setup progression button
    const actionBtn = document.getElementById('play-again');
    const nextLevelBtn = document.getElementById('next-level-btn');

    if (GameState.levelCompletionCount >= 3 && GameState.difficulty !== 'hard') {
        actionBtn.style.display = 'none';
        nextLevelBtn.style.display = 'inline-flex';
        nextLevelBtn.querySelector('span:last-child').textContent = 'עבור לשלב הבא! 🚀';
    } else {
        actionBtn.style.display = 'inline-flex';
        nextLevelBtn.style.display = 'none';
        actionBtn.querySelector('span:last-child').textContent = 'המשך לשחק (סיבוב נוסף)';
    }

    // Trigger celebration
    createConfetti();
    playSound('complete');
}

function advanceDifficulty() {
    if (GameState.difficulty === 'easy') GameState.difficulty = 'medium';
    else if (GameState.difficulty === 'medium') GameState.difficulty = 'hard';

    GameState.levelCompletionCount = 0; // Reset counter for new level

    // Update UI toggle
    document.querySelectorAll('.difficulty-btn').forEach(btn => {
        btn.classList.toggle('selected', btn.dataset.difficulty === GameState.difficulty);
    });
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
    // Always include easy letters + some hard/medium based on config
    // Actually simplicity: just filter by difficulty level + lower levels
    if (GameState.difficulty === 'hard') return HEBREW_LETTERS;
    if (GameState.difficulty === 'medium') return HEBREW_LETTERS.filter(l => l.difficulty !== 'hard');
    return HEBREW_LETTERS.filter(l => l.difficulty === 'easy');
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
    } catch (e) { }
}

// ==========================================
// INIT
// ==========================================
window.onload = init;
