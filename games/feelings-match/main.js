/**
 * הרגשות שלי — main.js
 *
 * Emotion recognition game for pre-readers aged 5-6.
 * Kids see emoji scenes, hear the situation in Hebrew,
 * and tap the correct emotion face.
 *
 * Mobile rules enforced:
 *   - AudioContext created lazily, resumed inside user gesture
 *   - speak() fires BEFORE any await in unlockAudio (iOS Safari critical)
 *   - Every button has click + touchstart with { passive: false }
 *   - speechSynthesis.cancel() before every speak()
 *   - waitForVoices() handles async voice loading
 */

'use strict';

/* ═══════════════════════════════════════════════════════
   AUDIO — Mobile-Safe Implementation
   CRITICAL: speak() must come BEFORE any await.
   iOS Safari only grants speech permission synchronously
   inside a user gesture. Any await before speak() breaks
   the gesture chain and silences all speech for the session.
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
   CRITICAL: speak() fires synchronously BEFORE any await. */
async function unlockAudio() {
    initAudioContext();

    /* CRITICAL: warmup speak() must come BEFORE any await.
       iOS Safari grants speech permission only when speak() is called
       synchronously inside a user gesture. */
    if (!audioReady && 'speechSynthesis' in window) {
        speechSynthesis.cancel();
        const warmup = new SpeechSynthesisUtterance('.');
        warmup.volume = 0.01;
        warmup.rate = 2;
        warmup.lang = 'he-IL';
        speechSynthesis.speak(warmup);
    }

    /* Now safe to do async work — gesture permission already granted above */
    if (audioContext && audioContext.state === 'suspended') {
        await audioContext.resume();
    }
    if (audioReady) return;
    await waitForVoices();
    await new Promise(r => setTimeout(r, 100));
    audioReady = true;
}

/* RULE: Always cancel before speak(). iOS Safari stacks utterances. */
function speakText(text) {
    if (!('speechSynthesis' in window)) return;
    speechSynthesis.cancel();
    setTimeout(() => {
        const u = new SpeechSynthesisUtterance(text.replace(/[?!.,;:]/g, ''));
        u.lang = 'he-IL';
        u.rate = 0.75;
        if (hebrewVoice) u.voice = hebrewVoice;
        speechSynthesis.speak(u);
    }, 50);
}

/* Play a short chime tone for feedback */
function playTone(freq, duration, vol) {
    if (!audioContext) return;
    if (audioContext.state === 'suspended') {
        audioContext.resume().then(() => playTone(freq, duration, vol)).catch(() => {});
        return;
    }
    try {
        const osc  = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.frequency.value = freq;
        osc.type = 'sine';
        gain.gain.setValueAtTime(vol, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
        osc.start();
        osc.stop(audioContext.currentTime + duration);
    } catch (e) { /* silent fail */ }
}

function playCorrect() {
    playTone(523, 0.12, 0.3);
    setTimeout(() => playTone(659, 0.12, 0.3), 120);
    setTimeout(() => playTone(784, 0.2,  0.3), 240);
}

function playWrong() {
    playTone(300, 0.15, 0.25);
    setTimeout(() => playTone(250, 0.2, 0.25), 150);
}

/* ═══════════════════════════════════════════════════════
   GAME STATE
═══════════════════════════════════════════════════════ */

let difficulty    = 'easy';
let questions     = [];
let currentIndex  = 0;
let score         = 0;
let correctCount  = 0;
let answered      = false;   // guard against double-tap
let seenEmotions  = new Set(); // for the end-screen summary

/* ═══════════════════════════════════════════════════════
   SCREEN NAVIGATION
═══════════════════════════════════════════════════════ */

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

/* ═══════════════════════════════════════════════════════
   GAME LOGIC
═══════════════════════════════════════════════════════ */

function buildQuestions() {
    const config  = GAME_CONFIG[difficulty];
    const pool    = ITEMS.filter(i => i.difficulty === difficulty);
    const shuffled = pool.slice().sort(() => Math.random() - 0.5);
    questions = shuffled.slice(0, config.questionsPerRound);
    seenEmotions.clear();
}

/**
 * Get wrong emotion options from the allowed pool for this difficulty.
 * We pick from the EMOTIONS object, not from ITEMS, so every wrong option
 * is always a valid emotion face — never a repeat of the correct one.
 */
function getWrongEmotions(correctEmotion) {
    const config   = GAME_CONFIG[difficulty];
    const pool     = config.emotions.filter(e => e !== correctEmotion);
    const shuffled = pool.slice().sort(() => Math.random() - 0.5);
    return shuffled.slice(0, config.optionsCount - 1);
}

function showQuestion() {
    if (currentIndex >= questions.length) {
        showComplete();
        return;
    }

    answered = false;
    const config = GAME_CONFIG[difficulty];
    const item   = questions[currentIndex];

    /* Track which emotions the kid practiced */
    seenEmotions.add(item.emotion);

    /* Progress bar */
    const pct = (currentIndex / questions.length) * 100;
    document.getElementById('progress-bar').style.width = pct + '%';
    document.getElementById('progress-text').textContent =
        `שאלה ${currentIndex + 1} מתוך ${questions.length}`;

    /* Scene display */
    const sceneEl = document.getElementById('scene-emoji');
    sceneEl.textContent = item.scene;

    /* Question prompt */
    document.getElementById('question-text').textContent = 'מה הרגש?';

    /* Clear feedback */
    document.getElementById('feedback-text').textContent = '';

    /* Build emotion option buttons */
    const wrongEmotions = getWrongEmotions(item.emotion);
    const allEmotions   = [item.emotion, ...wrongEmotions].sort(() => Math.random() - 0.5);
    const grid          = document.getElementById('options-grid');
    grid.innerHTML      = '';

    /* Set grid column class based on option count */
    grid.className = 'options-grid';
    if (config.optionsCount === 3) grid.classList.add('cols-3');
    if (config.optionsCount === 4) grid.classList.add('cols-4');

    allEmotions.forEach(emotionName => {
        const emotionData = EMOTIONS[emotionName];
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.setAttribute('aria-label', emotionName);

        /* Big emoji face + small Hebrew label — no reading required */
        btn.innerHTML = `
            <span class="option-emoji">${emotionData.emoji}</span>
            <span class="option-label">${emotionName}</span>
        `;

        const isCorrect = (emotionName === item.emotion);

        /* RULE: Both click + touchstart on every option button */
        btn.addEventListener('click', () => onAnswer(isCorrect, item, btn));
        btn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            onAnswer(isCorrect, item, btn);
        }, { passive: false });

        grid.appendChild(btn);
    });

    /* Speak the scene description after a short delay */
    setTimeout(() => speakScene(item), 200);
}

/** Speak the scene description, then the emotion question */
function speakScene(item) {
    speakText(item.description);
}

function onAnswer(isCorrect, item, btn) {
    if (answered) return;
    answered = true;

    /* Disable all buttons immediately to prevent double-tap */
    document.querySelectorAll('.option-btn').forEach(b => { b.disabled = true; });

    if (isCorrect) {
        btn.classList.add('correct');
        playCorrect();
        score += GAME_CONFIG[difficulty].starsPerCorrect;
        correctCount++;
        document.getElementById('score-display').textContent = `⭐ ${score}`;

        const msg = ENCOURAGEMENT[Math.floor(Math.random() * ENCOURAGEMENT.length)];
        document.getElementById('feedback-text').textContent = msg;

        /* Speak the emotion name on correct answer */
        speakText(item.emotion);

        setTimeout(() => {
            currentIndex++;
            showQuestion();
        }, 1000);
    } else {
        btn.classList.add('wrong');
        playWrong();

        const msg = TRY_AGAIN[Math.floor(Math.random() * TRY_AGAIN.length)];
        document.getElementById('feedback-text').textContent = msg;

        /* Highlight the correct answer */
        document.querySelectorAll('.option-btn').forEach(b => {
            if (b.getAttribute('aria-label') === item.emotion) {
                b.classList.add('correct');
            }
        });

        /* Speak the correct emotion so kid learns it */
        setTimeout(() => speakText(item.emotion), 300);

        setTimeout(() => {
            currentIndex++;
            showQuestion();
        }, 1600);
    }
}

function showComplete() {
    const total    = questions.length;
    const accuracy = total > 0 ? Math.round((correctCount / total) * 100) : 0;
    const stars    = accuracy >= 90 ? '⭐⭐⭐' : accuracy >= 60 ? '⭐⭐' : '⭐';

    document.getElementById('final-score').textContent    = score;
    document.getElementById('final-accuracy').textContent = accuracy + '%';
    document.getElementById('final-stars').textContent    = stars;

    /* Show emoji faces of all emotions practiced this round */
    const learnedEl = document.getElementById('learned-emotions');
    learnedEl.innerHTML = '';
    seenEmotions.forEach(emotionName => {
        const span = document.createElement('span');
        span.textContent = EMOTIONS[emotionName] ? EMOTIONS[emotionName].emoji : '';
        span.title = emotionName;
        learnedEl.appendChild(span);
    });

    /* Trophy changes based on performance */
    const trophy = accuracy >= 90 ? '🏆' : accuracy >= 60 ? '🥈' : '🎖️';
    document.getElementById('trophy-emoji').textContent = trophy;

    showScreen('complete-screen');

    /* Celebratory speech */
    setTimeout(() => {
        if (accuracy >= 90) {
            speakText('כל הכבוד! אתה מבין רגשות מצוין!');
        } else {
            speakText('כל הכבוד! שיחקת יפה!');
        }
    }, 600);
}

/* ═══════════════════════════════════════════════════════
   GAME START
═══════════════════════════════════════════════════════ */

function startGame() {
    /* RULE: unlockAudio() must be called here, inside the button handler */
    unlockAudio().then(() => {
        score        = 0;
        correctCount = 0;
        currentIndex = 0;
        answered     = false;
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
        const selectDiff = () => {
            document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            difficulty = btn.dataset.difficulty;
        };
        btn.addEventListener('click', selectDiff);
        btn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            selectDiff();
        }, { passive: false });
    });

    /* Main action buttons */
    addBtn('start-btn',      startGame);
    addBtn('play-again-btn', startGame);
    addBtn('menu-btn',       () => showScreen('welcome-screen'));

    /* Speaker button — replay current scene description */
    addBtn('speaker-btn', () => {
        const item = questions[currentIndex];
        if (item) speakScene(item);
    });
}

/* Run init when DOM is ready */
document.addEventListener('DOMContentLoaded', init);
