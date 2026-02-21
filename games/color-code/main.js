'use strict';

/* ═══════════════════════════════════════════════════════
   פורץ הקודים — main.js
   Mastermind color-code breaking game for kids.
═══════════════════════════════════════════════════════ */

/* ─── AUDIO — Mobile-Safe Implementation ──────────────
   RULE: Do NOT change this block. Copy it to every game as-is. */

let audioContext = null;
let hebrewVoice  = null;
let audioReady   = false;

function initAudioContext() {
    if (audioContext) return audioContext;
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
        console.warn('AudioContext unavailable:', e);
    }
    return audioContext;
}

function findHebrewVoice() {
    if (!('speechSynthesis' in window)) return null;
    return speechSynthesis.getVoices().find(v => v.lang.startsWith('he')) || null;
}

function waitForVoices() {
    return new Promise((resolve) => {
        if (!('speechSynthesis' in window)) { resolve(); return; }
        const voices = speechSynthesis.getVoices();
        if (voices.length > 0) {
            hebrewVoice = findHebrewVoice();
            resolve();
            return;
        }
        speechSynthesis.onvoiceschanged = () => {
            hebrewVoice = findHebrewVoice();
            resolve();
        };
    });
}

async function unlockAudio() {
    if (audioReady) return;
    initAudioContext();
    if (audioContext && audioContext.state === 'suspended') {
        await audioContext.resume();
    }
    await waitForVoices();
    if ('speechSynthesis' in window) {
        const warmup = new SpeechSynthesisUtterance('.');
        warmup.volume = 0.01;
        warmup.rate   = 2;
        warmup.lang   = 'he-IL';
        speechSynthesis.speak(warmup);
        await new Promise(r => setTimeout(r, 200));
    }
    audioReady = true;
}

function speakText(text) {
    if (!('speechSynthesis' in window)) return;
    speechSynthesis.cancel();
    setTimeout(() => {
        const u = new SpeechSynthesisUtterance(text);
        u.lang  = 'he-IL';
        u.rate  = 0.85;
        u.pitch = 1.1;
        if (hebrewVoice) u.voice = hebrewVoice;
        speechSynthesis.speak(u);
    }, 50);
}

/* ─── TOUCH DEDUPLICATION ──────────────────────────── */
function addBtn(element, handler) {
    if (!element) return;
    let touchHandled = false;
    element.addEventListener('touchstart', (e) => {
        e.preventDefault();
        touchHandled = true;
        handler(e);
    }, { passive: false });
    element.addEventListener('click', (e) => {
        if (touchHandled) { touchHandled = false; return; }
        handler(e);
    });
}

/* ─── GAME STATE ───────────────────────────────────── */
const GameState = {
    difficulty:   'easy',
    uniqueColors: false,
    secret:       [],
    currentGuess: [],
    history:      [],
    attemptsLeft: 0,
    gameOver:     false,
};

/* ─── MUSIC ────────────────────────────────────────── */
let musicOn        = false;
let musicTimeout   = null;
const PENTATONIC   = [261.63, 293.66, 329.63, 392.00, 440.00, 392.00, 329.63, 293.66]; // C4 D4 E4 G4 A4

function playNote(freq, startTime, duration) {
    if (!audioContext) return;
    const osc  = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.connect(gain);
    gain.connect(audioContext.destination);
    osc.frequency.value = freq;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.07, startTime + 0.05);
    gain.gain.linearRampToValueAtTime(0,    startTime + duration - 0.05);
    osc.start(startTime);
    osc.stop(startTime + duration);
}

function scheduleMusicLoop() {
    if (!musicOn || !audioContext) return;
    const noteDur = 0.38;
    const now     = audioContext.currentTime;
    PENTATONIC.forEach((freq, i) => playNote(freq, now + i * noteDur, noteDur));
    const loopDur = PENTATONIC.length * noteDur * 1000;
    musicTimeout = setTimeout(scheduleMusicLoop, loopDur);
}

function startMusic() {
    if (!audioContext) return;
    musicOn = true;
    scheduleMusicLoop();
    document.getElementById('music-btn').textContent = '🎵';
}

function stopMusic() {
    musicOn = false;
    clearTimeout(musicTimeout);
    document.getElementById('music-btn').textContent = '🔇';
}

/* ─── SFX ──────────────────────────────────────────── */
function playTone(freq, duration = 0.12, type = 'sine', vol = 0.15) {
    if (!audioContext) return;
    const osc  = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.connect(gain);
    gain.connect(audioContext.destination);
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = vol;
    osc.start();
    osc.stop(audioContext.currentTime + duration);
}

function playClick()   { playTone(600, 0.06, 'sine', 0.1); }
function playWrong()   { playTone(160, 0.25, 'sawtooth', 0.12); }
function playSuccess() {
    [523, 659, 784, 1046].forEach((f, i) =>
        setTimeout(() => playTone(f, 0.18, 'sine', 0.18), i * 120));
}
function playLose() {
    [400, 320, 240].forEach((f, i) =>
        setTimeout(() => playTone(f, 0.22, 'sawtooth', 0.14), i * 150));
}

/* ─── ALGORITHMS ───────────────────────────────────── */
function shuffleArray(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function generateSecret(config) {
    const available = COLORS.slice(0, config.colorsCount);
    if (GameState.uniqueColors && config.sequenceLength <= available.length) {
        return shuffleArray(available).slice(0, config.sequenceLength).map(c => c.id);
    }
    return Array.from({ length: config.sequenceLength }, () =>
        available[Math.floor(Math.random() * available.length)].id
    );
}

function checkGuess(secret, guess) {
    let stars = 0, flowers = 0;
    const secretLeft = [], guessLeft = [];
    for (let i = 0; i < secret.length; i++) {
        if (guess[i] === secret[i]) { stars++; }
        else { secretLeft.push(secret[i]); guessLeft.push(guess[i]); }
    }
    for (const g of guessLeft) {
        const idx = secretLeft.indexOf(g);
        if (idx !== -1) { flowers++; secretLeft.splice(idx, 1); }
    }
    return { stars, flowers, wrong: secret.length - stars - flowers };
}

function buildFeedbackIcons(stars, flowers, wrong) {
    return '⭐'.repeat(stars) + '🌸'.repeat(flowers) + '❌'.repeat(wrong);
}

function buildFeedbackText(stars, flowers) {
    if (stars === 0 && flowers === 0) return '❌ נסה שוב!';
    const parts = [];
    if (stars > 0)   parts.push(`${stars} ⭐ במקום נכון`);
    if (flowers > 0) parts.push(`${flowers} 🌸 צבע נכון`);
    return parts.join(' · ') + '!';
}

/* ─── SCREEN NAVIGATION ────────────────────────────── */
function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

/* ─── RENDER HELPERS ───────────────────────────────── */
function colorById(id) {
    return COLORS.find(c => c.id === id) || { hex: '#888', name: id };
}

function renderHearts() {
    const config = DIFFICULTY_CONFIG[GameState.difficulty];
    const total  = config.maxAttempts;
    const used   = total - GameState.attemptsLeft;
    document.getElementById('hearts-row').textContent =
        '❤️'.repeat(GameState.attemptsLeft) + '🖤'.repeat(used);
}

function renderGuessSlots() {
    const config = DIFFICULTY_CONFIG[GameState.difficulty];
    const container = document.getElementById('guess-slots');
    container.innerHTML = '';
    for (let i = 0; i < config.sequenceLength; i++) {
        const slot = document.createElement('div');
        slot.className = 'guess-slot';
        const colorId = GameState.currentGuess[i];
        if (colorId) {
            slot.classList.add('filled');
            slot.style.backgroundColor = colorById(colorId).hex;
        }
        const idx = i;
        addBtn(slot, () => {
            if (GameState.gameOver) return;
            if (GameState.currentGuess[idx]) {
                GameState.currentGuess.splice(idx, 1);
                renderGuessSlots();
                playClick();
            }
        });
        container.appendChild(slot);
    }
}

function renderPalette() {
    const config    = DIFFICULTY_CONFIG[GameState.difficulty];
    const container = document.getElementById('palette');
    container.innerHTML = '';
    COLORS.slice(0, config.colorsCount).forEach(color => {
        const swatch = document.createElement('button');
        swatch.className = 'swatch';
        swatch.style.backgroundColor = color.hex;
        swatch.setAttribute('aria-label', color.name);
        addBtn(swatch, () => {
            if (GameState.gameOver) return;
            if (GameState.currentGuess.length < config.sequenceLength) {
                GameState.currentGuess.push(color.id);
                renderGuessSlots();
                playClick();
            }
        });
        container.appendChild(swatch);
    });
}

function renderSecretHidden() {
    const config    = DIFFICULTY_CONFIG[GameState.difficulty];
    const container = document.getElementById('secret-slots');
    container.innerHTML = '';
    for (let i = 0; i < config.sequenceLength; i++) {
        const slot = document.createElement('div');
        slot.className = 'secret-slot';
        slot.textContent = '❓';
        container.appendChild(slot);
    }
}

function revealSecret() {
    const container = document.getElementById('secret-slots');
    container.innerHTML = '';
    GameState.secret.forEach((colorId, i) => {
        const slot = document.createElement('div');
        slot.className = 'secret-slot revealed';
        slot.style.backgroundColor = colorById(colorId).hex;
        slot.style.animationDelay  = `${i * 120}ms`;
        container.appendChild(slot);
    });
}

function addHistoryRow(guess, result, guessNumber) {
    const row = document.createElement('div');
    row.className = 'history-row';

    // Guess number badge
    const numBadge = document.createElement('div');
    numBadge.className = 'guess-number';
    numBadge.textContent = `#${guessNumber}`;

    // Circles
    const circles = document.createElement('div');
    circles.className = 'history-circles';
    guess.forEach(colorId => {
        const c = document.createElement('div');
        c.className = 'history-circle';
        c.style.backgroundColor = colorById(colorId).hex;
        circles.appendChild(c);
    });

    // Feedback
    const feedback = document.createElement('div');
    feedback.className = 'history-feedback';

    const icons = document.createElement('div');
    icons.className = 'feedback-icons';
    icons.textContent = buildFeedbackIcons(result.stars, result.flowers, result.wrong);

    const caption = document.createElement('div');
    caption.className = 'feedback-caption';
    caption.textContent = buildFeedbackText(result.stars, result.flowers);

    feedback.appendChild(icons);
    feedback.appendChild(caption);

    row.appendChild(numBadge);
    row.appendChild(circles);
    row.appendChild(feedback);

    const container = document.getElementById('history-container');
    container.appendChild(row);
    // Scroll so the newest guess is always visible
    row.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/* ─── CONFETTI ─────────────────────────────────────── */
function launchConfetti() {
    const colors = ['#FF6B6B','#2ECC71','#3498DB','#F1C40F','#9B59B6','#FF9F43'];
    for (let i = 0; i < 70; i++) {
        const piece = document.createElement('div');
        piece.className = 'confetti-piece';
        piece.style.left            = `${Math.random() * 100}vw`;
        piece.style.top             = `${Math.random() * -20}vh`;
        piece.style.background      = colors[Math.floor(Math.random() * colors.length)];
        piece.style.animationDuration = `${1.5 + Math.random() * 2}s`;
        piece.style.animationDelay  = `${Math.random() * 0.8}s`;
        document.body.appendChild(piece);
        setTimeout(() => piece.remove(), 4000);
    }
}

/* ─── COMPLETE SCREEN ──────────────────────────────── */
function showComplete(won) {
    revealSecret();

    // Reveal slots on complete screen
    const revealContainer = document.getElementById('reveal-slots');
    revealContainer.innerHTML = '';
    GameState.secret.forEach((colorId, i) => {
        const circle = document.createElement('div');
        circle.className = 'reveal-circle';
        circle.style.backgroundColor = colorById(colorId).hex;
        circle.style.animationDelay  = `${i * 120}ms`;
        revealContainer.appendChild(circle);
    });

    document.getElementById('outcome-badge').textContent   = won ? '🎉' : '💪';
    document.getElementById('complete-title').textContent  = won ? 'ניצחת!' : 'כמעט!';
    document.getElementById('complete-subtitle').textContent = won
        ? 'כל הכבוד! פרצת את הקוד!'
        : `הנסיון הגיע לסוף — אל תתייאש!`;

    showScreen('complete-screen');

    if (won) {
        launchConfetti();
        playSuccess();
        speakText('ניצחת! כל הכבוד! מדהים!');
    } else {
        playLose();
        const names = GameState.secret.map(id => colorById(id).name).join(', ');
        speakText(`לא נורא! הקוד היה: ${names}`);
    }
}

/* ─── SUBMIT GUESS ─────────────────────────────────── */
function submitGuess() {
    const config = DIFFICULTY_CONFIG[GameState.difficulty];
    if (GameState.currentGuess.length < config.sequenceLength) return;
    if (GameState.gameOver) return;

    const guess  = [...GameState.currentGuess];
    const result = checkGuess(GameState.secret, guess);

    GameState.history.push({ guess, result });
    const guessNumber = GameState.history.length;
    GameState.attemptsLeft--;
    GameState.currentGuess = [];

    addHistoryRow(guess, result, guessNumber);
    renderHearts();
    renderGuessSlots();

    const won  = result.stars === config.sequenceLength;
    const lost = !won && GameState.attemptsLeft === 0;

    if (won || lost) {
        GameState.gameOver = true;
        document.getElementById('submit-guess').disabled = true;
        setTimeout(() => showComplete(won), 600);
        return;
    }

    // Feedback speech and SFX
    if (result.stars === 0 && result.flowers === 0) {
        playWrong();
        // Shake the current-guess row
        const cg = document.getElementById('current-guess');
        cg.classList.add('shake');
        cg.addEventListener('animationend', () => cg.classList.remove('shake'), { once: true });
        speakText('לא נכון, נסה שוב!');
    } else {
        playClick();
        const parts = [];
        if (result.stars   > 0) parts.push(`יש לך ${result.stars} במקום הנכון`);
        if (result.flowers > 0) parts.push(`ו-${result.flowers} צבע נכון במקום הלא נכון`);
        speakText(parts.join(', ') + '!');
    }
}

/* ─── START GAME ───────────────────────────────────── */
function startGame() {
    unlockAudio(); // non-blocking; must be inside user gesture

    const config = DIFFICULTY_CONFIG[GameState.difficulty];

    GameState.secret       = generateSecret(config);
    GameState.currentGuess = [];
    GameState.history      = [];
    GameState.attemptsLeft = config.maxAttempts;
    GameState.gameOver     = false;

    document.getElementById('history-container').innerHTML = '';
    document.getElementById('submit-guess').disabled = false;

    renderSecretHidden();
    renderHearts();
    renderGuessSlots();
    renderPalette();

    showScreen('game-screen');

    if (!musicOn) startMusic();
}

/* ─── INIT ─────────────────────────────────────────── */
function init() {
    /* Difficulty buttons */
    document.querySelectorAll('.diff-btn').forEach(btn => {
        addBtn(btn, () => {
            document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            GameState.difficulty = btn.dataset.difficulty;
        });
    });

    /* Unique colors toggle */
    const uniqueToggle = document.getElementById('unique-toggle');
    addBtn(uniqueToggle, () => {
        GameState.uniqueColors = !GameState.uniqueColors;
        uniqueToggle.classList.toggle('active', GameState.uniqueColors);
    });

    /* Start button */
    addBtn(document.getElementById('start-btn'), startGame);

    /* Back to menu from game screen */
    addBtn(document.getElementById('back-to-menu'), () => {
        stopMusic();
        GameState.gameOver = true;
        showScreen('welcome-screen');
    });

    /* Clear guess */
    addBtn(document.getElementById('clear-guess'), () => {
        if (GameState.gameOver) return;
        GameState.currentGuess = [];
        renderGuessSlots();
        playClick();
    });

    /* Submit guess */
    addBtn(document.getElementById('submit-guess'), submitGuess);

    /* Play again */
    addBtn(document.getElementById('play-again-btn'), startGame);

    /* Back to welcome from complete screen */
    addBtn(document.getElementById('back-to-welcome-btn'), () => {
        stopMusic();
        showScreen('welcome-screen');
    });

    /* Music toggle */
    addBtn(document.getElementById('music-btn'), () => {
        initAudioContext();
        if (musicOn) {
            stopMusic();
        } else {
            startMusic();
        }
    });
}

document.addEventListener('DOMContentLoaded', init);
