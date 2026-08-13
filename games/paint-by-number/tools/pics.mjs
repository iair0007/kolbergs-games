/**
 * The קשה pictures, drawn square by square at 32x32.
 * Reference: the two coloring pages — hair shape, suit, cape, emblem, palette.
 *
 * Twelve colors rather than ten: the extra two are always a shadow and a
 * highlight. They cost nothing in painting time (the grid is the same 1024
 * squares) and they are what stops a pixel portrait reading as a flat sticker.
 */
import { emit, g } from './author.mjs';

const SKY = 0, SKIN = 1, SHADE = 2, DARK = 3, HAIR = 4, HILITE = 5,
      SUIT = 6, SUITDK = 7, CAPE = 8, EMBLEM = 9, MOUTH = 10, WHITE = 11;

/** Shared portrait scaffold: head, ears, neck, shoulders, cape, face. */
function portrait({ id, name, emoji, palette, hair, hilite, emblem }) {
    const s = [];
    const P = (col, row, w, h, c) => s.push(g(col, row, w, h, c));

    P(0, 0, 32, 32, SKY);

    /* cape behind the shoulders, with a shadow along its inner fold */
    P(0, 22, 8, 10, CAPE);
    P(24, 22, 8, 10, CAPE);
    P(2, 20, 5, 3, CAPE);
    P(25, 20, 5, 3, CAPE);
    P(1, 27, 5, 5, SUITDK);
    P(26, 27, 5, 5, SUITDK);

    /* shoulders */
    P(6, 25, 20, 7, SUIT);
    P(8, 23, 16, 3, SUIT);
    P(6, 30, 20, 2, SUITDK);

    /* collar opening + chest emblem */
    P(13, 23, 6, 3, SKIN);
    emblem.forEach(r => P(...r));

    /* neck, shaded where the jaw casts onto it */
    P(13, 20, 6, 4, SKIN);
    P(13, 20, 6, 1, SHADE);

    /* head */
    P(8, 5, 16, 16, SKIN);
    P(7, 8, 1, 9, SKIN);
    P(24, 8, 1, 9, SKIN);
    P(8, 19, 2, 2, SKY);
    P(22, 19, 2, 2, SKY);
    P(9, 20, 2, 1, SKY);
    P(21, 20, 2, 1, SKY);
    P(10, 18, 12, 1, SHADE);      /* under the cheekbones */
    P(6, 12, 2, 3, SKIN);
    P(24, 12, 2, 3, SKIN);

    /* hair — what tells the two boys apart at a glance */
    hair.forEach(r => P(...r));
    hilite.forEach(r => P(...r));

    /* brows, eyes with a catchlight, nose, mouth */
    P(10, 11, 4, 1, HAIR);
    P(18, 11, 4, 1, HAIR);
    P(10, 13, 3, 2, DARK);
    P(19, 13, 3, 2, DARK);
    P(10, 13, 1, 1, WHITE);
    P(19, 13, 1, 1, WHITE);
    P(15, 15, 2, 2, SHADE);
    P(13, 18, 6, 1, MOUTH);
    P(14, 19, 4, 1, MOUTH);

    return emit({ id, name, emoji, palette, shapes: s });
}

/* ── אוקי — brown swept hair, blue suit, red cape, gold compass ── */
portrait({
    id: 'oki-portrait',
    name: 'אוקי',
    emoji: '🦸',
    palette: ['#bfe3f5', '#f6d3ae', '#e0b489', '#2b2b33', '#a9702f', '#c98f45',
              '#2f6fd0', '#245aa8', '#e74c3c', '#ffd93d', '#b5654a', '#ffffff'],
    hair: [
        [8, 2, 16, 4, HAIR],
        [7, 4, 18, 3, HAIR],
        [6, 6, 2, 5, HAIR],
        [24, 6, 2, 5, HAIR],
        [8, 7, 5, 2, HAIR],
        [13, 7, 5, 1, HAIR],
        [18, 7, 6, 2, HAIR],
        [10, 3, 3, 1, SKY],
        [20, 2, 3, 1, SKY]
    ],
    hilite: [[11, 4, 5, 1, HILITE], [18, 3, 4, 1, HILITE]],
    emblem: [[14, 26, 4, 3, EMBLEM], [15, 27, 2, 1, SUIT]]
});

/* ── יוין — black slicked hair, red suit, blue cape, silver book ── */
portrait({
    id: 'yuin-portrait',
    name: 'יוין',
    emoji: '🦸‍♂️',
    palette: ['#bfe3f5', '#f6d3ae', '#e0b489', '#2b2b33', '#1d1d24', '#3a3a48',
              '#c0392b', '#96271c', '#2f6fd0', '#ecf0f1', '#b5654a', '#ffffff'],
    hair: [
        [8, 3, 16, 3, HAIR],
        [7, 5, 18, 2, HAIR],
        [6, 6, 2, 4, HAIR],
        [24, 6, 2, 4, HAIR],
        [8, 7, 16, 1, HAIR],
        [8, 8, 4, 1, HAIR],
        [20, 8, 4, 1, HAIR],
        [9, 2, 6, 1, HAIR],
        [15, 1, 5, 2, HAIR]
    ],
    hilite: [[12, 4, 6, 1, HILITE], [19, 5, 4, 1, HILITE]],
    emblem: [[14, 26, 4, 3, EMBLEM], [15, 26, 2, 3, SUIT]]
});

/* ── דרקון — the green dragon's head, horns, eye and open jaw ── */
{
    const SKY = 0, GREEN = 1, DEEP = 2, LIGHT = 3, HORN = 4, HORNDK = 5,
          DARK = 6, EYE = 7, MOUTH = 8, TOOTH = 9, FIRE = 10, FIREDK = 11;
    const s = [];
    const P = (col, row, w, h, c) => s.push(g(col, row, w, h, c));

    P(0, 0, 32, 32, SKY);

    /* horns, each with a shaded side */
    P(5, 1, 3, 5, HORN);  P(4, 3, 2, 4, HORN);  P(4, 5, 2, 2, HORNDK);
    P(22, 1, 3, 5, HORN); P(25, 3, 2, 4, HORN); P(25, 5, 2, 2, HORNDK);

    /* skull */
    P(6, 6, 20, 9, GREEN);
    P(5, 8, 22, 6, GREEN);
    P(4, 10, 1, 3, GREEN);
    P(27, 10, 1, 3, GREEN);
    P(6, 6, 20, 2, DEEP);          /* brow ridge */
    P(8, 8, 16, 1, LIGHT);         /* light catching the forehead */

    /* eyes — yellow with a slit */
    P(8, 9, 4, 3, EYE);
    P(20, 9, 4, 3, EYE);
    P(9, 9, 2, 3, DARK);
    P(21, 9, 2, 3, DARK);

    /* snout, narrower than the skull */
    P(10, 15, 12, 4, GREEN);
    P(11, 19, 10, 2, GREEN);
    P(11, 15, 10, 1, LIGHT);
    P(12, 16, 2, 2, DEEP);
    P(18, 16, 2, 2, DEEP);

    /* open jaw with teeth */
    P(10, 21, 12, 5, MOUTH);
    P(10, 21, 2, 2, TOOTH); P(14, 21, 2, 2, TOOTH); P(18, 21, 2, 2, TOOTH);
    P(12, 24, 2, 2, TOOTH); P(16, 24, 2, 2, TOOTH); P(20, 24, 2, 2, TOOTH);
    P(9, 26, 14, 2, DEEP);
    P(7, 28, 18, 4, GREEN);
    P(9, 30, 14, 2, DEEP);

    /* a flame curling out of the jaw */
    P(23, 22, 4, 2, FIRE);
    P(25, 20, 4, 2, FIRE);
    P(27, 22, 4, 3, FIRE);
    P(29, 18, 3, 2, FIRE);
    P(24, 23, 3, 1, FIREDK);
    P(28, 23, 3, 1, FIREDK);

    emit({
        id: 'dragon-portrait', name: 'דרקון', emoji: '🐲',
        palette: ['#bfe3f5', '#3fa34d', '#256b33', '#63c46f', '#f7d794', '#d4ac6a',
                  '#2b2b33', '#ffd93d', '#8c2f2f', '#ffffff', '#f39c12', '#c8700c'],
        shapes: s
    });
}

/* ── ספר הקסמים — the open spell book from the library page ── */
{
    const BG = 0, COVER = 1, COVERDK = 2, PAGE = 3, PAGEDK = 4, EDGE = 5,
          INK = 6, GOLD = 7, GOLDDK = 8, SPARK = 9;
    const s = [];
    const P = (col, row, w, h, c) => s.push(g(col, row, w, h, c));

    P(0, 0, 32, 32, BG);

    /* sparkles rising off the pages */
    P(14, 1, 4, 3, SPARK); P(15, 0, 2, 5, SPARK);
    P(7, 4, 3, 2, SPARK);  P(22, 3, 3, 2, SPARK);
    P(10, 2, 2, 2, SPARK); P(20, 6, 2, 2, SPARK);

    /* covers */
    P(1, 12, 30, 16, COVER);
    P(0, 14, 32, 12, COVER);
    P(0, 24, 32, 2, COVERDK);

    /* pages */
    P(3, 10, 12, 16, PAGE);
    P(17, 10, 12, 16, PAGE);
    P(2, 12, 14, 13, PAGE);
    P(16, 12, 14, 13, PAGE);
    P(12, 12, 4, 13, PAGEDK);     /* the fold shadow at the gutter */
    P(16, 12, 4, 13, PAGEDK);

    /* text lines */
    P(5, 14, 7, 1, INK); P(5, 16, 7, 1, INK);
    P(5, 18, 5, 1, INK); P(5, 20, 7, 1, INK);
    P(20, 14, 7, 1, INK); P(20, 16, 7, 1, INK);
    P(20, 18, 5, 1, INK); P(20, 20, 7, 1, INK);

    /* spine and clasp */
    P(15, 9, 2, 19, GOLD);
    P(14, 26, 4, 3, GOLD);
    P(15, 27, 2, 2, GOLDDK);

    /* page edges */
    P(2, 25, 13, 2, EDGE);
    P(17, 25, 13, 2, EDGE);

    emit({
        id: 'book-portrait', name: 'ספר הקסמים', emoji: '📖',
        palette: ['#2d1b4e', '#6c5ce7', '#4b3bb0', '#fdf6e3', '#e8dcc0', '#d8c7a8',
                  '#2b2b33', '#e0a83c', '#b07d20', '#a8ecff'],
        shapes: s
    });
}
