/**
 * צבע לפי מספר (Paint by Number) — main.js
 *
 * Kids pick a color from the palette and tap the squares carrying that
 * color's number. A square only accepts the matching number — tapping it
 * with the wrong color politely refuses instead of painting.
 *
 * Pictures come from data.js as vector shapes and are rasterized here onto
 * a grid whose size depends on the difficulty (easy 12×12 … hard 30×30).
 *
 * Mobile rules enforced (see CLAUDE.md):
 *   - AudioContext created lazily, resumed inside a user gesture
 *   - speak() fires BEFORE any await in unlockAudio (iOS Safari critical)
 *   - playTone() retries after resume() instead of silently returning
 *   - Every button has click + touchstart with { passive: false }
 *   - speechSynthesis.cancel() before every speak()
 *   - waitForVoices() handles async voice loading
 */

'use strict';

/* ═══════════════════════════════════════════════════════
   AUDIO — Mobile-Safe Implementation
   CRITICAL: speak() must come BEFORE any await.
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
    const voices = speechSynthesis.getVoices();
    return voices.find(v => v.lang && v.lang.startsWith('he')) || null;
}

/* RULE: voices load async on mobile — must use onvoiceschanged. */
function waitForVoices() {
    return new Promise((resolve) => {
        if (!('speechSynthesis' in window)) { resolve(); return; }
        const voices = speechSynthesis.getVoices();
        if (voices.length > 0) {
            hebrewVoice = findHebrewVoice();
            resolve();
            return;
        }
        let done = false;
        const finish = () => {
            if (done) return;
            done = true;
            hebrewVoice = findHebrewVoice();
            resolve();
        };
        speechSynthesis.onvoiceschanged = finish;
        /* Never hang: Android sometimes never fires onvoiceschanged.
           speak() re-checks for a voice later, so a late load still works. */
        setTimeout(finish, 3000);
    });
}

/* RULE: call ONLY from inside a user-gesture handler. */
async function unlockAudio() {
    initAudioContext();

    /* CRITICAL: speak the warmup BEFORE any await, or iOS Safari
       silences all speech for the rest of the session. */
    if (!audioReady && 'speechSynthesis' in window) {
        speechSynthesis.cancel();
        const warmup = new SpeechSynthesisUtterance('.');
        warmup.volume = 0.01;
        warmup.rate   = 2;
        warmup.lang   = 'he-IL';
        speechSynthesis.speak(warmup);
    }

    if (audioContext && audioContext.state === 'suspended') {
        try { await audioContext.resume(); } catch (e) { /* ignore */ }
    }
    if (audioReady) return;
    await waitForVoices();
    await new Promise(r => setTimeout(r, 100));
    audioReady = true;
}

/* RULE: retry after resume() — never drop the tone. */
function playTone(freq, duration, type = 'sine', vol = 0.18) {
    const ctx = initAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
        ctx.resume().then(() => playTone(freq, duration, type, vol)).catch(() => {});
        return;
    }
    try {
        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(vol, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + duration);
    } catch (e) { /* ignore */ }
}

function playMelody(notes) {
    notes.forEach((n, i) => setTimeout(() => playTone(n, 0.28, 'triangle', 0.16), i * 160));
}

/* RULE: always cancel before speak(). Silent when no Hebrew voice exists. */
function speak(text) {
    if (!('speechSynthesis' in window)) return;
    /* Voices may have arrived after the initial wait — look again.
       No Hebrew voice at all (common on Android) → the game stays silent. */
    if (!hebrewVoice) hebrewVoice = findHebrewVoice();
    if (!hebrewVoice) return;
    speechSynthesis.cancel();
    setTimeout(() => {
        const u = new SpeechSynthesisUtterance(text);
        u.lang  = 'he-IL';
        u.rate  = 0.9;
        u.voice = hebrewVoice;
        speechSynthesis.speak(u);
    }, 50);
}

/* ═══════════════════════════════════════════════════════
   RASTERIZER — vector shapes → numbered grid
═══════════════════════════════════════════════════════ */

function pointInPoly(pts, x, y) {
    let inside = false;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
        const xi = pts[i][0], yi = pts[i][1];
        const xj = pts[j][0], yj = pts[j][1];
        const hit = ((yi > y) !== (yj > y)) &&
                    (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (hit) inside = !inside;
    }
    return inside;
}

function distToSegment(x, y, ax, ay, bx, by) {
    const dx = bx - ax, dy = by - ay;
    const lenSq = dx * dx + dy * dy;
    let t = lenSq === 0 ? 0 : ((x - ax) * dx + (y - ay) * dy) / lenSq;
    t = Math.max(0, Math.min(1, t));
    const px = ax + t * dx, py = ay + t * dy;
    return Math.hypot(x - px, y - py);
}

function pointInShape(s, x, y) {
    switch (s.t) {
        case 'rect':
            return x >= s.x && x <= s.x + s.w && y >= s.y && y <= s.y + s.h;
        case 'circle': {
            const dx = x - s.cx, dy = y - s.cy;
            return dx * dx + dy * dy <= s.r * s.r;
        }
        case 'ellipse': {
            const dx = (x - s.cx) / s.rx, dy = (y - s.cy) / s.ry;
            return dx * dx + dy * dy <= 1;
        }
        case 'poly':
            return pointInPoly(s.pts, x, y);
        case 'line': {
            const half = (s.w || 0.02) / 2;
            for (let i = 0; i < s.pts.length - 1; i++) {
                const a = s.pts[i], b = s.pts[i + 1];
                if (distToSegment(x, y, a[0], a[1], b[0], b[1]) <= half) return true;
            }
            return false;
        }
        default:
            return false;
    }
}

/**
 * Rasterize a picture onto an n×n grid by sampling each cell's center.
 * Returns { n, cells, colors } where:
 *   cells[i]  = color slot index (0-based) or -1 for empty paper
 *   colors[k] = { hex, number, total }   number is what the kid sees (k+1)
 */
function buildGrid(picture, n) {
    const raw = new Int16Array(n * n).fill(-1);

    for (let row = 0; row < n; row++) {
        const y = (row + 0.5) / n;
        for (let col = 0; col < n; col++) {
            const x = (col + 0.5) / n;
            let hit = -1;
            for (let s = 0; s < picture.shapes.length; s++) {
                const shape = picture.shapes[s];
                /* `min` marks fine detail — skip it on grids too coarse to
                   hold it, where it would land as an unreadable blob. */
                if (shape.min && n < shape.min) continue;
                if (pointInShape(shape, x, y)) hit = shape.c;
            }
            raw[row * n + col] = hit;
        }
    }

    /* Keep only palette entries that actually survived at this resolution,
       then renumber them 1..k so the kid never sees a missing number. */
    const counts = new Map();
    for (let i = 0; i < raw.length; i++) {
        if (raw[i] >= 0) counts.set(raw[i], (counts.get(raw[i]) || 0) + 1);
    }
    const usedKeys = [...counts.keys()].sort((a, b) => a - b);
    const slotOf   = new Map();
    const colors   = usedKeys.map((key, idx) => {
        slotOf.set(key, idx);
        return { hex: picture.palette[key], number: idx + 1, total: counts.get(key) };
    });

    const cells = new Int16Array(n * n);
    for (let i = 0; i < raw.length; i++) {
        cells[i] = raw[i] >= 0 ? slotOf.get(raw[i]) : -1;
    }

    return assignGreys({ n, cells, colors });
}

/**
 * Scenes arrive already rasterized — the grid IS the picture, taken from the
 * source image, so there is nothing to resample. Same output shape as
 * buildGrid() so the rest of the game cannot tell the two apart.
 */
const SCENE_CHARS = '0123456789abcdefghijklmnopqrstuvwxyz';

function buildSceneGrid(scene) {
    const n = scene.n;
    const raw = new Int16Array(n * n);
    const counts = new Map();
    for (let row = 0; row < n; row++) {
        const line = scene.rows[row];
        for (let col = 0; col < n; col++) {
            const ch = line[col];
            const slot = ch === '.' ? -1 : SCENE_CHARS.indexOf(ch);
            raw[row * n + col] = slot;
            if (slot >= 0) counts.set(slot, (counts.get(slot) || 0) + 1);
        }
    }
    const usedKeys = [...counts.keys()].sort((a, b) => a - b);
    const slotOf = new Map();
    const colors = usedKeys.map((key, idx) => {
        slotOf.set(key, idx);
        return { hex: scene.palette[key], number: idx + 1, total: counts.get(key) };
    });
    const cells = new Int16Array(n * n);
    for (let i = 0; i < raw.length; i++) cells[i] = raw[i] >= 0 ? slotOf.get(raw[i]) : -1;
    return assignGreys({ n, cells, colors });
}

/* ─── Color helpers ────────────────────────────────── */

function hexToRgb(hex) {
    const h = hex.replace('#', '');
    return {
        r: parseInt(h.slice(0, 2), 16),
        g: parseInt(h.slice(2, 4), 16),
        b: parseInt(h.slice(4, 6), 16)
    };
}

/** The "not painted yet" look — a light grey ghost of the real color. */
function greyOf(hex) {
    const { r, g, b } = hexToRgb(hex);
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    const v   = Math.round(178 + (lum / 255) * 62);   /* 178 … 240 */
    return `rgb(${v}, ${v}, ${v})`;
}

/**
 * Stretch the greys across the whole readable band for THIS picture.
 * A palette drawn from a photo can sit inside a narrow slice of luminance —
 * mapping it absolutely leaves the ghost image flat and unreadable, so the
 * darkest color in the picture anchors one end and the lightest the other.
 */
function assignGreys(g) {
    const lums = g.colors.map(c => {
        const { r, g: gr, b } = hexToRgb(c.hex);
        return 0.299 * r + 0.587 * gr + 0.114 * b;
    });
    const lo = Math.min(...lums), hi = Math.max(...lums);
    const span = Math.max(1, hi - lo);
    g.colors.forEach((c, i) => {
        const t = (lums[i] - lo) / span;
        const v = Math.round(150 + t * 92);           /* 150 … 242 */
        c.grey = `rgb(${v}, ${v}, ${v})`;
    });
    return g;
}

/** Readable text color on top of a filled cell. */
function inkOn(hex) {
    const { r, g, b } = hexToRgb(hex);
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    return lum > 150 ? '#2d2d3a' : '#ffffff';
}

/* ═══════════════════════════════════════════════════════
   GAME STATE
═══════════════════════════════════════════════════════ */

const PAPER = '#fdfdfd';

let difficulty   = 'easy';
let picture      = null;   /* current PICTURES entry */
let grid         = null;   /* { n, cells, colors } */
let painted      = null;   /* Uint8Array — 1 = painted */
let paintedCount = 0;
let totalCells   = 0;
let leftPerColor = [];     /* remaining cells per color slot */
let selectedSlot = 0;
let hintsLeft    = 0;
let startTime    = 0;
let goodTaps     = 0;
let badTaps      = 0;
let finished     = false;

/* view */
let mode      = 'paint';   /* 'paint' | 'pan' */
let scale     = 20;        /* screen px per cell */
let fitScale  = 20;
let offsetX   = 0;
let offsetY   = 0;

/* transient visuals */
let hintCell    = -1;
let hintUntil   = 0;
let wrongCell   = -1;
let wrongUntil  = 0;
let lastWrongAt = 0;

/* canvas */
let canvas = null;
let ctx    = null;
let cssW   = 0;
let cssH   = 0;
let rafId  = 0;

/* ═══════════════════════════════════════════════════════
   SCREENS
═══════════════════════════════════════════════════════ */

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

/* ═══════════════════════════════════════════════════════
   THUMBNAILS (picture chooser, preview, final art)
═══════════════════════════════════════════════════════ */

/** Draw a fully-colored version of a grid into a canvas. */
function drawFullColor(targetCanvas, g) {
    const c2 = targetCanvas.getContext('2d');
    const size = targetCanvas.width;
    const cell = size / g.n;
    c2.fillStyle = PAPER;
    c2.fillRect(0, 0, size, size);
    for (let row = 0; row < g.n; row++) {
        for (let col = 0; col < g.n; col++) {
            const slot = g.cells[row * g.n + col];
            if (slot < 0) continue;
            c2.fillStyle = g.colors[slot].hex;
            const x0 = Math.round(col * cell);
            const y0 = Math.round(row * cell);
            const x1 = Math.round((col + 1) * cell);
            const y1 = Math.round((row + 1) * cell);
            c2.fillRect(x0, y0, x1 - x0, y1 - y0);
        }
    }
}

function buildPictureChooser() {
    const gridEl = document.getElementById('picture-grid');
    const n      = GAME_CONFIG[difficulty].gridSize;
    gridEl.innerHTML = '';

    document.getElementById('select-subtitle').textContent =
        `רמה: ${GAME_CONFIG[difficulty].label} · ${n} × ${n} משבצות`;

    const addCard = (entry, grid, label, badge) => {
        const card = document.createElement('button');
        card.className = 'picture-card';
        card.type = 'button';

        const thumb = document.createElement('canvas');
        thumb.width = 120;
        thumb.height = 120;
        drawFullColor(thumb, grid);
        card.appendChild(thumb);

        const name = document.createElement('span');
        name.className = 'pic-name';
        name.textContent = label;
        card.appendChild(name);

        if (badge) {
            const tag = document.createElement('span');
            tag.className = 'pic-badge';
            tag.textContent = badge;
            card.appendChild(tag);
        }

        /* RULE: click + touchstart on every tappable element. */
        const pick = () => startPicture(entry);
        card.addEventListener('click', pick);
        card.addEventListener('touchstart', (e) => {
            e.preventDefault();
            pick();
        }, { passive: false });

        gridEl.appendChild(card);
    };

    /* קשה leads with the real illustrations — they only work at this size. */
    if (difficulty === 'hard' && typeof SCENES !== 'undefined') {
        SCENES.forEach(scene => {
            addCard(scene, buildSceneGrid(scene), `${scene.emoji} ${scene.name}`,
                    `${scene.n} × ${scene.n}`);
        });
    }
    PICTURES.forEach(pic => {
        addCard(pic, buildGrid(pic, n), `${pic.emoji} ${pic.name}`, null);
    });
}

/* ═══════════════════════════════════════════════════════
   PALETTE
═══════════════════════════════════════════════════════ */

function buildPalette() {
    const el = document.getElementById('palette');
    el.innerHTML = '';

    grid.colors.forEach((color, slot) => {
        const btn = document.createElement('button');
        btn.className = 'color-btn';
        btn.type = 'button';
        btn.style.background = color.hex;
        btn.style.color = inkOn(color.hex);
        btn.dataset.slot = String(slot);
        btn.setAttribute('aria-label', `צבע מספר ${color.number}`);

        const label = document.createElement('span');
        label.className = 'color-num';
        label.textContent = String(color.number);
        btn.appendChild(label);

        const left = document.createElement('span');
        left.className = 'left-count';
        left.textContent = String(leftPerColor[slot]);
        btn.appendChild(left);

        const pick = () => selectColor(slot);
        btn.addEventListener('click', pick);
        btn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            pick();
        }, { passive: false });

        el.appendChild(btn);
    });

    sizePalette();
    updatePalette();
}

/** Shrink the color buttons (never below the 44px touch minimum) so the
    whole palette fits on screen without the kid having to scroll it. */
function sizePalette() {
    const el = document.getElementById('palette');
    const count = grid ? grid.colors.length : 0;
    if (!count) return;

    /* short landscape screens keep the buttons at the touch minimum */
    const cap = window.innerHeight <= 500 ? 46 : 56;

    /* Try progressively tighter gaps until every color fits on one row
       without going under the 44px touch minimum. */
    let gap = 10, size = 44, perRow = count, fits = false;
    for (const g of [10, 8, 6]) {
        gap = g;
        const avail = el.clientWidth - g * 2 - g * (count - 1);
        size = Math.max(44, Math.min(cap, Math.floor(avail / count)));
        if (size * count + g * (count - 1) + g * 2 <= el.clientWidth) { fits = true; break; }
    }

    /* A full 12-color palette will not fit one phone row at a 44px touch
       target — wrap to two rows rather than hiding colors off-screen. */
    el.classList.toggle('two-rows', !fits);
    if (!fits) {
        perRow = Math.ceil(count / 2);
        for (const g of [10, 8, 6]) {
            gap = g;
            const avail = el.clientWidth - g * 2 - g * (perRow - 1);
            size = Math.max(44, Math.min(cap, Math.floor(avail / perRow)));
            if (size * perRow + g * (perRow - 1) + g * 2 <= el.clientWidth) break;
        }
    }

    el.style.gap = gap + 'px';
    el.style.paddingLeft = gap + 'px';
    el.style.paddingRight = gap + 'px';
    el.querySelectorAll('.color-btn').forEach(btn => {
        btn.style.width  = size + 'px';
        btn.style.height = size + 'px';
        btn.style.fontSize = Math.max(0.95, size / 45) + 'rem';
    });
}

function updatePalette() {
    document.querySelectorAll('.color-btn').forEach(btn => {
        const slot = Number(btn.dataset.slot);
        const done = leftPerColor[slot] === 0;
        btn.classList.toggle('selected', slot === selectedSlot && !done);
        btn.classList.toggle('done', done);
        const numEl  = btn.querySelector('.color-num');
        const leftEl = btn.querySelector('.left-count');
        if (numEl)  numEl.textContent  = done ? '✓' : String(grid.colors[slot].number);
        if (leftEl) leftEl.textContent = String(leftPerColor[slot]);
    });
}

/** A 20-color scene palette scrolls — keep the chosen color on screen. */
function scrollPaletteToSelected() {
    const btn = document.querySelector(`.color-btn[data-slot="${selectedSlot}"]`);
    if (!btn) return;
    const el = document.getElementById('palette');
    if (el.scrollWidth <= el.clientWidth) return;
    const target = btn.offsetLeft - (el.clientWidth - btn.offsetWidth) / 2;
    el.scrollTo({ left: target, behavior: 'smooth' });
}

function selectColor(slot) {
    if (leftPerColor[slot] === 0) return;
    selectedSlot = slot;
    hintCell = -1;
    updatePalette();
    scrollPaletteToSelected();
    playTone(520 + slot * 40, 0.09, 'sine', 0.1);
    requestRender();
}

function selectNextUnfinishedColor() {
    for (let i = 1; i <= grid.colors.length; i++) {
        const slot = (selectedSlot + i) % grid.colors.length;
        if (leftPerColor[slot] > 0) {
            selectedSlot = slot;
            updatePalette();
            scrollPaletteToSelected();
            requestRender();
            return true;
        }
    }
    return false;
}

/* ═══════════════════════════════════════════════════════
   VIEW — zoom & pan
═══════════════════════════════════════════════════════ */

function computeFitScale() {
    if (!grid || cssW === 0 || cssH === 0) return 20;
    return Math.min(cssW, cssH) * 0.94 / grid.n;
}

function clampView() {
    const minScale = fitScale * 0.9;
    const maxScale = Math.max(fitScale * 8, 64);
    scale = Math.min(maxScale, Math.max(minScale, scale));

    const gw = grid.n * scale;
    if (gw <= cssW) offsetX = (cssW - gw) / 2;
    else offsetX = Math.min(0, Math.max(cssW - gw, offsetX));

    const gh = grid.n * scale;
    if (gh <= cssH) offsetY = (cssH - gh) / 2;
    else offsetY = Math.min(0, Math.max(cssH - gh, offsetY));
}

function fitView() {
    fitScale = computeFitScale();
    scale    = fitScale;
    clampView();
    requestRender();
}

function zoomAt(factor, anchorX, anchorY) {
    const worldX = (anchorX - offsetX) / scale;
    const worldY = (anchorY - offsetY) / scale;
    scale *= factor;
    offsetX = anchorX - worldX * scale;
    offsetY = anchorY - worldY * scale;
    clampView();
    requestRender();
}

function centerOnCell(index) {
    const col = index % grid.n;
    const row = Math.floor(index / grid.n);
    offsetX = cssW / 2 - (col + 0.5) * scale;
    offsetY = cssH / 2 - (row + 0.5) * scale;
    clampView();
}

/* ═══════════════════════════════════════════════════════
   RENDERING
═══════════════════════════════════════════════════════ */

function resizeCanvas() {
    const wrap = document.getElementById('canvas-wrap');
    const dpr  = Math.min(window.devicePixelRatio || 1, 3);
    const w    = wrap.clientWidth;
    const h    = wrap.clientHeight;
    if (w === 0 || h === 0) return;

    const wasFitted = !grid || Math.abs(scale - fitScale) < 0.5;
    cssW = w;
    cssH = h;
    canvas.width  = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    if (grid) {
        fitScale = computeFitScale();
        if (wasFitted) scale = fitScale;
        clampView();
        sizePalette();
    }
    requestRender();
}

function requestRender() {
    if (rafId) return;
    rafId = requestAnimationFrame(() => {
        rafId = 0;
        render();
    });
}

function render() {
    if (!ctx || !grid) return;

    ctx.fillStyle = PAPER;
    ctx.fillRect(0, 0, cssW, cssH);

    const n         = grid.n;
    const showText  = scale >= 13;
    const showLines = scale >= 5;
    const now       = performance.now();

    const colFrom = Math.max(0, Math.floor(-offsetX / scale));
    const colTo   = Math.min(n - 1, Math.ceil((cssW - offsetX) / scale));
    const rowFrom = Math.max(0, Math.floor(-offsetY / scale));
    const rowTo   = Math.min(n - 1, Math.ceil((cssH - offsetY) / scale));

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `600 ${Math.floor(scale * 0.46)}px Rubik, sans-serif`;
    ctx.lineWidth = 1;

    for (let row = rowFrom; row <= rowTo; row++) {
        for (let col = colFrom; col <= colTo; col++) {
            const idx  = row * n + col;
            const slot = grid.cells[idx];
            if (slot < 0) continue;

            const x0 = Math.round(offsetX + col * scale);
            const y0 = Math.round(offsetY + row * scale);
            const x1 = Math.round(offsetX + (col + 1) * scale);
            const y1 = Math.round(offsetY + (row + 1) * scale);
            const w  = x1 - x0;
            const h  = y1 - y0;

            const color   = grid.colors[slot];
            const isDone  = painted[idx] === 1;
            const isActive = !isDone && slot === selectedSlot;

            ctx.fillStyle = isDone ? color.hex : (color.grey || greyOf(color.hex));
            ctx.fillRect(x0, y0, w, h);

            /* Gentle highlight on the squares that match the chosen color */
            if (isActive) {
                ctx.fillStyle = 'rgba(102, 126, 234, 0.14)';
                ctx.fillRect(x0, y0, w, h);
            }

            if (showLines) {
                ctx.strokeStyle = isDone ? 'rgba(0,0,0,0.06)' : 'rgba(90,90,110,0.28)';
                ctx.strokeRect(x0 + 0.5, y0 + 0.5, w - 1, h - 1);
            }

            if (showText && !isDone) {
                ctx.fillStyle = isActive ? '#2b3a8f' : '#5a5a6e';
                ctx.fillText(String(color.number), x0 + w / 2, y0 + h / 2 + 1);
            }
        }
    }

    /* wrong-tap flash */
    if (wrongCell >= 0 && now < wrongUntil) {
        const col = wrongCell % n, row = Math.floor(wrongCell / n);
        const x0 = offsetX + col * scale, y0 = offsetY + row * scale;
        ctx.strokeStyle = '#f5576c';
        ctx.lineWidth = Math.max(2, scale * 0.14);
        ctx.strokeRect(x0 + 1, y0 + 1, scale - 2, scale - 2);
        ctx.lineWidth = 1;
        requestRender();
    } else if (wrongCell >= 0) {
        wrongCell = -1;
    }

    /* hint pulse */
    if (hintCell >= 0 && now < hintUntil) {
        const col = hintCell % n, row = Math.floor(hintCell / n);
        const cx = offsetX + (col + 0.5) * scale;
        const cy = offsetY + (row + 0.5) * scale;
        const t  = (now % 900) / 900;
        const r  = scale * (0.55 + t * 0.75);
        ctx.strokeStyle = `rgba(56, 239, 125, ${1 - t})`;
        ctx.lineWidth = Math.max(2, scale * 0.12);
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.lineWidth = 1;
        requestRender();
    } else if (hintCell >= 0) {
        hintCell = -1;
        requestRender();
    }
}

/* ═══════════════════════════════════════════════════════
   PAINTING
═══════════════════════════════════════════════════════ */

function cellAt(screenX, screenY) {
    const col = Math.floor((screenX - offsetX) / scale);
    const row = Math.floor((screenY - offsetY) / scale);
    if (col < 0 || row < 0 || col >= grid.n || row >= grid.n) return -1;
    return row * grid.n + col;
}

function flashMessage(elId, text) {
    const el = document.getElementById(elId);
    el.textContent = text;
    el.classList.remove('show');
    void el.offsetWidth;  /* restart the animation */
    el.classList.add('show');
}

/**
 * Try to paint a cell with the currently selected color.
 * A cell only accepts its own number — anything else is refused.
 */
function tryPaint(idx, allowFeedback) {
    if (finished || idx < 0) return;
    const slot = grid.cells[idx];
    if (slot < 0) return;                 /* empty paper */
    if (painted[idx] === 1) return;       /* already done */

    if (slot !== selectedSlot) {
        if (allowFeedback) {
            const now = performance.now();
            if (now - lastWrongAt > 700) {
                lastWrongAt = now;
                badTaps++;
                wrongCell  = idx;
                wrongUntil = now + 600;
                playTone(180, 0.16, 'square', 0.1);
                flashMessage('oops-msg',
                    WRONG_MESSAGES[Math.floor(Math.random() * WRONG_MESSAGES.length)]);
                requestRender();
            }
        }
        return;
    }

    /* Correct number — paint it. */
    painted[idx] = 1;
    paintedCount++;
    goodTaps++;
    leftPerColor[slot]--;
    playTone(660 + Math.min(paintedCount, 12) * 8, 0.07, 'sine', 0.09);
    updateProgress();
    requestRender();

    if (paintedCount === totalCells) {
        finishPicture();
        return;
    }

    if (leftPerColor[slot] === 0) {
        updatePalette();
        flashMessage('praise-msg',
            ENCOURAGEMENT[Math.floor(Math.random() * ENCOURAGEMENT.length)]);
        playMelody([660, 880]);
        selectNextUnfinishedColor();
    } else {
        updatePalette();
    }
}

function updateProgress() {
    const pct = totalCells === 0 ? 0 : Math.round((paintedCount / totalCells) * 100);
    document.getElementById('progress-bar').style.width = pct + '%';
    document.getElementById('progress-text').textContent = pct + '%';

    /* preview thumbnail fills in as the kid paints */
    drawPreview();
}

function drawPreview() {
    const el = document.getElementById('preview-canvas');
    const c2 = el.getContext('2d');
    const size = el.width;
    const cell = size / grid.n;
    c2.fillStyle = PAPER;
    c2.fillRect(0, 0, size, size);
    for (let row = 0; row < grid.n; row++) {
        for (let col = 0; col < grid.n; col++) {
            const idx = row * grid.n + col;
            const slot = grid.cells[idx];
            if (slot < 0) continue;
            c2.fillStyle = painted[idx] ? grid.colors[slot].hex
                                       : (grid.colors[slot].grey || greyOf(grid.colors[slot].hex));
            const x0 = Math.round(col * cell), y0 = Math.round(row * cell);
            const x1 = Math.round((col + 1) * cell), y1 = Math.round((row + 1) * cell);
            c2.fillRect(x0, y0, x1 - x0, y1 - y0);
        }
    }
}

/* ═══════════════════════════════════════════════════════
   POINTER INPUT — tap to paint, drag to paint, pinch to zoom
═══════════════════════════════════════════════════════ */

const pointers = new Map();
let gesture = null;          /* pinch gesture state */
let strokeActive = false;
let panActive = false;
let lastPanX = 0, lastPanY = 0;
let lastStrokeCell = -1;
let strokeStartedAt = 0;

function localPoint(e) {
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
}

function onPointerDown(e) {
    if (!grid || finished) return;
    canvas.setPointerCapture(e.pointerId);
    const p = localPoint(e);
    pointers.set(e.pointerId, p);

    if (pointers.size === 2) {
        /* two fingers — always pan + zoom, whatever the mode */
        strokeActive = false;
        panActive = false;
        startPinch();
        return;
    }
    if (pointers.size > 2) return;

    if (mode === 'paint') {
        strokeActive = true;
        strokeStartedAt = performance.now();
        const idx = cellAt(p.x, p.y);
        lastStrokeCell = idx;
        tryPaint(idx, true);
    } else {
        panActive = true;
        lastPanX = p.x;
        lastPanY = p.y;
    }
}

function startPinch() {
    const pts = [...pointers.values()];
    const midX = (pts[0].x + pts[1].x) / 2;
    const midY = (pts[0].y + pts[1].y) / 2;
    gesture = {
        dist: Math.max(1, Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y)),
        scale,
        worldX: (midX - offsetX) / scale,
        worldY: (midY - offsetY) / scale
    };
}

function onPointerMove(e) {
    if (!pointers.has(e.pointerId)) return;
    const p = localPoint(e);
    pointers.set(e.pointerId, p);

    if (pointers.size >= 2 && gesture) {
        const pts = [...pointers.values()];
        const dist = Math.max(1, Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y));
        const midX = (pts[0].x + pts[1].x) / 2;
        const midY = (pts[0].y + pts[1].y) / 2;
        scale = gesture.scale * (dist / gesture.dist);
        const maxScale = Math.max(fitScale * 8, 64);
        scale = Math.min(maxScale, Math.max(fitScale * 0.9, scale));
        offsetX = midX - gesture.worldX * scale;
        offsetY = midY - gesture.worldY * scale;
        clampView();
        requestRender();
        return;
    }

    if (strokeActive) {
        const idx = cellAt(p.x, p.y);
        if (idx !== lastStrokeCell) {
            lastStrokeCell = idx;
            /* While dragging, wrong squares are skipped quietly — the buzz
               is only for a deliberate tap. */
            tryPaint(idx, false);
        }
        return;
    }

    if (panActive) {
        offsetX += p.x - lastPanX;
        offsetY += p.y - lastPanY;
        lastPanX = p.x;
        lastPanY = p.y;
        clampView();
        requestRender();
    }
}

function onPointerUp(e) {
    pointers.delete(e.pointerId);
    try { canvas.releasePointerCapture(e.pointerId); } catch (err) { /* ignore */ }
    if (pointers.size < 2) gesture = null;
    if (pointers.size === 0) {
        strokeActive = false;
        panActive = false;
        lastStrokeCell = -1;
    }
}

function onWheel(e) {
    if (!grid) return;
    e.preventDefault();
    const p = localPoint(e);
    zoomAt(e.deltaY < 0 ? 1.15 : 1 / 1.15, p.x, p.y);
}

/* ═══════════════════════════════════════════════════════
   TOOLBAR ACTIONS
═══════════════════════════════════════════════════════ */

function toggleMode() {
    mode = mode === 'paint' ? 'pan' : 'paint';
    const btn = document.getElementById('mode-btn');
    btn.textContent = mode === 'paint' ? '🖌️' : '✋';
    btn.classList.toggle('active-mode', mode === 'pan');
    playTone(mode === 'paint' ? 620 : 460, 0.08, 'sine', 0.1);
}

function useHint() {
    if (!grid || finished || hintsLeft <= 0) return;
    if (leftPerColor[selectedSlot] === 0 && !selectNextUnfinishedColor()) return;

    const candidates = [];
    for (let i = 0; i < grid.cells.length; i++) {
        if (grid.cells[i] === selectedSlot && painted[i] === 0) candidates.push(i);
    }
    if (candidates.length === 0) return;

    const idx = candidates[Math.floor(Math.random() * candidates.length)];
    hintsLeft--;
    document.getElementById('hint-count').textContent = String(hintsLeft);
    document.getElementById('hint-btn').disabled = hintsLeft === 0;

    /* Bring it into view if it is off-screen, then pulse a ring on it. */
    const col = idx % grid.n, row = Math.floor(idx / grid.n);
    const sx = offsetX + (col + 0.5) * scale;
    const sy = offsetY + (row + 0.5) * scale;
    if (sx < 0 || sy < 0 || sx > cssW || sy > cssH) centerOnCell(idx);

    hintCell  = idx;
    hintUntil = performance.now() + 2600;
    playTone(880, 0.14, 'triangle', 0.12);
    requestRender();
}

/* ═══════════════════════════════════════════════════════
   START / FINISH
═══════════════════════════════════════════════════════ */

function startPicture(pic) {
    picture      = pic;
    grid         = pic.rows ? buildSceneGrid(pic)
                            : buildGrid(pic, GAME_CONFIG[difficulty].gridSize);
    painted      = new Uint8Array(grid.n * grid.n);
    totalCells   = grid.colors.reduce((sum, c) => sum + c.total, 0);
    leftPerColor = grid.colors.map(c => c.total);
    paintedCount = 0;
    goodTaps     = 0;
    badTaps      = 0;
    selectedSlot = 0;
    finished     = false;
    hintsLeft    = GAME_CONFIG[difficulty].hints;
    startTime    = Date.now();
    mode         = 'paint';

    const modeBtn = document.getElementById('mode-btn');
    modeBtn.textContent = '🖌️';
    modeBtn.classList.remove('active-mode');
    document.getElementById('hint-count').textContent = String(hintsLeft);
    document.getElementById('hint-btn').disabled = false;

    showScreen('game-screen');
    buildPalette();

    /* wait a frame so the canvas wrapper has its final size */
    requestAnimationFrame(() => {
        resizeCanvas();
        fitView();
        updateProgress();
        /* when the squares are too small for their numbers, tell the kid to zoom */
        if (scale < 13) {
            setTimeout(() => flashMessage('praise-msg', 'טיפ: הגדל את התמונה כדי לראות מספרים 🔍'), 500);
        }
    });

    speak(`בוא נצבע ${pic.name}`);
}

function formatTime(ms) {
    const total = Math.floor(ms / 1000);
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
}

function finishPicture() {
    finished = true;
    updatePalette();

    const elapsed  = Date.now() - startTime;
    const accuracy = goodTaps + badTaps === 0 ? 100
                   : Math.round((goodTaps / (goodTaps + badTaps)) * 100);
    const stars = accuracy >= 90 ? '⭐⭐⭐' : accuracy >= 70 ? '⭐⭐' : '⭐';

    document.getElementById('final-cells').textContent = String(totalCells);
    document.getElementById('final-time').textContent  = formatTime(elapsed);
    document.getElementById('final-stars').textContent = stars;
    drawFullColor(document.getElementById('final-canvas'), grid);

    playMelody([523, 659, 784, 1047]);
    setTimeout(() => {
        showScreen('complete-screen');
        speak('כל הכבוד! סיימת את התמונה');
    }, 700);
}

/* ═══════════════════════════════════════════════════════
   EVENT WIRING
   RULE: every button needs click + touchstart { passive: false }.
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

function goToSelect() {
    /* RULE: unlockAudio() runs inside the user gesture, not on page load.
       Fire-and-forget — the screen must switch instantly even if voices
       are still loading (Android can take seconds). */
    unlockAudio().catch(() => {});
    buildPictureChooser();
    showScreen('select-screen');
}

function updateDifficultyHint() {
    const n = GAME_CONFIG[difficulty].gridSize;
    document.getElementById('difficulty-hint').textContent = `${n} × ${n} משבצות`;
}

function init() {
    canvas = document.getElementById('paint-canvas');
    ctx    = canvas.getContext('2d');

    /* difficulty buttons */
    document.querySelectorAll('.diff-btn').forEach(btn => {
        const pick = () => {
            document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            difficulty = btn.dataset.difficulty;
            updateDifficultyHint();
            playTone(500, 0.08, 'sine', 0.1);
        };
        btn.addEventListener('click', pick);
        btn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            pick();
        }, { passive: false });
    });

    addBtn('start-btn',            goToSelect);
    addBtn('back-to-welcome-btn',  () => showScreen('welcome-screen'));
    addBtn('next-picture-btn',     () => { buildPictureChooser(); showScreen('select-screen'); });
    addBtn('menu-btn',             () => showScreen('welcome-screen'));
    addBtn('zoom-in-btn',          () => zoomAt(1.3, cssW / 2, cssH / 2));
    addBtn('zoom-out-btn',         () => zoomAt(1 / 1.3, cssW / 2, cssH / 2));
    addBtn('fit-btn',              fitView);
    addBtn('mode-btn',             toggleMode);
    addBtn('hint-btn',             useHint);

    /* canvas gestures */
    canvas.addEventListener('pointerdown',   onPointerDown);
    canvas.addEventListener('pointermove',   onPointerMove);
    canvas.addEventListener('pointerup',     onPointerUp);
    canvas.addEventListener('pointercancel', onPointerUp);
    canvas.addEventListener('pointerleave',  onPointerUp);
    canvas.addEventListener('wheel',         onWheel, { passive: false });
    canvas.addEventListener('contextmenu',   (e) => e.preventDefault());

    /* keep the canvas in sync with the viewport */
    if ('ResizeObserver' in window) {
        new ResizeObserver(() => resizeCanvas()).observe(document.getElementById('canvas-wrap'));
    }
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('orientationchange', () => setTimeout(resizeCanvas, 250));

    updateDifficultyHint();
}

document.addEventListener('DOMContentLoaded', init);
