/**
 * GAME_TITLE — main.js
 *
 * Template for Kolberg's Games.
 * All mobile patterns (touch events, audio unlock, viewport) are
 * pre-implemented correctly. Replace GAME_* placeholders and
 * implement the game logic in the marked sections below.
 *
 * Rules this file enforces:
 *   - AudioContext created lazily, resumed inside user gesture
 *   - Every button has click + touchstart with { passive: false }
 *   - speechSynthesis voices waited for via onvoiceschanged
 *   - Warmup utterance fires on first interaction (Safari fix)
 *   - speechSynthesis.cancel() before every speak()
 */

'use strict';

/* ═══════════════════════════════════════════════════════
   AUDIO — Mobile-Safe Implementation
   RULE: Do NOT change this block. Copy it to every game as-is.
═══════════════════════════════════════════════════════ */

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

/* RULE: Must use onvoiceschanged — voices load async on mobile. */
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

/* RULE: unlockAudio() MUST be called inside the start button handler.
   Never call on page load — iOS Safari blocks audio until user gesture. */
async function unlockAudio() {
    if (audioReady) return;
    initAudioContext();
    if (audioContext && audioContext.state === 'suspended') {
        await audioContext.resume();
    }
    await waitForVoices();
    /* RULE: Warmup utterance is required. Safari hangs on the first real
       speech call without it. Volume 0.01 keeps it silent. */
    if ('speechSynthesis' in window) {
        const warmup = new SpeechSynthesisUtterance('.');
        warmup.volume = 0.01;
        warmup.rate = 2;
        warmup.lang = 'he-IL';
        speechSynthesis.speak(warmup);
        await new Promise(r => setTimeout(r, 200));
    }
    audioReady = true;
}

/* RULE: Always cancel before speak(). iOS Safari stacks utterances. */
function speakWord(text) {
    if (!hebrewVoice) return;
    speechSynthesis.cancel();
    setTimeout(() => {
        const u = new SpeechSynthesisUtterance(text.replace(/[?!.,;:]/g, ''));
        u.lang = 'he-IL';
        u.rate = 0.8;
        u.voice = hebrewVoice;
        speechSynthesis.speak(u);
    }, 50);
}

/* ═══════════════════════════════════════════════════════
   GAME STATE
═══════════════════════════════════════════════════════ */

let difficulty   = 'easy';
let questions    = [];
let currentIndex = 0;
let score        = 0;
let correct      = 0;

/* ═══════════════════════════════════════════════════════
   SCREEN NAVIGATION
═══════════════════════════════════════════════════════ */

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

/* ═══════════════════════════════════════════════════════
   GAME LOGIC — Replace everything in this section
═══════════════════════════════════════════════════════ */

function buildQuestions() {
    /* TODO: Replace with real question-building logic.
       Filter ITEMS by difficulty, shuffle, slice to questionsPerRound. */
    const config = GAME_CONFIG[difficulty];
    const pool   = ITEMS.filter(i => i.difficulty === difficulty);
    const shuffled = pool.sort(() => Math.random() - 0.5);
    questions = shuffled.slice(0, config.questionsPerRound);
}

function getWrongOptions(correctItem) {
    /* TODO: Replace with real wrong-option logic for your game. */
    const config = GAME_CONFIG[difficulty];
    const pool = ITEMS.filter(i => i !== correctItem);
    return pool.sort(() => Math.random() - 0.5).slice(0, config.optionsCount - 1);
}

function showQuestion() {
    if (currentIndex >= questions.length) {
        showComplete();
        return;
    }

    const config  = GAME_CONFIG[difficulty];
    const item    = questions[currentIndex];

    /* Update progress */
    const pct = (currentIndex / questions.length) * 100;
    document.getElementById('progress-bar').style.width = pct + '%';
    document.getElementById('progress-text').textContent =
        `שאלה ${currentIndex + 1} מתוך ${questions.length}`;

    /* Update picture / question */
    document.getElementById('picture-emoji').textContent = item.emoji;
    document.getElementById('question-text').textContent = 'TODO: question text';

    /* Clear feedback */
    document.getElementById('feedback-text').textContent = '';

    /* Build options */
    const wrongs  = getWrongOptions(item);
    const options = [item, ...wrongs].sort(() => Math.random() - 0.5);
    const grid    = document.getElementById('options-grid');
    grid.innerHTML = '';

    options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = opt.word; /* TODO: adapt to your game */

        /* RULE: Both click + touchstart on every option button. */
        btn.addEventListener('click', () => onAnswer(opt, item, btn));
        btn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            onAnswer(opt, item, btn);
        }, { passive: false });

        grid.appendChild(btn);
    });

    /* Speak the question word */
    speakWord(item.word);
}

function onAnswer(selected, correct, btn) {
    /* Disable all buttons to prevent double-tap */
    document.querySelectorAll('.option-btn').forEach(b => b.disabled = true);

    const isCorrect = selected === correct;

    if (isCorrect) {
        btn.classList.add('correct');
        score += GAME_CONFIG[difficulty].starsPerCorrect ?? 1;
        correct++;
        document.getElementById('score-display').textContent = `⭐ ${score}`;
        const msg = ENCOURAGEMENT[Math.floor(Math.random() * ENCOURAGEMENT.length)];
        document.getElementById('feedback-text').textContent = msg;
        setTimeout(() => {
            currentIndex++;
            showQuestion();
        }, 900);
    } else {
        btn.classList.add('wrong');
        const msg = TRY_AGAIN[Math.floor(Math.random() * TRY_AGAIN.length)];
        document.getElementById('feedback-text').textContent = msg;
        /* Highlight correct answer */
        document.querySelectorAll('.option-btn').forEach(b => {
            if (b.textContent === correct.word) b.classList.add('correct');
        });
        setTimeout(() => {
            currentIndex++;
            showQuestion();
        }, 1400);
    }
}

function showComplete() {
    const total    = questions.length;
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
    const stars    = accuracy >= 90 ? '⭐⭐⭐' : accuracy >= 60 ? '⭐⭐' : '⭐';

    document.getElementById('final-score').textContent    = score;
    document.getElementById('final-accuracy').textContent = accuracy + '%';
    document.getElementById('final-stars').textContent    = stars;

    showScreen('complete-screen');
}

/* ═══════════════════════════════════════════════════════
   GAME START
═══════════════════════════════════════════════════════ */

function startGame() {
    /* RULE: unlockAudio() must be called here — inside the button handler. */
    unlockAudio().then(() => {
        score        = 0;
        correct      = 0;
        currentIndex = 0;
        document.getElementById('score-display').textContent = '⭐ 0';
        buildQuestions();
        showScreen('game-screen');
        showQuestion();
    });
}

/* ═══════════════════════════════════════════════════════
   EVENT LISTENERS
   RULE: Every button needs click + touchstart.
         touchstart uses { passive: false } + e.preventDefault().
═══════════════════════════════════════════════════════ */

function addBtn(id, handler) {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('click', handler);
    el.addEventListener('touchstart', (e) => {
        e.preventDefault();
        handler();
    }, { passive: false });
}

function init() {
    /* Difficulty buttons */
    document.querySelectorAll('.diff-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            difficulty = btn.dataset.difficulty;
        });
        btn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            difficulty = btn.dataset.difficulty;
        }, { passive: false });
    });

    /* Main action buttons */
    addBtn('start-btn',      startGame);
    addBtn('play-again-btn', startGame);
    addBtn('menu-btn',       () => showScreen('welcome-screen'));
    addBtn('speaker-btn',    () => {
        if (questions[currentIndex]) speakWord(questions[currentIndex].word);
    });
}

/* Run init when DOM is ready */
document.addEventListener('DOMContentLoaded', init);
