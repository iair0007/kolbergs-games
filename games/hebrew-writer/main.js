/**
 * Hebrew Writer - Main Game Logic
 * Uses Web Speech API for Hebrew text-to-speech
 */

// ==========================================
// AUDIO CONTEXT (Shared for mobile compatibility)
// ==========================================
let audioContext = null;
let audioUnlocked = false;
let speechReady = false;
let hebrewVoice = null;

// Initialize AudioContext (must be called from user gesture on mobile)
function initAudioContext() {
    if (audioContext) return audioContext;

    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        console.log('AudioContext created, state:', audioContext.state);
    } catch (e) {
        console.warn('Could not create AudioContext:', e);
    }
    return audioContext;
}

// Track if Hebrew speech is actually available
let hebrewSpeechAvailable = false;

// Find Hebrew voice - only returns a voice if it's actually Hebrew
function findHebrewVoice() {
    if (!('speechSynthesis' in window)) return null;

    const voices = speechSynthesis.getVoices();
    console.log('Available voices:', voices.length);

    // Log all available voices for debugging
    voices.forEach(v => {
        console.log(`Voice: ${v.name}, Lang: ${v.lang}, Local: ${v.localService}`);
    });

    // Try to find a Hebrew voice (must start with 'he')
    let voice = voices.find(v => v.lang.startsWith('he'));

    if (voice) {
        console.log('Hebrew voice found:', voice.name, voice.lang);
        hebrewSpeechAvailable = true;
    } else {
        console.warn('No Hebrew voice available on this device');
        hebrewSpeechAvailable = false;
    }

    return voice;
}

// Wait for voices to be loaded (needed on some mobile browsers)
function waitForVoices() {
    return new Promise((resolve) => {
        if (!('speechSynthesis' in window)) {
            resolve();
            return;
        }

        // Check if voices are already available
        let voices = speechSynthesis.getVoices();
        if (voices.length > 0) {
            hebrewVoice = findHebrewVoice();
            resolve();
            return;
        }

        // Wait for voices to load (Chrome on Android needs this)
        let attempts = 0;
        const checkVoices = () => {
            voices = speechSynthesis.getVoices();
            attempts++;
            if (voices.length > 0) {
                hebrewVoice = findHebrewVoice();
                resolve();
            } else if (attempts < 20) {
                setTimeout(checkVoices, 100);
            } else {
                console.warn('Could not load speech voices');
                resolve();
            }
        };

        // Use the event if available
        if (speechSynthesis.onvoiceschanged !== undefined) {
            speechSynthesis.onvoiceschanged = () => {
                hebrewVoice = findHebrewVoice();
                resolve();
            };
        }

        // Also poll as a fallback
        checkVoices();
    });
}

// Unlock audio for mobile browsers - must be called from user gesture
function unlockAudio() {
    if (audioUnlocked && speechReady) return Promise.resolve();

    // Initialize AudioContext if not already done
    initAudioContext();

    return new Promise((resolve) => {
        const promises = [];

        // Resume AudioContext if suspended (required on iOS/Android)
        if (audioContext && audioContext.state === 'suspended') {
            promises.push(
                audioContext.resume().then(() => {
                    console.log('AudioContext resumed successfully');
                    audioUnlocked = true;
                }).catch((e) => {
                    console.warn('Could not resume AudioContext:', e);
                })
            );
        } else if (audioContext) {
            audioUnlocked = true;
        }

        // Wait for speech voices and unlock speech synthesis
        if ('speechSynthesis' in window) {
            promises.push(
                waitForVoices().then(() => {
                    // Cancel any existing speech
                    speechSynthesis.cancel();

                    // Only do warmup if we have a Hebrew voice
                    if (hebrewVoice && hebrewSpeechAvailable) {
                        // On iOS Safari, we need to speak something short to unlock
                        const warmUp = new SpeechSynthesisUtterance('.');
                        warmUp.volume = 0.01; // Nearly silent but not zero
                        warmUp.rate = 2; // Fast
                        warmUp.lang = 'he-IL';
                        warmUp.voice = hebrewVoice;

                        warmUp.onend = () => {
                            console.log('Speech synthesis unlocked');
                            speechReady = true;
                        };
                        warmUp.onerror = () => {
                            console.warn('Speech warmup error, but continuing');
                            speechReady = true;
                        };

                        speechSynthesis.speak(warmUp);
                    } else {
                        console.log('No Hebrew voice available, skipping speech warmup');
                        speechReady = true; // Mark as ready but speech won't work
                    }
                })
            );
        }

        // Resolve after at most 3s even if voices or audio fail to load
        setTimeout(resolve, 3000);
        Promise.all(promises).then(() => {
            // Give a small delay for speech to initialize
            setTimeout(resolve, 200);
        });
    });
}

// ==========================================
// GAME STATE
// ==========================================
const GameState = {
    difficulty: 'easy',
    currentQuestion: 0,
    totalQuestions: 5,
    correctAnswers: 0,
    points: 0,
    totalPoints: 0,
    wrongAttempts: 0,
    firstTryCorrect: 0,
    currentQuestionHadWrongAttempt: false,
    currentWord: null,
    selectedLetters: [],
    usedWords: [],
    isFirstQuestion: true,
    hintTimeout: null,
    hintInterval: null
};

// ==========================================
// INITIALIZATION
// ==========================================
function init() {
    loadProgress();
    updateStatsDisplay();
    setupEventListeners();
    checkSpeechSupport();
}

function loadProgress() {
    try {
        const saved = localStorage.getItem('hebrewWriterProgress');
        if (saved) {
            const data = JSON.parse(saved);
            GameState.totalPoints = data.totalPoints || 0;
        }
    } catch (e) {
        console.log('Could not load progress');
    }
}

function saveProgress() {
    try {
        localStorage.setItem('hebrewWriterProgress', JSON.stringify({
            totalPoints: GameState.totalPoints
        }));
    } catch (e) {
        console.log('Could not save progress');
    }
}

function updateStatsDisplay() {
    document.getElementById('points-amount').textContent = GameState.totalPoints;
}

function checkSpeechSupport() {
    if (!('speechSynthesis' in window)) {
        console.warn('Web Speech API not supported in this browser');
    }
}

// ==========================================
// TEXT-TO-SPEECH
// ==========================================
function speakWord(word, onEndCallback) {
    if (!('speechSynthesis' in window)) {
        console.warn('Speech not supported');
        if (onEndCallback) onEndCallback();
        return;
    }

    // Only speak if Hebrew voice is available - otherwise don't speak at all
    if (!hebrewSpeechAvailable || !hebrewVoice) {
        console.log('Hebrew speech not available, skipping speech for:', word);
        if (onEndCallback) onEndCallback();
        return;
    }

    // Cancel any ongoing speech
    speechSynthesis.cancel();

    // Small delay to ensure cancel is processed (iOS quirk)
    setTimeout(() => {
        // Clean the word - remove any punctuation that might be read aloud
        const cleanWord = word.replace(/[?!.,;:]/g, '');

        const utterance = new SpeechSynthesisUtterance(cleanWord);
        utterance.lang = 'he-IL';
        utterance.rate = 0.8; // Slightly slower for learning
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        utterance.voice = hebrewVoice;

        // Add visual feedback
        const speakerBtn = document.getElementById('speaker-btn');
        if (speakerBtn) {
            speakerBtn.classList.add('speaking');
            utterance.onend = () => {
                speakerBtn.classList.remove('speaking');
                if (onEndCallback) onEndCallback();
            };
            utterance.onerror = (e) => {
                console.warn('Speech error:', e);
                speakerBtn.classList.remove('speaking');
                if (onEndCallback) onEndCallback();
            };
        }

        console.log('Speaking word:', cleanWord);
        speechSynthesis.speak(utterance);
    }, 50);
}

// Speak general instruction text
function speakInstruction(text) {
    if (!('speechSynthesis' in window)) {
        return;
    }

    // Only speak if Hebrew voice is available
    if (!hebrewSpeechAvailable || !hebrewVoice) {
        console.log('Hebrew speech not available, skipping instruction:', text);
        return;
    }

    speechSynthesis.cancel();

    // Small delay to ensure cancel is processed (iOS quirk)
    setTimeout(() => {
        // Clean the text - remove any punctuation that might be read aloud
        const cleanText = text.replace(/[?!.,;:]/g, '');

        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = 'he-IL';
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        utterance.voice = hebrewVoice;

        console.log('Speaking instruction:', cleanText);
        speechSynthesis.speak(utterance);
    }, 50);
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
    // Difficulty buttons
    document.querySelectorAll('.difficulty-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            GameState.difficulty = btn.dataset.difficulty;
        });
    });

    // Start game button - add both click and touchstart for mobile compatibility
    const startBtn = document.getElementById('start-game');
    startBtn.addEventListener('click', startGame);
    // Touch event for iOS Safari which sometimes needs touch specifically to unlock audio
    startBtn.addEventListener('touchstart', (e) => {
        // Prevent double-firing with click
        e.preventDefault();
        startGame();
    }, { passive: false });

    // Speaker button
    document.getElementById('speaker-btn').addEventListener('click', () => {
        if (GameState.currentWord) {
            speakWord(GameState.currentWord.word);
        }
    });

    // Help button
    document.getElementById('help-btn').addEventListener('click', showWordHint);

    // Back buttons
    document.getElementById('back-to-welcome').addEventListener('click', () => {
        showScreen('welcome-screen');
    });

    // Word builder buttons
    document.getElementById('clear-word').addEventListener('click', clearWordSlots);
    document.getElementById('check-word').addEventListener('click', checkFullWord);

    // Complete screen buttons
    document.getElementById('play-again').addEventListener('click', () => {
        startGame();
    });

    document.getElementById('back-to-menu').addEventListener('click', () => {
        showScreen('welcome-screen');
    });
}

// ==========================================
// HELP BUTTON - SHOW WORD HINT
// ==========================================
function showWordHint() {
    if (!GameState.currentWord) return;

    const containerElement = document.getElementById('word-hint-container');
    const hintElement = document.getElementById('word-hint');
    const timerElement = document.getElementById('hint-timer');

    hintElement.textContent = GameState.currentWord.word;
    containerElement.classList.remove('hidden');

    // Clear any existing timeouts/intervals
    if (GameState.hintTimeout) {
        clearTimeout(GameState.hintTimeout);
    }
    if (GameState.hintInterval) {
        clearInterval(GameState.hintInterval);
    }

    // Duration based on difficulty: easy=10s, medium=3s, hard=2s
    const durations = {
        'easy': 10000,
        'medium': 3000,
        'hard': 2000
    };
    const duration = durations[GameState.difficulty] || 5000;
    let remainingSeconds = Math.ceil(duration / 1000);

    // Show initial timer value
    timerElement.textContent = remainingSeconds;

    // Countdown interval
    GameState.hintInterval = setInterval(() => {
        remainingSeconds--;
        if (remainingSeconds > 0) {
            timerElement.textContent = remainingSeconds;
        }
    }, 1000);

    // Auto-hide after duration
    GameState.hintTimeout = setTimeout(() => {
        containerElement.classList.add('hidden');
        clearInterval(GameState.hintInterval);
        GameState.hintInterval = null;
    }, duration);
}

function hideWordHint() {
    const containerElement = document.getElementById('word-hint-container');
    containerElement.classList.add('hidden');
    if (GameState.hintTimeout) {
        clearTimeout(GameState.hintTimeout);
        GameState.hintTimeout = null;
    }
    if (GameState.hintInterval) {
        clearInterval(GameState.hintInterval);
        GameState.hintInterval = null;
    }
}

// ==========================================
// GAME START
// ==========================================
function startGame() {
    // Unlock audio on user interaction (critical for mobile)
    unlockAudio().then(() => {
        const config = GAME_CONFIG[GameState.difficulty];

        GameState.currentQuestion = 0;
        GameState.totalQuestions = config.questionsPerRound;
        GameState.correctAnswers = 0;
        GameState.points = 0;
        GameState.wrongAttempts = 0;
        GameState.firstTryCorrect = 0;
        GameState.currentQuestionHadWrongAttempt = false;
        GameState.usedWords = [];
        GameState.selectedLetters = [];
        GameState.isFirstQuestion = true;

        showScreen('game-screen');
        updateInstruction();
        nextQuestion();
    });
}

function updateInstruction() {
    const instruction = document.getElementById('instruction');
    switch (GameState.difficulty) {
        case 'easy':
            instruction.textContent = 'באיזו אות מתחילה המילה?';
            break;
        case 'medium':
            instruction.textContent = 'באיזו אות נגמרת המילה?';
            break;
        case 'hard':
            instruction.textContent = 'כתוב את כל המילה!';
            break;
    }
}

// ==========================================
// QUESTION LOGIC
// ==========================================
function nextQuestion() {
    if (GameState.currentQuestion >= GameState.totalQuestions) {
        showCompleteScreen();
        return;
    }

    // Hide any existing hint
    hideWordHint();

    // Get a word we haven't used yet
    const availableWords = WORD_DATA.filter(w =>
        !GameState.usedWords.includes(w.word) &&
        (GameState.difficulty === 'hard' || w.difficulty !== 'hard' || GameState.difficulty === 'medium')
    );

    if (availableWords.length === 0) {
        GameState.usedWords = [];
        return nextQuestion();
    }

    // Pick a random word
    const wordData = availableWords[Math.floor(Math.random() * availableWords.length)];
    GameState.currentWord = wordData;
    GameState.usedWords.push(wordData.word);

    // Update display
    document.getElementById('picture-emoji').textContent = wordData.emoji;
    updateProgress();
    clearFeedback();

    // Reset wrong attempt tracker for this question
    GameState.currentQuestionHadWrongAttempt = false;

    // Setup based on difficulty
    if (GameState.difficulty === 'hard') {
        setupHardMode(wordData);
    } else {
        setupEasyMediumMode(wordData);
    }

    // On first question, speak the instruction first, then the word
    if (GameState.isFirstQuestion) {
        GameState.isFirstQuestion = false;
        const instructionText = document.getElementById('instruction').textContent;

        // Speak instruction, then word - longer delay for mobile to initialize
        setTimeout(() => {
            speakInstruction(instructionText);
            // After instruction ends, speak the word
            setTimeout(() => {
                speakWord(wordData.word);
            }, 3000); // Give time for instruction to finish (longer for mobile)
        }, 1000); // Longer initial delay for mobile speech synthesis
    } else {
        // Auto-speak the word after a short delay
        setTimeout(() => {
            speakWord(wordData.word);
        }, 800);
    }
}

function updateProgress() {
    const progress = ((GameState.currentQuestion) / GameState.totalQuestions) * 100;
    document.getElementById('game-progress').style.width = `${progress}%`;
    document.getElementById('progress-text').textContent =
        `${GameState.currentQuestion + 1}/${GameState.totalQuestions}`;
}

// ==========================================
// EASY/MEDIUM MODE (Letter Selection)
// ==========================================
function setupEasyMediumMode(wordData) {
    const optionsGrid = document.getElementById('options-grid');
    const wordBuilder = document.getElementById('word-builder');

    optionsGrid.classList.remove('hidden');
    optionsGrid.style.display = 'grid';
    wordBuilder.classList.add('hidden');

    // Determine correct answer
    const word = wordData.word;
    const correctLetter = GameState.difficulty === 'easy'
        ? word[0]                    // First letter
        : word[word.length - 1];     // Last letter

    // Generate options
    const config = GAME_CONFIG[GameState.difficulty];
    const options = generateLetterOptions(correctLetter, config.optionsCount);

    // Render options
    optionsGrid.innerHTML = '';
    options.forEach(letter => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = letter;
        btn.addEventListener('click', () => checkLetterAnswer(letter, correctLetter, btn));
        optionsGrid.appendChild(btn);
    });
}

function generateLetterOptions(correctLetter, count) {
    const options = [correctLetter];
    const availableLetters = HEBREW_ALPHABET.filter(l => l !== correctLetter);

    // Shuffle and pick random wrong letters
    shuffleArray(availableLetters);

    while (options.length < count && availableLetters.length > 0) {
        options.push(availableLetters.pop());
    }

    // Shuffle final options
    shuffleArray(options);
    return options;
}

function checkLetterAnswer(selected, correct, button) {
    const isCorrect = selected === correct;

    if (isCorrect) {
        // Mark correct and disable all buttons
        document.querySelectorAll('.option-btn').forEach(btn => {
            btn.disabled = true;
        });
        button.classList.add('correct');
        handleCorrectAnswer();

        // Show the word for 2 seconds, then move to next question
        showCorrectWordDisplay();

    } else {
        // Wrong answer - just mark this button as wrong, let them try again
        button.classList.add('wrong');
        button.disabled = true;
        handleWrongAnswer();
    }
}

// Show the word when answer is correct
function showCorrectWordDisplay() {
    const hintElement = document.getElementById('word-hint');
    hintElement.textContent = GameState.currentWord.word;
    hintElement.classList.remove('hidden');

    // Also speak the word
    speakWord(GameState.currentWord.word);

    // Move to next question after 2 seconds
    setTimeout(() => {
        hintElement.classList.add('hidden');
        GameState.currentQuestion++;
        nextQuestion();
    }, 2000);
}

// ==========================================
// HARD MODE (Full Word Writing)
// ==========================================
function setupHardMode(wordData) {
    const optionsGrid = document.getElementById('options-grid');
    const wordBuilder = document.getElementById('word-builder');

    optionsGrid.style.display = 'none';
    wordBuilder.classList.remove('hidden');

    const word = wordData.word;
    GameState.selectedLetters = [];

    // Create word slots
    const slotsContainer = document.getElementById('word-slots');
    slotsContainer.innerHTML = '';
    for (let i = 0; i < word.length; i++) {
        const slot = document.createElement('div');
        slot.className = 'word-slot';
        slot.dataset.index = i;
        slot.addEventListener('click', () => removeLetterFromSlot(i));
        slotsContainer.appendChild(slot);
    }

    // Create letter bank with shuffled letters from the word + some extras
    const letterBank = document.getElementById('letter-bank');
    letterBank.innerHTML = '';

    const wordLetters = word.split('');
    const extraLetters = getExtraLetters(wordLetters, 4);
    const allLetters = [...wordLetters, ...extraLetters];
    shuffleArray(allLetters);

    allLetters.forEach((letter, index) => {
        const btn = document.createElement('button');
        btn.className = 'bank-letter';
        btn.textContent = letter;
        btn.dataset.index = index;
        btn.addEventListener('click', () => selectBankLetter(letter, btn));
        letterBank.appendChild(btn);
    });
}

function getExtraLetters(wordLetters, count) {
    const extras = [];
    const available = HEBREW_ALPHABET.filter(l => !wordLetters.includes(l));
    shuffleArray(available);

    for (let i = 0; i < count && i < available.length; i++) {
        extras.push(available[i]);
    }
    return extras;
}

function selectBankLetter(letter, button) {
    const slots = document.querySelectorAll('.word-slot');
    const emptySlotIndex = GameState.selectedLetters.length;

    if (emptySlotIndex >= slots.length) return;

    // Add letter to slot (CSS direction:rtl ensures index 0 appears on the right)
    GameState.selectedLetters.push({ letter, buttonIndex: button.dataset.index });
    slots[emptySlotIndex].textContent = letter;
    slots[emptySlotIndex].classList.add('filled');

    // Disable the bank letter
    button.disabled = true;
}

function removeLetterFromSlot(slotIndex) {
    if (slotIndex >= GameState.selectedLetters.length) return;

    const removed = GameState.selectedLetters.splice(slotIndex);
    const slots = document.querySelectorAll('.word-slot');
    const bankLetters = document.querySelectorAll('.bank-letter');

    // Clear slots from clicked position onward
    for (let i = slotIndex; i < slots.length; i++) {
        slots[i].textContent = '';
        slots[i].classList.remove('filled');
        slots[i].style.background = ''; // Reset any color
    }

    // Re-enable removed bank letters
    removed.forEach(item => {
        bankLetters[item.buttonIndex].disabled = false;
    });
}

function clearWordSlots() {
    GameState.selectedLetters = [];

    document.querySelectorAll('.word-slot').forEach(slot => {
        slot.textContent = '';
        slot.classList.remove('filled');
        slot.style.background = ''; // Reset any color
    });

    document.querySelectorAll('.bank-letter').forEach(btn => {
        btn.disabled = false;
    });

    clearFeedback();
}

function checkFullWord() {
    const word = GameState.currentWord.word;
    const enteredWord = GameState.selectedLetters.map(item => item.letter).join('');

    if (enteredWord.length !== word.length) {
        showFeedback('השלם את כל המילה!', false);
        return;
    }

    const isCorrect = enteredWord === word;
    const slots = document.querySelectorAll('.word-slot');

    if (isCorrect) {
        slots.forEach(slot => {
            slot.style.background = 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)';
        });
        handleCorrectAnswer();

        // Show word and speak it, then move to next
        speakWord(word);

        setTimeout(() => {
            // Reset slot colors
            slots.forEach(slot => {
                slot.style.background = '';
            });
            GameState.currentQuestion++;
            nextQuestion();
        }, 2000);

    } else {
        slots.forEach(slot => {
            slot.style.background = 'linear-gradient(135deg, #eb3349 0%, #f45c43 100%)';
        });
        handleWrongAnswer();

        // Allow retry - reset colors after delay but don't move to next question
        setTimeout(() => {
            slots.forEach(slot => {
                slot.style.background = '';
            });
            // Clear the word so they can try again
            clearWordSlots();
        }, 1000);
    }
}

// ==========================================
// ANSWER HANDLING
// ==========================================
function handleCorrectAnswer() {
    GameState.correctAnswers++;

    // +3 points for correct answer
    GameState.points += 3;
    GameState.totalPoints += 3;

    // Track if this was first-try correct (for accuracy)
    if (!GameState.currentQuestionHadWrongAttempt) {
        GameState.firstTryCorrect++;
    }

    saveProgress();
    updateStatsDisplay();

    const message = ENCOURAGEMENT[Math.floor(Math.random() * ENCOURAGEMENT.length)];
    showFeedback(message, true);
    playSound('correct');
}

function handleWrongAnswer() {
    // -1 point for wrong answer (minimum 0)
    GameState.points = Math.max(0, GameState.points - 1);
    GameState.totalPoints = Math.max(0, GameState.totalPoints - 1);
    GameState.wrongAttempts++;
    GameState.currentQuestionHadWrongAttempt = true;

    saveProgress();
    updateStatsDisplay();

    const message = TRY_AGAIN[Math.floor(Math.random() * TRY_AGAIN.length)];
    showFeedback(message, false);
    playSound('wrong');
}

function showFeedback(message, isCorrect) {
    const container = document.getElementById('feedback');
    container.innerHTML = `<div class="feedback ${isCorrect ? 'correct' : 'wrong'}">${message}</div>`;
}

function clearFeedback() {
    document.getElementById('feedback').innerHTML = '';
}

// ==========================================
// COMPLETE SCREEN
// ==========================================
function showCompleteScreen() {
    // Update complete screen with points
    document.getElementById('earned-points').textContent = GameState.points;

    // Accuracy based on first-try correct answers
    const accuracy = Math.round((GameState.firstTryCorrect / GameState.totalQuestions) * 100);
    document.getElementById('accuracy-text').textContent = `דיוק: ${accuracy}%`;

    showScreen('complete-screen');
    createConfetti();
    playSound('complete');
}

function createConfetti() {
    const container = document.getElementById('confetti-container');
    container.innerHTML = '';

    const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#11998e', '#38ef7d', '#f2994a'];

    for (let i = 0; i < 50; i++) {
        const piece = document.createElement('div');
        piece.className = 'confetti-piece';
        piece.style.left = `${Math.random() * 100}%`;
        piece.style.background = colors[Math.floor(Math.random() * colors.length)];
        piece.style.animationDelay = `${Math.random() * 2}s`;
        piece.style.animationDuration = `${2 + Math.random() * 2}s`;
        container.appendChild(piece);
    }
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function playSound(type) {
    // Use the shared audio context (must be unlocked first via user interaction)
    if (!audioContext || !audioUnlocked) {
        console.log('Audio not available or not unlocked yet');
        return;
    }

    try {
        // Resume context if it got suspended (can happen on mobile when tab loses focus)
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }

        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        switch (type) {
            case 'correct':
                oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
                oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
                oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
                gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.4);
                break;
            case 'wrong':
                oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
                gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.3);
                break;
            case 'complete':
                const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
                notes.forEach((freq, i) => {
                    const osc = audioContext.createOscillator();
                    const gain = audioContext.createGain();
                    osc.connect(gain);
                    gain.connect(audioContext.destination);
                    osc.frequency.setValueAtTime(freq, audioContext.currentTime + i * 0.15);
                    gain.gain.setValueAtTime(0.2, audioContext.currentTime + i * 0.15);
                    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.15 + 0.3);
                    osc.start(audioContext.currentTime + i * 0.15);
                    osc.stop(audioContext.currentTime + i * 0.15 + 0.3);
                });
                break;
        }
    } catch (e) {
        console.warn('Could not play sound:', e);
    }
}

// ==========================================
// INIT
// ==========================================
window.onload = init;
