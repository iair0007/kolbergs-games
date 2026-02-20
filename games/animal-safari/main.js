/**
 * Animal Safari - Main Game Logic
 */

// ==========================================
// AUDIO CONTEXT
// ==========================================
let audioContext = null;
let audioUnlocked = false;
let speechSynth = window.speechSynthesis;
let hebrewVoice = null;

function findHebrewVoice() {
    if (!speechSynth) return null;
    const voices = speechSynth.getVoices();
    return voices.find(v => v.lang.startsWith('he')) || null;
}

function ensureHebrewVoice() {
    if (hebrewVoice) return;
    hebrewVoice = findHebrewVoice();
    if (!hebrewVoice && speechSynth && speechSynth.onvoiceschanged !== undefined) {
        speechSynth.onvoiceschanged = () => {
            hebrewVoice = findHebrewVoice();
        };
    }
}

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

    // Also try to find Hebrew voice on audio unlock
    ensureHebrewVoice();

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
    mode: 'classic',
    difficulty: 'easy',
    cards: [],
    flippedCards: [],
    matchedPairs: 0,
    moves: 0,
    score: 0,
    timeLeft: 0,
    timerInterval: null,
    startTime: null,
    stars: 3,
    learnedFacts: []
};

// ==========================================
// INITIALIZATION
// ==========================================
function init() {
    setupEventListeners();
    // Start loading voices early so they're ready when needed
    ensureHebrewVoice();
}

function setupEventListeners() {
    // Start game button
    const startBtn = document.getElementById('start-game');
    let touchHandled = false;
    startBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        touchHandled = true;
        handleStartGame();
    }, { passive: false });
    startBtn.addEventListener('click', () => {
        if (touchHandled) { touchHandled = false; return; }
        handleStartGame();
    });

    // Mode selector buttons
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            GameState.mode = btn.dataset.mode;
        });
    });

    // Difficulty selector buttons
    document.querySelectorAll('.difficulty-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            GameState.difficulty = btn.dataset.difficulty;
        });
    });

    // Play again button
    document.getElementById('play-again').addEventListener('click', handleStartGame);

    // Back to menu button (complete screen)
    document.getElementById('back-to-menu').addEventListener('click', () => {
        showScreen('welcome-screen');
        resetGame();
    });

    // Back to menu button (game screen)
    document.getElementById('back-to-game-menu').addEventListener('click', () => {
        if (GameState.timerInterval) {
            clearInterval(GameState.timerInterval);
            GameState.timerInterval = null;
        }
        showScreen('welcome-screen');
        resetGame();
    });
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
function handleStartGame() {
    // Start the game immediately — don't block on async audio unlock.
    // Audio is unlocked as a side effect; Promise boundaries lose the gesture
    // context on iOS which previously caused the button to appear broken.
    startGame();
    unlockAudio(); // non-blocking, runs in background
}

function startGame() {
    resetGame();
    showScreen('game-screen');

    // Get difficulty config
    const config = DIFFICULTY_CONFIG[GameState.difficulty];

    // Setup timer if needed
    if (config.timer) {
        GameState.timeLeft = config.timer;
        document.getElementById('timer-container').style.display = 'flex';
        startTimer();
    } else {
        document.getElementById('timer-container').style.display = 'none';
    }

    // Create card deck
    createCardDeck(config);

    // Start time tracking
    GameState.startTime = Date.now();

    // Update UI
    updateUI();
}

function resetGame() {
    GameState.cards = [];
    GameState.flippedCards = [];
    GameState.matchedPairs = 0;
    GameState.moves = 0;
    GameState.score = 0;
    GameState.stars = 3;
    GameState.learnedFacts = [];

    if (GameState.timerInterval) {
        clearInterval(GameState.timerInterval);
        GameState.timerInterval = null;
    }
}

function createCardDeck(config) {
    const animals = config.animals.slice(0, config.pairs);
    const cardPairs = [...animals, ...animals]; // Duplicate for pairs

    // Shuffle cards
    const shuffled = shuffleArray(cardPairs);

    // Create card elements
    const cardGrid = document.getElementById('card-grid');
    cardGrid.innerHTML = '';
    cardGrid.className = `card-grid ${config.gridClass}`;

    shuffled.forEach((animal, index) => {
        const card = createCardElement(animal, index);
        cardGrid.appendChild(card);
        GameState.cards.push({ animal, element: card, id: index });
    });
}

function createCardElement(animal, index) {
    const card = document.createElement('div');
    card.className = 'animal-card';
    card.dataset.id = index;
    card.dataset.animalId = animal.id;

    // Card back
    const cardBack = document.createElement('div');
    cardBack.className = 'card-face card-back';
    const backIcon = document.createElement('div');
    backIcon.className = 'card-back-icon';
    backIcon.textContent = '🌴';
    cardBack.appendChild(backIcon);

    // Card front
    const cardFront = document.createElement('div');
    cardFront.className = 'card-face card-front';

    if (GameState.mode === 'sound') {
        // Sound mode: show silhouette
        const silhouette = document.createElement('div');
        silhouette.style.fontSize = '4rem';
        silhouette.textContent = '❓';
        cardFront.appendChild(silhouette);
    } else {
        // Classic/Facts mode: show animal image
        const img = document.createElement('img');
        img.className = 'animal-image';
        img.src = animal.image;
        img.alt = animal.name;
        cardFront.appendChild(img);
    }

    // Sound button
    const soundBtn = document.createElement('button');
    soundBtn.className = 'sound-btn';
    soundBtn.textContent = '🔊';
    soundBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        playAnimalSound(animal);
    });
    cardFront.appendChild(soundBtn);

    card.appendChild(cardBack);
    card.appendChild(cardFront);

    // Click handler
    card.addEventListener('click', () => handleCardClick(index));

    return card;
}

function handleCardClick(cardId) {
    const cardData = GameState.cards[cardId];
    const cardElement = cardData.element;

    // Ignore if already flipped or matched
    if (cardElement.classList.contains('flipped') ||
        cardElement.classList.contains('matched')) {
        return;
    }

    // Ignore if two cards already flipped
    if (GameState.flippedCards.length >= 2) {
        return;
    }

    // Flip card
    cardElement.classList.add('flipped');
    GameState.flippedCards.push(cardData);

    // Play flip sound (or animal sound in sound mode)
    if (GameState.mode === 'sound') {
        playAnimalSound(cardData.animal);
    } else {
        playSound('flip');
    }

    // Check for match if two cards flipped
    if (GameState.flippedCards.length === 2) {
        GameState.moves++;
        updateUI();

        setTimeout(() => {
            checkMatch();
        }, 600);
    }
}

function checkMatch() {
    const [card1, card2] = GameState.flippedCards;

    if (card1.animal.id === card2.animal.id) {
        // Match found!
        card1.element.classList.add('matched', 'match');
        card2.element.classList.add('matched', 'match');

        // In Sound Mode, reveal the animal image
        if (GameState.mode === 'sound') {
            [card1, card2].forEach(cardData => {
                const front = cardData.element.querySelector('.card-front');

                // Clear silhouette and show image
                front.innerHTML = '';

                const img = document.createElement('img');
                img.className = 'animal-image';
                img.src = cardData.animal.image;
                img.alt = cardData.animal.name;
                front.appendChild(img);

                // Re-add sound button
                const soundBtn = document.createElement('button');
                soundBtn.className = 'sound-btn';
                soundBtn.textContent = '🔊';
                soundBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    playAnimalSound(cardData.animal);
                });
                front.appendChild(soundBtn);
            });
        }

        GameState.matchedPairs++;
        GameState.score += 100;

        // Play success sound
        playSound('success');

        // Show fact in facts mode
        if (GameState.mode === 'facts') {
            GameState.learnedFacts.push(card1.animal);
        }

        // Check if game complete
        const config = DIFFICULTY_CONFIG[GameState.difficulty];
        if (GameState.matchedPairs === config.pairs) {
            setTimeout(() => {
                completeGame();
            }, 1000);
        }
    } else {
        // No match
        card1.element.classList.add('wrong');
        card2.element.classList.add('wrong');

        // Play wrong sound
        playSound('wrong');

        setTimeout(() => {
            card1.element.classList.remove('flipped', 'wrong');
            card2.element.classList.remove('flipped', 'wrong');
        }, 1000);
    }

    GameState.flippedCards = [];
    updateStars();
}

function completeGame() {
    // Stop timer
    if (GameState.timerInterval) {
        clearInterval(GameState.timerInterval);
    }

    // Calculate time
    const elapsedTime = Math.floor((Date.now() - GameState.startTime) / 1000);
    const minutes = Math.floor(elapsedTime / 60);
    const seconds = elapsedTime % 60;

    // Update complete screen
    document.getElementById('final-moves').textContent = GameState.moves;
    document.getElementById('final-time').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    document.getElementById('final-stars').textContent = '⭐'.repeat(GameState.stars);

    // Show random fact
    const config = DIFFICULTY_CONFIG[GameState.difficulty];
    const randomAnimal = config.animals[Math.floor(Math.random() * config.animals.length)];
    document.getElementById('fact-text').textContent = randomAnimal.fact;

    // Show complete screen
    showScreen('complete-screen');

    // Play celebration sound
    playSound('complete');
}

function updateStars() {
    const thresholds = {
        easy:   { two: 4,  one: 7  },
        medium: { two: 10, one: 18 },
        hard:   { two: 14, one: 24 }
    };
    const t = thresholds[GameState.difficulty];
    if (GameState.moves > t.one) {
        GameState.stars = 1;
    } else if (GameState.moves > t.two) {
        GameState.stars = 2;
    } else {
        GameState.stars = 3;
    }

    document.getElementById('stars').textContent = '⭐'.repeat(GameState.stars);
}

function updateUI() {
    document.getElementById('score').textContent = GameState.score;
    document.getElementById('moves').textContent = GameState.moves;
    updateStars();
}

function startTimer() {
    updateTimerDisplay();

    GameState.timerInterval = setInterval(() => {
        GameState.timeLeft--;
        updateTimerDisplay();

        if (GameState.timeLeft <= 0) {
            clearInterval(GameState.timerInterval);
            // Game over - time's up
            completeGame();
        }
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(GameState.timeLeft / 60);
    const seconds = GameState.timeLeft % 60;
    document.getElementById('timer').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// ==========================================
// AUDIO FUNCTIONS
// ==========================================
function playAnimalSound(animal) {
    const soundConfig = ANIMAL_SOUNDS[animal.sound];

    if (speechSynth && soundConfig) {
        // Cancel any ongoing speech
        speechSynth.cancel();

        // Ensure we have a Hebrew voice loaded
        ensureHebrewVoice();

        const utterance = new SpeechSynthesisUtterance(soundConfig.text);
        utterance.lang = 'he-IL';
        utterance.pitch = soundConfig.pitch;
        utterance.rate = soundConfig.rate;
        utterance.volume = 1.0;

        // Set Hebrew voice if available for correct pronunciation
        if (hebrewVoice) {
            utterance.voice = hebrewVoice;
        }

        // Small delay to ensure cancel() is processed (iOS Safari quirk)
        setTimeout(() => {
            speechSynth.speak(utterance);
        }, 50);
    }
}

function playSound(type) {
    // Simple beep sounds using Web Audio API
    if (!audioContext) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    switch (type) {
        case 'flip':
            oscillator.frequency.value = 400;
            gainNode.gain.value = 0.1;
            break;
        case 'success':
            oscillator.frequency.value = 600;
            gainNode.gain.value = 0.2;
            break;
        case 'wrong':
            oscillator.frequency.value = 200;
            gainNode.gain.value = 0.15;
            break;
        case 'complete':
            oscillator.frequency.value = 800;
            gainNode.gain.value = 0.3;
            break;
    }

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.1);
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// ==========================================
// START
// ==========================================
document.addEventListener('DOMContentLoaded', init);
