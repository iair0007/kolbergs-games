/**
 * The character portraits, drawn square by square at 32x32.
 * Reference: the two coloring pages — hair shape, suit, cape, emblem, palette.
 */
import { emit, g } from './author.mjs';

/* palette slots shared by both heroes so the pair reads as a set */
const SKY = 0, SKIN = 1, SHADE = 2, DARK = 3, HAIR = 4,
      SUIT = 5, CAPE = 6, EMBLEM = 7, MOUTH = 8, WHITE = 9;

/** Shared portrait scaffold: head, ears, neck, shoulders, cape, face. */
function portrait({ id, name, emoji, palette, hair, extra = [] }) {
    const s = [];
    const P = (col, row, w, h, c) => s.push(g(col, row, w, h, c));

    /* sky */
    P(0, 0, 32, 32, SKY);

    /* cape behind the shoulders */
    P(0, 22, 8, 10, CAPE);
    P(24, 22, 8, 10, CAPE);
    P(2, 20, 5, 3, CAPE);
    P(25, 20, 5, 3, CAPE);

    /* shoulders / suit */
    P(6, 25, 20, 7, SUIT);
    P(8, 23, 16, 3, SUIT);
    /* collar opening */
    P(13, 23, 6, 3, SKIN);
    P(14, 26, 4, 2, EMBLEM);

    /* neck */
    P(13, 20, 6, 4, SKIN);
    P(13, 20, 6, 1, SHADE);

    /* head */
    P(8, 5, 16, 16, SKIN);
    P(7, 8, 1, 9, SKIN);
    P(24, 8, 1, 9, SKIN);
    /* jaw taper */
    P(8, 19, 2, 2, SKY);
    P(22, 19, 2, 2, SKY);
    P(9, 20, 2, 1, SKY);
    P(21, 20, 2, 1, SKY);
    /* ears */
    P(6, 12, 2, 3, SKIN);
    P(24, 12, 2, 3, SKIN);

    /* hair — the one thing that tells the two boys apart at a glance */
    hair.forEach(r => P(...r));

    /* eyebrows */
    P(10, 11, 4, 1, HAIR);
    P(18, 11, 4, 1, HAIR);

    /* eyes: dark with a white catchlight */
    P(10, 13, 3, 2, DARK);
    P(19, 13, 3, 2, DARK);
    P(10, 13, 1, 1, WHITE);
    P(19, 13, 1, 1, WHITE);

    /* nose + mouth */
    P(15, 15, 2, 2, SHADE);
    P(13, 18, 6, 1, MOUTH);
    P(14, 19, 4, 1, MOUTH);

    extra.forEach(r => P(...r));

    return emit({ id, name, emoji, palette, shapes: s });
}

/* ── אוקי — brown swept hair, blue suit, red cape, gold compass ── */
portrait({
    id: 'oki-portrait',
    name: 'אוקי',
    emoji: '🦸',
    palette: ['#bfe3f5', '#f6d3ae', '#e0b489', '#2b2b33', '#a9702f',
              '#2f6fd0', '#e74c3c', '#ffd93d', '#b5654a', '#ffffff'],
    hair: [
        [8, 2, 16, 4, 4],      /* crown */
        [7, 4, 18, 3, 4],      /* sides */
        [6, 6, 2, 5, 4],
        [24, 6, 2, 5, 4],
        [8, 7, 5, 2, 4],       /* swept fringe, heavier on his right */
        [13, 7, 5, 1, 4],
        [18, 7, 6, 2, 4],
        [10, 3, 3, 1, 0],      /* a notch of sky for the tousled look */
        [20, 2, 3, 1, 0]
    ]
});

/* ── יוין — black slicked hair, red suit, blue cape, silver book ── */
portrait({
    id: 'yuin-portrait',
    name: 'יוין',
    emoji: '🦸‍♂️',
    palette: ['#bfe3f5', '#f6d3ae', '#e0b489', '#2b2b33', '#1d1d24',
              '#c0392b', '#2f6fd0', '#ecf0f1', '#b5654a', '#ffffff'],
    hair: [
        [8, 3, 16, 3, 4],
        [7, 5, 18, 2, 4],
        [6, 6, 2, 4, 4],
        [24, 6, 2, 4, 4],
        [8, 7, 16, 1, 4],      /* a low, flat hairline — slicked back */
        [8, 8, 4, 1, 4],
        [20, 8, 4, 1, 4],
        [9, 2, 6, 1, 4],       /* the quiff */
        [15, 1, 5, 2, 4]
    ]
});

/* ── דרקון — the green dragon's head, horns, eye and open jaw ── */
{
    const SKY = 0, GREEN = 1, DEEP = 2, HORN = 3, DARK = 4,
          EYE = 5, MOUTH = 6, TOOTH = 7, FIRE = 8;
    const s = [];
    const P = (col, row, w, h, c) => s.push(g(col, row, w, h, c));

    P(0, 0, 32, 32, SKY);

    /* horns */
    P(5, 1, 3, 5, HORN);  P(4, 3, 2, 4, HORN);
    P(22, 1, 3, 5, HORN); P(25, 3, 2, 4, HORN);

    /* skull */
    P(6, 6, 20, 9, GREEN);
    P(5, 8, 22, 6, GREEN);
    P(4, 10, 1, 3, GREEN);
    P(27, 10, 1, 3, GREEN);
    /* brow ridge */
    P(6, 6, 20, 2, DEEP);

    /* eyes — yellow with a slit */
    P(8, 9, 4, 3, EYE);
    P(20, 9, 4, 3, EYE);
    P(9, 9, 2, 3, DARK);
    P(21, 9, 2, 3, DARK);

    /* snout — narrower than the skull so the head reads as a muzzle */
    P(10, 15, 12, 4, GREEN);
    P(11, 19, 10, 2, GREEN);
    P(12, 16, 2, 2, DEEP);   /* nostrils */
    P(18, 16, 2, 2, DEEP);

    /* open jaw with teeth */
    P(10, 21, 12, 5, MOUTH);
    P(10, 21, 2, 2, TOOTH); P(14, 21, 2, 2, TOOTH); P(18, 21, 2, 2, TOOTH);
    P(12, 24, 2, 2, TOOTH); P(16, 24, 2, 2, TOOTH); P(20, 24, 2, 2, TOOTH);
    /* jaw line + neck */
    P(9, 26, 14, 2, DEEP);
    P(7, 28, 18, 4, GREEN);

    /* a flame curling out of the jaw */
    P(23, 22, 4, 2, FIRE);
    P(25, 20, 4, 2, FIRE);
    P(27, 22, 4, 3, FIRE);
    P(29, 18, 3, 2, FIRE);

    emit({
        id: 'dragon-portrait', name: 'דרקון', emoji: '🐲',
        palette: ['#bfe3f5', '#3fa34d', '#256b33', '#f7d794', '#2b2b33',
                  '#ffd93d', '#8c2f2f', '#ffffff', '#f39c12'],
        shapes: s
    });
}

/* ── ספר הקסמים — the open spell book from the library page ── */
{
    const BG = 0, COVER = 1, PAGE = 2, EDGE = 3, INK = 4, GOLD = 5, SPARK = 6;
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

    /* pages */
    P(3, 10, 12, 16, PAGE);
    P(17, 10, 12, 16, PAGE);
    P(2, 12, 14, 13, PAGE);
    P(16, 12, 14, 13, PAGE);

    /* text lines */
    P(5, 14, 8, 1, INK); P(5, 16, 8, 1, INK);
    P(5, 18, 6, 1, INK); P(5, 20, 8, 1, INK);
    P(19, 14, 8, 1, INK); P(19, 16, 8, 1, INK);
    P(19, 18, 6, 1, INK); P(19, 20, 8, 1, INK);

    /* spine and clasp */
    P(15, 9, 2, 19, GOLD);
    P(14, 26, 4, 3, GOLD);
    /* page edges */
    P(2, 25, 13, 2, EDGE);
    P(17, 25, 13, 2, EDGE);

    emit({
        id: 'book-portrait', name: 'ספר הקסמים', emoji: '📖',
        palette: ['#2d1b4e', '#6c5ce7', '#fdf6e3', '#d8c7a8', '#2b2b33',
                  '#e0a83c', '#a8ecff'],
        shapes: s
    });
}
