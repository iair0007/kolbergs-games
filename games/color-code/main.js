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
// extraColor = true  → extra distractor in palette (toggle OFF, default, harder)
// extraColor = false → palette shows only code colors (toggle ON, easier)
const GameState = {
    difficulty:    'easy',
    extraColor:    true,
    paletteColors: [],
    secret:        [],
    currentGuess:  [],
    history:       [],
    attemptsLeft:  0,
    gameOver:      false,
    revealedHints: [],
};

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

// Build the palette color list for this game round.
// For super: all 6 colors (shuffle order only).
// For others: first `colorsCount` shuffled colors = code colors;
//   if extraColor is on, add one more shuffled color as distractor.
function buildPaletteColors(config) {
    const allShuffled = shuffleArray(COLORS);
    if (config.allowRepeats) {
        return allShuffled; // all 6 for super
    }
    const size = config.colorsCount + (GameState.extraColor ? 1 : 0);
    return allShuffled.slice(0, size);
}

// Generate the secret.
// For super: random picks (with repeats) from all palette colors.
// For others: always unique — shuffle the code-color slice and take all.
//   The code colors are always the FIRST colorsCount entries of paletteColors
//   (the last entry, when present, is the extra distractor and is never in the code).
function generateSecret(paletteColors, config) {
    if (config.allowRepeats) {
        return Array.from({ length: config.sequenceLength }, () =>
            paletteColors[Math.floor(Math.random() * paletteColors.length)].id
        );
    }
    const codePool = shuffleArray(paletteColors.slice(0, config.colorsCount));
    return codePool.slice(0, config.sequenceLength).map(c => c.id);
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
    const used   = config.maxAttempts - GameState.attemptsLeft;
    document.getElementById('hearts-row').textContent =
        '❤️'.repeat(GameState.attemptsLeft) + '🖤'.repeat(used);
}

function renderGuessSlots() {
    const config    = DIFFICULTY_CONFIG[GameState.difficulty];
    const container = document.getElementById('guess-slots');
    container.innerHTML = '';
    for (let i = 0; i < config.sequenceLength; i++) {
        const slot    = document.createElement('div');
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
    GameState.paletteColors.forEach(color => {
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

    const numBadge = document.createElement('div');
    numBadge.className = 'guess-number';
    numBadge.textContent = `#${guessNumber}`;

    const circles = document.createElement('div');
    circles.className = 'history-circles';
    guess.forEach(colorId => {
        const c = document.createElement('div');
        c.className = 'history-circle';
        c.style.backgroundColor = colorById(colorId).hex;
        circles.appendChild(c);
    });

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
    row.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/* ─── HINT SYSTEM ──────────────────────────────────── */
function updateHelpBtn() {
    const config    = DIFFICULTY_CONFIG[GameState.difficulty];
    const remaining = config.maxHints - GameState.revealedHints.length;
    const btn       = document.getElementById('help-btn');
    btn.textContent = `💡 רמז (${remaining})`;
    btn.disabled    = remaining <= 0 || GameState.gameOver;
}

function revealHint() {
    const config = DIFFICULTY_CONFIG[GameState.difficulty];
    if (GameState.revealedHints.length >= config.maxHints || GameState.gameOver) return;

    // Collect unrevealed positions
    const unrevealed = [];
    for (let i = 0; i < config.sequenceLength; i++) {
        if (!GameState.revealedHints.includes(i)) unrevealed.push(i);
    }
    if (unrevealed.length === 0) return;

    const idx = unrevealed[Math.floor(Math.random() * unrevealed.length)];
    GameState.revealedHints.push(idx);

    // Reveal that slot in the secret area
    const slots = document.querySelectorAll('.secret-slot');
    if (slots[idx]) {
        slots[idx].classList.add('revealed');
        slots[idx].style.backgroundColor = colorById(GameState.secret[idx]).hex;
        slots[idx].textContent = '';
    }

    updateHelpBtn();
    playClick();
    speakText(`רמז! מיקום ${idx + 1} הוא ${colorById(GameState.secret[idx]).name}`);
}

/* ─── CONFETTI ─────────────────────────────────────── */
function launchConfetti() {
    const colors = ['#FF6B6B','#2ECC71','#3498DB','#F1C40F','#9B59B6','#FF9F43'];
    for (let i = 0; i < 70; i++) {
        const piece = document.createElement('div');
        piece.className = 'confetti-piece';
        piece.style.left              = `${Math.random() * 100}vw`;
        piece.style.top               = `${Math.random() * -20}vh`;
        piece.style.background        = colors[Math.floor(Math.random() * colors.length)];
        piece.style.animationDuration = `${1.5 + Math.random() * 2}s`;
        piece.style.animationDelay    = `${Math.random() * 0.8}s`;
        document.body.appendChild(piece);
        setTimeout(() => piece.remove(), 4000);
    }
}

/* ─── COMPLETE SCREEN ──────────────────────────────── */
function renderCompleteHistory() {
    const config    = DIFFICULTY_CONFIG[GameState.difficulty];
    const container = document.getElementById('complete-history');
    container.innerHTML = '';

    GameState.history.forEach(({ guess, result }, i) => {
        const row = document.createElement('div');
        row.className = 'complete-row';
        if (result.stars === config.sequenceLength) row.classList.add('winning-row');

        const num = document.createElement('span');
        num.className   = 'guess-number';
        num.textContent = `#${i + 1}`;

        const circles = document.createElement('div');
        circles.className = 'history-circles';
        guess.forEach(colorId => {
            const c = document.createElement('div');
            c.className = 'history-circle';
            c.style.backgroundColor = colorById(colorId).hex;
            circles.appendChild(c);
        });

        const icons = document.createElement('div');
        icons.className = 'feedback-icons';
        icons.textContent = buildFeedbackIcons(result.stars, result.flowers, result.wrong);

        row.appendChild(num);
        row.appendChild(circles);
        row.appendChild(icons);
        container.appendChild(row);
    });
}

function showComplete(won) {
    revealSecret();

    // Populate the code reveal on complete screen
    const revealContainer = document.getElementById('reveal-slots');
    revealContainer.innerHTML = '';
    GameState.secret.forEach((colorId, i) => {
        const circle = document.createElement('div');
        circle.className = 'reveal-circle';
        circle.style.backgroundColor = colorById(colorId).hex;
        circle.style.animationDelay  = `${i * 120}ms`;
        revealContainer.appendChild(circle);
    });

    document.getElementById('outcome-badge').textContent    = won ? '🎉' : '💪';
    document.getElementById('complete-title').textContent   = won ? 'ניצחת!' : 'כמעט!';
    document.getElementById('complete-subtitle').textContent = won
        ? 'כל הכבוד! פרצת את הקוד!'
        : 'הנסיונות הגיעו לסוף — אל תתייאש!';

    renderCompleteHistory();
    showScreen('complete-screen');

    if (won) {
        launchConfetti();
        playSuccess();
        speakText('ניצחת! כל הכבוד! מדהים!');
    } else {
        playLose();
        const names = GameState.secret.map(id => colorById(id).name).join(', ');
        speakText(`לא נורא! הקוד היה ${names}`);
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
        updateHelpBtn();
        setTimeout(() => showComplete(won), 600);
        return;
    }

    // Speech and SFX feedback
    if (result.stars === 0 && result.flowers === 0) {
        playWrong();
        const cg = document.getElementById('current-guess');
        cg.classList.add('shake');
        cg.addEventListener('animationend', () => cg.classList.remove('shake'), { once: true });
        speakText('לא נכון, נסה שוב!');
    } else {
        playClick();
        if (result.stars > 0 && result.flowers > 0) {
            speakText(`יש לך ${result.stars} במקום הנכון, ו${result.flowers} צבע נכון במקום הלא נכון!`);
        } else if (result.stars > 0) {
            speakText(`יש לך ${result.stars} במקום הנכון!`);
        } else {
            speakText(`${result.flowers} צבע נכון אבל במקום הלא נכון!`);
        }
    }
}

/* ─── TOGGLE HELPER ────────────────────────────────── */
function updateToggleUI() {
    const toggle   = document.getElementById('unique-toggle');
    const hint     = document.getElementById('toggle-hint');
    const isSuper  = GameState.difficulty === 'super';
    const easyMode = !GameState.extraColor; // toggle ON = easy mode (no distractor)

    toggle.disabled = isSuper;
    toggle.classList.toggle('toggle-disabled', isSuper);
    // active class = easy mode is ON (no extra distractor)
    toggle.classList.toggle('active', easyMode && !isSuper);

    if (isSuper) {
        hint.textContent = 'מצב סופר: כל 6 הצבעים, חזרות מותרות';
    } else if (easyMode) {
        hint.textContent = 'מצב קל פעיל: רק צבעי הקוד בפלטה';
    } else {
        hint.textContent = 'מצב רגיל: יש צבע מסיח בפלטה';
    }
}

/* ─── START GAME ───────────────────────────────────── */
function startGame() {
    unlockAudio(); // non-blocking; must be inside user gesture

    const config = DIFFICULTY_CONFIG[GameState.difficulty];

    GameState.paletteColors = buildPaletteColors(config);
    GameState.secret        = generateSecret(GameState.paletteColors, config);
    GameState.currentGuess  = [];
    GameState.history       = [];
    GameState.attemptsLeft  = config.maxAttempts;
    GameState.gameOver      = false;
    GameState.revealedHints = [];

    document.getElementById('history-container').innerHTML = '';
    document.getElementById('submit-guess').disabled = false;

    renderSecretHidden();
    renderHearts();
    renderGuessSlots();
    renderPalette();
    updateHelpBtn();

    showScreen('game-screen');
}

/* ─── INIT ─────────────────────────────────────────── */
function init() {
    /* Difficulty buttons */
    document.querySelectorAll('.diff-btn').forEach(btn => {
        addBtn(btn, () => {
            document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            GameState.difficulty = btn.dataset.difficulty;
            updateToggleUI();
        });
    });

    /* Extra-color toggle */
    const uniqueToggle = document.getElementById('unique-toggle');
    addBtn(uniqueToggle, () => {
        if (GameState.difficulty === 'super') return; // disabled for super
        GameState.extraColor = !GameState.extraColor;
        updateToggleUI();
    });

    /* Start button */
    addBtn(document.getElementById('start-btn'), startGame);

    /* Back to menu from game screen */
    addBtn(document.getElementById('back-to-menu'), () => {
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

    /* Help / hint button */
    addBtn(document.getElementById('help-btn'), revealHint);

    /* Play again */
    addBtn(document.getElementById('play-again-btn'), startGame);

    /* Back to welcome from complete screen */
    addBtn(document.getElementById('back-to-welcome-btn'), () => {
        showScreen('welcome-screen');
    });

    /* Set initial toggle UI state */
    updateToggleUI();
}

document.addEventListener('DOMContentLoaded', init);
