/**
 * צבע לפי מספר — data.js
 *
 * Pictures are defined as VECTOR SHAPES in a normalized 0..1 space,
 * not as fixed pixel grids. main.js rasterizes them onto a square grid
 * whose resolution comes from the chosen difficulty, so the very same
 * picture becomes a small easy grid or a big detailed one.
 *
 * Shape types (all coordinates are 0..1, y grows downwards):
 *   { t: 'rect',    x, y, w, h,          c }
 *   { t: 'circle',  cx, cy, r,           c }
 *   { t: 'ellipse', cx, cy, rx, ry,      c }
 *   { t: 'poly',    pts: [[x,y], ...],   c }
 *   { t: 'line',    pts: [[x,y], ...], w, c }   // w = stroke width (0..1)
 *
 * `c` is an index into the picture's `palette`. Shapes are painted in
 * order — later shapes cover earlier ones. A cell touched by no shape
 * stays empty (white paper, not paintable).
 *
 * Any shape may also carry `min: <gridSize>` — fine detail that is skipped
 * on grids smaller than that. A mouth on a face five cells wide lands as a
 * blob that reads like a mustache; `min: 20` keeps it out of easy mode and
 * brings it back once there are cells enough to draw it.
 */

'use strict';

/* ═══════════════════════════════════════════════════════
   DIFFICULTY — harder means more squares
═══════════════════════════════════════════════════════ */

const GAME_CONFIG = {
    easy:   { gridSize: 12, label: 'קל',    hints: 5, emoji: '🟢' },
    medium: { gridSize: 20, label: 'בינוני', hints: 4, emoji: '🟡' },
    hard:   { gridSize: 30, label: 'קשה',   hints: 3, emoji: '🔴' }
};

/* ═══════════════════════════════════════════════════════
   PICTURES
═══════════════════════════════════════════════════════ */

const PICTURES = [
    {
        id: 'cat',
        name: 'חתול',
        emoji: '🐱',
        palette: ['#f5a623', '#ffd7a0', '#ff8fab', '#2d2d3a'],
        shapes: [
            /* ears */
            { t: 'poly', pts: [[0.20, 0.40], [0.28, 0.10], [0.46, 0.28]], c: 0 },
            { t: 'poly', pts: [[0.80, 0.40], [0.72, 0.10], [0.54, 0.28]], c: 0 },
            { t: 'poly', pts: [[0.26, 0.36], [0.30, 0.18], [0.40, 0.30]], c: 2 },
            { t: 'poly', pts: [[0.74, 0.36], [0.70, 0.18], [0.60, 0.30]], c: 2 },
            /* head */
            { t: 'circle', cx: 0.50, cy: 0.56, r: 0.34, c: 0 },
            /* muzzle */
            { t: 'ellipse', cx: 0.50, cy: 0.68, rx: 0.22, ry: 0.14, c: 1 },
            /* eyes */
            { t: 'ellipse', cx: 0.37, cy: 0.50, rx: 0.05, ry: 0.07, c: 3 },
            { t: 'ellipse', cx: 0.63, cy: 0.50, rx: 0.05, ry: 0.07, c: 3 },
            /* nose + mouth */
            { t: 'poly', pts: [[0.44, 0.62], [0.56, 0.62], [0.50, 0.69]], c: 2 },
            { t: 'line', pts: [[0.50, 0.69], [0.50, 0.75]], w: 0.05, c: 3 },
            { t: 'line', pts: [[0.40, 0.80], [0.50, 0.75], [0.60, 0.80]], w: 0.05, c: 3 },
            /* whiskers */
            { t: 'line', pts: [[0.28, 0.66], [0.15, 0.62]], w: 0.045, c: 3 },
            { t: 'line', pts: [[0.72, 0.66], [0.85, 0.62]], w: 0.045, c: 3 },
            { t: 'line', pts: [[0.28, 0.72], [0.15, 0.76]], w: 0.045, c: 3 },
            { t: 'line', pts: [[0.72, 0.72], [0.85, 0.76]], w: 0.045, c: 3 }
        ]
    },
    {
        id: 'butterfly',
        name: 'פרפר',
        emoji: '🦋',
        palette: ['#9b59b6', '#ff6f91', '#ffd93d', '#ffffff', '#5b3a29'],
        shapes: [
            /* antennae */
            { t: 'line', pts: [[0.50, 0.30], [0.38, 0.10]], w: 0.025, c: 4 },
            { t: 'line', pts: [[0.50, 0.30], [0.62, 0.10]], w: 0.025, c: 4 },
            { t: 'circle', cx: 0.37, cy: 0.09, r: 0.035, c: 4 },
            { t: 'circle', cx: 0.63, cy: 0.09, r: 0.035, c: 4 },
            /* upper wings */
            { t: 'ellipse', cx: 0.28, cy: 0.40, rx: 0.24, ry: 0.20, c: 0 },
            { t: 'ellipse', cx: 0.72, cy: 0.40, rx: 0.24, ry: 0.20, c: 0 },
            /* lower wings */
            { t: 'ellipse', cx: 0.31, cy: 0.70, rx: 0.19, ry: 0.17, c: 1 },
            { t: 'ellipse', cx: 0.69, cy: 0.70, rx: 0.19, ry: 0.17, c: 1 },
            /* wing dots */
            { t: 'circle', cx: 0.25, cy: 0.38, r: 0.075, c: 3 },
            { t: 'circle', cx: 0.75, cy: 0.38, r: 0.075, c: 3 },
            { t: 'circle', cx: 0.30, cy: 0.71, r: 0.055, c: 2 },
            { t: 'circle', cx: 0.70, cy: 0.71, r: 0.055, c: 2 },
            /* body */
            { t: 'ellipse', cx: 0.50, cy: 0.55, rx: 0.055, ry: 0.30, c: 4 }
        ]
    },
    {
        id: 'rocket',
        name: 'חללית',
        emoji: '🚀',
        palette: ['#ecf0f1', '#e74c3c', '#3498db', '#f39c12', '#ffd93d'],
        shapes: [
            /* body */
            { t: 'poly', pts: [[0.50, 0.04], [0.68, 0.36], [0.68, 0.74], [0.32, 0.74], [0.32, 0.36]], c: 0 },
            /* nose cone */
            { t: 'poly', pts: [[0.50, 0.04], [0.68, 0.36], [0.32, 0.36]], c: 1 },
            /* fins */
            { t: 'poly', pts: [[0.32, 0.52], [0.12, 0.80], [0.32, 0.76]], c: 1 },
            { t: 'poly', pts: [[0.68, 0.52], [0.88, 0.80], [0.68, 0.76]], c: 1 },
            /* window */
            { t: 'circle', cx: 0.50, cy: 0.47, r: 0.115, c: 2 },
            /* bottom band */
            { t: 'rect', x: 0.32, y: 0.68, w: 0.36, h: 0.07, c: 1 },
            /* flame */
            { t: 'poly', pts: [[0.36, 0.75], [0.64, 0.75], [0.50, 0.99]], c: 3 },
            { t: 'poly', pts: [[0.43, 0.77], [0.57, 0.77], [0.50, 0.92]], c: 4 }
        ]
    },
    {
        id: 'flower',
        name: 'פרח',
        emoji: '🌸',
        palette: ['#ff6f91', '#ff9ff3', '#ffd93d', '#27ae60'],
        shapes: [
            /* stem */
            { t: 'rect', x: 0.45, y: 0.42, w: 0.10, h: 0.55, c: 3 },
            /* leaves */
            { t: 'ellipse', cx: 0.30, cy: 0.66, rx: 0.15, ry: 0.07, c: 3 },
            { t: 'ellipse', cx: 0.70, cy: 0.80, rx: 0.15, ry: 0.07, c: 3 },
            /* petals */
            { t: 'circle', cx: 0.50, cy: 0.10, r: 0.13, c: 0 },
            { t: 'circle', cx: 0.71, cy: 0.20, r: 0.13, c: 1 },
            { t: 'circle', cx: 0.71, cy: 0.42, r: 0.13, c: 0 },
            { t: 'circle', cx: 0.50, cy: 0.52, r: 0.13, c: 1 },
            { t: 'circle', cx: 0.29, cy: 0.42, r: 0.13, c: 0 },
            { t: 'circle', cx: 0.29, cy: 0.20, r: 0.13, c: 1 },
            /* center */
            { t: 'circle', cx: 0.50, cy: 0.31, r: 0.13, c: 2 }
        ]
    },
    {
        id: 'fish',
        name: 'דג',
        emoji: '🐠',
        palette: ['#ff9f43', '#ee5a24', '#ffffff', '#2d2d3a', '#74b9ff'],
        shapes: [
            /* bubbles */
            { t: 'circle', cx: 0.10, cy: 0.16, r: 0.06, c: 4 },
            { t: 'circle', cx: 0.05, cy: 0.32, r: 0.04, c: 4 },
            /* fins */
            { t: 'poly', pts: [[0.36, 0.36], [0.50, 0.14], [0.62, 0.38]], c: 1 },
            { t: 'poly', pts: [[0.36, 0.64], [0.50, 0.86], [0.62, 0.62]], c: 1 },
            /* tail */
            { t: 'poly', pts: [[0.68, 0.50], [0.97, 0.26], [0.97, 0.74]], c: 1 },
            /* body */
            { t: 'ellipse', cx: 0.48, cy: 0.50, rx: 0.32, ry: 0.23, c: 0 },
            /* eye */
            { t: 'circle', cx: 0.29, cy: 0.44, r: 0.075, c: 2 },
            { t: 'circle', cx: 0.29, cy: 0.44, r: 0.04, c: 3 }
        ]
    },
    {
        id: 'house',
        name: 'בית',
        emoji: '🏠',
        palette: ['#e74c3c', '#f7d794', '#8b5a2b', '#74b9ff', '#ffd93d', '#27ae60'],
        shapes: [
            /* sun */
            { t: 'circle', cx: 0.12, cy: 0.11, r: 0.09, c: 4 },
            /* grass */
            { t: 'rect', x: 0.00, y: 0.90, w: 1.00, h: 0.10, c: 5 },
            /* walls */
            { t: 'rect', x: 0.16, y: 0.44, w: 0.68, h: 0.46, c: 1 },
            /* roof */
            { t: 'poly', pts: [[0.50, 0.10], [0.96, 0.45], [0.04, 0.45]], c: 0 },
            /* door */
            { t: 'rect', x: 0.42, y: 0.62, w: 0.18, h: 0.28, c: 2 },
            /* windows */
            { t: 'rect', x: 0.22, y: 0.52, w: 0.15, h: 0.15, c: 3 },
            { t: 'rect', x: 0.64, y: 0.52, w: 0.15, h: 0.15, c: 3 },
            /* chimney */
            { t: 'rect', x: 0.72, y: 0.14, w: 0.09, h: 0.16, c: 2 }
        ]
    },
    {
        id: 'icecream',
        name: 'גלידה',
        emoji: '🍦',
        palette: ['#d4a05a', '#ff8fab', '#7bed9f', '#ffd93d', '#e74c3c'],
        shapes: [
            /* cone */
            { t: 'poly', pts: [[0.28, 0.54], [0.72, 0.54], [0.50, 0.99]], c: 0 },
            /* scoops */
            { t: 'circle', cx: 0.50, cy: 0.50, r: 0.23, c: 1 },
            { t: 'circle', cx: 0.50, cy: 0.31, r: 0.19, c: 2 },
            { t: 'circle', cx: 0.50, cy: 0.16, r: 0.14, c: 3 },
            /* cherry */
            { t: 'circle', cx: 0.50, cy: 0.045, r: 0.055, c: 4 }
        ]
    },
    {
        id: 'car',
        name: 'מכונית',
        emoji: '🚗',
        palette: ['#e74c3c', '#74b9ff', '#2d3436', '#b2bec3', '#ffd93d'],
        shapes: [
            /* cabin */
            { t: 'poly', pts: [[0.28, 0.46], [0.40, 0.22], [0.66, 0.22], [0.76, 0.46]], c: 0 },
            { t: 'poly', pts: [[0.33, 0.44], [0.42, 0.27], [0.62, 0.27], [0.70, 0.44]], c: 1 },
            /* body */
            { t: 'rect', x: 0.06, y: 0.46, w: 0.88, h: 0.22, c: 0 },
            /* headlight */
            { t: 'circle', cx: 0.90, cy: 0.54, r: 0.05, c: 4 },
            /* wheels */
            { t: 'circle', cx: 0.28, cy: 0.72, r: 0.14, c: 2 },
            { t: 'circle', cx: 0.72, cy: 0.72, r: 0.14, c: 2 },
            { t: 'circle', cx: 0.28, cy: 0.72, r: 0.06, c: 3 },
            { t: 'circle', cx: 0.72, cy: 0.72, r: 0.06, c: 3 }
        ]
    },

    /* ── From the workshop scene ──────────────────────── */

    {
        id: 'crystal',
        name: 'גביש קסם',
        emoji: '💎',
        palette: ['#ffffff', '#a8ecff', '#4bc4e8', '#1f74b8', '#c9a2ff'],
        shapes: [
            /* sparkles */
            { t: 'circle', cx: 0.13, cy: 0.17, r: 0.055, c: 4 },
            { t: 'circle', cx: 0.87, cy: 0.19, r: 0.055, c: 4 },
            { t: 'circle', cx: 0.09, cy: 0.62, r: 0.04, c: 4 },
            /* side shards */
            { t: 'poly', pts: [[0.24, 0.34], [0.34, 0.56], [0.34, 0.90], [0.13, 0.90], [0.13, 0.58]], c: 2 },
            { t: 'poly', pts: [[0.78, 0.40], [0.87, 0.62], [0.87, 0.92], [0.66, 0.92], [0.66, 0.62]], c: 3 },
            /* main shard — left facet light, right facet deep */
            { t: 'poly', pts: [[0.50, 0.04], [0.50, 0.94], [0.34, 0.76], [0.34, 0.28]], c: 1 },
            { t: 'poly', pts: [[0.50, 0.04], [0.66, 0.28], [0.66, 0.76], [0.50, 0.94]], c: 2 },
            /* facet edge + highlight */
            { t: 'line', pts: [[0.50, 0.04], [0.50, 0.94]], w: 0.06, c: 3 },
            { t: 'line', pts: [[0.43, 0.28], [0.43, 0.68]], w: 0.09, c: 0 }
        ]
    },
    {
        id: 'dog',
        name: 'כלב',
        emoji: '🐶',
        palette: ['#d8b98f', '#8b6b4a', '#f2e3c9', '#3a2f2a', '#ff6f91'],
        shapes: [
            /* head */
            { t: 'circle', cx: 0.50, cy: 0.40, r: 0.30, c: 0 },
            /* shaggy top fur */
            { t: 'ellipse', cx: 0.50, cy: 0.19, rx: 0.28, ry: 0.13, c: 1 },
            /* floppy ears */
            { t: 'ellipse', cx: 0.17, cy: 0.45, rx: 0.10, ry: 0.22, c: 1 },
            { t: 'ellipse', cx: 0.83, cy: 0.45, rx: 0.10, ry: 0.22, c: 1 },
            /* bandana */
            { t: 'poly', pts: [[0.27, 0.67], [0.73, 0.67], [0.50, 0.94]], c: 4 },
            /* muzzle */
            { t: 'ellipse', cx: 0.50, cy: 0.53, rx: 0.16, ry: 0.12, c: 2 },
            /* nose + eyes */
            { t: 'ellipse', cx: 0.50, cy: 0.46, rx: 0.065, ry: 0.05, c: 3 },
            { t: 'circle', cx: 0.37, cy: 0.33, r: 0.05, c: 3 },
            { t: 'circle', cx: 0.63, cy: 0.33, r: 0.05, c: 3 }
        ]
    },
    {
        id: 'chest',
        name: 'תיבת אוצר',
        emoji: '💰',
        palette: ['#b07a3c', '#6b4423', '#e0a83c', '#3a2f2a', '#d9a05b'],
        shapes: [
            /* body */
            { t: 'rect', x: 0.12, y: 0.44, w: 0.76, h: 0.42, c: 0 },
            /* domed lid */
            { t: 'ellipse', cx: 0.50, cy: 0.42, rx: 0.38, ry: 0.20, c: 4 },
            { t: 'rect', x: 0.12, y: 0.42, w: 0.76, h: 0.10, c: 1 },
            /* gold straps */
            { t: 'rect', x: 0.20, y: 0.24, w: 0.08, h: 0.62, c: 2 },
            { t: 'rect', x: 0.72, y: 0.24, w: 0.08, h: 0.62, c: 2 },
            /* lock plate + keyhole */
            { t: 'rect', x: 0.43, y: 0.50, w: 0.14, h: 0.18, c: 2 },
            { t: 'circle', cx: 0.50, cy: 0.57, r: 0.055, c: 3 },
            /* feet */
            { t: 'rect', x: 0.12, y: 0.86, w: 0.14, h: 0.08, c: 1 },
            { t: 'rect', x: 0.74, y: 0.86, w: 0.14, h: 0.08, c: 1 }
        ]
    },
    {
        id: 'explorer',
        name: 'הרפתקן',
        emoji: '🧒',
        palette: ['#f3d0ad', '#6b4423', '#2d2d3a', '#3b6ea8', '#f7f1e3'],
        shapes: [
            /* coat */
            { t: 'poly', pts: [[0.10, 1.00], [0.18, 0.72], [0.82, 0.72], [0.90, 1.00]], c: 3 },
            /* neck */
            { t: 'rect', x: 0.43, y: 0.64, w: 0.14, h: 0.10, c: 0 },
            /* collar */
            { t: 'poly', pts: [[0.38, 0.72], [0.62, 0.72], [0.50, 0.90]], c: 4 },
            /* head */
            { t: 'ellipse', cx: 0.50, cy: 0.44, rx: 0.23, ry: 0.25, c: 0 },
            /* hair — cap plus sideburns */
            { t: 'ellipse', cx: 0.50, cy: 0.22, rx: 0.25, ry: 0.12, c: 1 },
            { t: 'rect', x: 0.25, y: 0.24, w: 0.07, h: 0.16, c: 1 },
            { t: 'rect', x: 0.68, y: 0.24, w: 0.07, h: 0.16, c: 1 },
            /* eyes + smile */
            { t: 'ellipse', cx: 0.40, cy: 0.45, rx: 0.045, ry: 0.055, c: 2 },
            { t: 'ellipse', cx: 0.60, cy: 0.45, rx: 0.045, ry: 0.055, c: 2 },
            { t: 'line', pts: [[0.43, 0.55], [0.50, 0.585], [0.57, 0.55]], w: 0.045, c: 2 }
        ]
    },

    /* ── The podcast heroes ───────────────────────────
       Line art has no colors, so these palettes are chosen to tell the
       two heroes apart at a glance: אוקי is blue with a red cape and light
       hair, יוין is crimson with a blue cape and dark hair. Their chest
       emblems differ in shape too — a round compass vs a square book. */

    {
        id: 'oki',
        name: 'אוקי',
        emoji: '🦸',
        palette: ['#f3d0ad', '#a9702f', '#2f6fd0', '#ffd93d', '#e74c3c'],
        shapes: [
            /* cape falling behind the shoulders */
            { t: 'poly', pts: [[0.04, 0.64], [0.32, 0.52], [0.32, 1.00], [0.00, 1.00]], c: 4 },
            { t: 'poly', pts: [[0.96, 0.64], [0.68, 0.52], [0.68, 1.00], [1.00, 1.00]], c: 4 },
            /* shoulders */
            { t: 'poly', pts: [[0.20, 1.00], [0.27, 0.66], [0.73, 0.66], [0.80, 1.00]], c: 2 },
            /* neck */
            { t: 'rect', x: 0.43, y: 0.56, w: 0.14, h: 0.12, c: 0 },
            /* round compass emblem */
            { t: 'circle', cx: 0.50, cy: 0.85, r: 0.11, c: 3 },
            /* head */
            { t: 'ellipse', cx: 0.50, cy: 0.37, rx: 0.21, ry: 0.23, c: 0 },
            /* swept-back hair */
            { t: 'ellipse', cx: 0.50, cy: 0.16, rx: 0.23, ry: 0.12, c: 1 },
            { t: 'rect', x: 0.26, y: 0.18, w: 0.07, h: 0.15, c: 1 },
            { t: 'rect', x: 0.67, y: 0.18, w: 0.07, h: 0.15, c: 1 },
            /* eyes + smile */
            { t: 'ellipse', cx: 0.41, cy: 0.38, rx: 0.045, ry: 0.055, c: 1 },
            { t: 'ellipse', cx: 0.59, cy: 0.38, rx: 0.045, ry: 0.055, c: 1 },
            { t: 'line', pts: [[0.42, 0.515], [0.46, 0.565], [0.54, 0.565], [0.58, 0.515]], w: 0.042, c: 1, min: 20 }
        ]
    },
    {
        id: 'yuin',
        name: 'יוין',
        emoji: '🦸‍♂️',
        palette: ['#f3d0ad', '#2d2d3a', '#c0392b', '#ecf0f1', '#2f6fd0'],
        shapes: [
            /* cape falling behind the shoulders */
            { t: 'poly', pts: [[0.04, 0.64], [0.32, 0.52], [0.32, 1.00], [0.00, 1.00]], c: 4 },
            { t: 'poly', pts: [[0.96, 0.64], [0.68, 0.52], [0.68, 1.00], [1.00, 1.00]], c: 4 },
            /* shoulders */
            { t: 'poly', pts: [[0.20, 1.00], [0.27, 0.66], [0.73, 0.66], [0.80, 1.00]], c: 2 },
            /* neck */
            { t: 'rect', x: 0.43, y: 0.56, w: 0.14, h: 0.12, c: 0 },
            /* square book emblem */
            { t: 'rect', x: 0.39, y: 0.76, w: 0.22, h: 0.17, c: 3 },
            /* head */
            { t: 'ellipse', cx: 0.50, cy: 0.37, rx: 0.21, ry: 0.23, c: 0 },
            /* taller dark hair */
            { t: 'ellipse', cx: 0.50, cy: 0.14, rx: 0.23, ry: 0.13, c: 1 },
            { t: 'rect', x: 0.26, y: 0.16, w: 0.07, h: 0.17, c: 1 },
            { t: 'rect', x: 0.67, y: 0.16, w: 0.07, h: 0.17, c: 1 },
            /* eyes + smile */
            { t: 'ellipse', cx: 0.41, cy: 0.38, rx: 0.045, ry: 0.055, c: 1 },
            { t: 'ellipse', cx: 0.59, cy: 0.38, rx: 0.045, ry: 0.055, c: 1 },
            { t: 'line', pts: [[0.42, 0.515], [0.46, 0.565], [0.54, 0.565], [0.58, 0.515]], w: 0.042, c: 1, min: 20 }
        ]
    },
    {
        id: 'dragon',
        name: 'דרקון',
        emoji: '🐲',
        palette: ['#3fa34d', '#256b33', '#f7d794', '#ffd93d', '#e74c3c', '#2d2d3a'],
        shapes: [
            /* neck */
            { t: 'poly', pts: [[0.58, 0.58], [0.98, 0.62], [1.00, 1.00], [0.62, 1.00]], c: 1 },
            /* head */
            { t: 'ellipse', cx: 0.66, cy: 0.44, rx: 0.30, ry: 0.24, c: 0 },
            /* snout */
            { t: 'poly', pts: [[0.46, 0.30], [0.20, 0.42], [0.46, 0.56]], c: 0 },
            /* lower jaw */
            { t: 'poly', pts: [[0.46, 0.52], [0.24, 0.58], [0.48, 0.68]], c: 1 },
            /* horns */
            { t: 'poly', pts: [[0.60, 0.26], [0.68, 0.02], [0.78, 0.28]], c: 2 },
            { t: 'poly', pts: [[0.82, 0.30], [0.99, 0.16], [0.94, 0.38]], c: 2 },
            /* eye */
            { t: 'circle', cx: 0.62, cy: 0.36, r: 0.085, c: 3 },
            { t: 'circle', cx: 0.62, cy: 0.36, r: 0.045, c: 5 },
            /* fire breath */
            { t: 'poly', pts: [[0.33, 0.30], [0.00, 0.16], [0.07, 0.42], [0.00, 0.66], [0.35, 0.54]], c: 4 },
            { t: 'poly', pts: [[0.29, 0.34], [0.06, 0.28], [0.11, 0.43], [0.05, 0.58], [0.30, 0.50]], c: 3 }
        ]
    },
    {
        id: 'magicbook',
        name: 'ספר קסמים',
        emoji: '📖',
        palette: ['#6c5ce7', '#f7f1e3', '#e0a83c', '#a8ecff', '#2d2d3a'],
        shapes: [
            /* sparkles above the book */
            { t: 'circle', cx: 0.50, cy: 0.09, r: 0.075, c: 3 },
            { t: 'circle', cx: 0.24, cy: 0.17, r: 0.055, c: 3 },
            { t: 'circle', cx: 0.76, cy: 0.17, r: 0.055, c: 3 },
            /* cover */
            { t: 'poly', pts: [[0.02, 0.42], [0.50, 0.30], [0.98, 0.42], [0.98, 0.86], [0.50, 0.96], [0.02, 0.86]], c: 0 },
            /* pages */
            { t: 'poly', pts: [[0.11, 0.50], [0.45, 0.41], [0.45, 0.83], [0.11, 0.76]], c: 1 },
            { t: 'poly', pts: [[0.55, 0.41], [0.89, 0.50], [0.89, 0.76], [0.55, 0.83]], c: 1 },
            /* spine */
            { t: 'rect', x: 0.44, y: 0.34, w: 0.12, h: 0.58, c: 2 },
            /* text lines */
            { t: 'line', pts: [[0.16, 0.58], [0.40, 0.53]], w: 0.05, c: 4 },
            { t: 'line', pts: [[0.16, 0.69], [0.40, 0.65]], w: 0.05, c: 4 },
            { t: 'line', pts: [[0.60, 0.53], [0.84, 0.58]], w: 0.05, c: 4 },
            { t: 'line', pts: [[0.60, 0.65], [0.84, 0.69]], w: 0.05, c: 4 }
        ]
    }
];

/* ═══════════════════════════════════════════════════════
   TEXT
═══════════════════════════════════════════════════════ */

const ENCOURAGEMENT = [
    'יופי! 🎨',
    'מעולה! ⭐',
    'איזה יופי! 🌈',
    'כל הכבוד! 💪',
    'צבע מושלם! ✨'
];

const WRONG_MESSAGES = [
    'אופס! זה לא המספר הנכון 🤔',
    'בחר את הצבע עם המספר הזה 🎨',
    'המספר לא מתאים לצבע 🙂'
];
