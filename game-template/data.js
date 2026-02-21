/**
 * GAME_TITLE — data.js
 *
 * All game content lives here, separate from logic.
 * Replace ITEMS, GAME_CONFIG, ENCOURAGEMENT, TRY_AGAIN
 * with content appropriate for your game.
 */

/* ─── Game Content ─────────────────────────────────── */
/* Add at least 15 items per difficulty level */
const ITEMS = [
    // Easy (2–3 letter words / simple concepts)
    { word: 'כלב',   emoji: '🐕', meaning: 'dog',   difficulty: 'easy'   },
    { word: 'חתול',  emoji: '🐈', meaning: 'cat',   difficulty: 'easy'   },
    { word: 'דג',    emoji: '🐟', meaning: 'fish',  difficulty: 'easy'   },
    { word: 'ציפור', emoji: '🐦', meaning: 'bird',  difficulty: 'easy'   },
    { word: 'פרה',   emoji: '🐄', meaning: 'cow',   difficulty: 'easy'   },
    { word: 'סוס',   emoji: '🐎', meaning: 'horse', difficulty: 'easy'   },
    { word: 'חזיר',  emoji: '🐷', meaning: 'pig',   difficulty: 'easy'   },
    { word: 'כבש',   emoji: '🐑', meaning: 'sheep', difficulty: 'easy'   },
    { word: 'עוף',   emoji: '🐔', meaning: 'hen',   difficulty: 'easy'   },
    { word: 'ברוז',  emoji: '🦆', meaning: 'duck',  difficulty: 'easy'   },
    { word: 'ארנב',  emoji: '🐰', meaning: 'rabbit',difficulty: 'easy'   },
    { word: 'עכבר',  emoji: '🐭', meaning: 'mouse', difficulty: 'easy'   },
    { word: 'פיל',   emoji: '🐘', meaning: 'elephant',difficulty: 'easy' },
    { word: 'אריה',  emoji: '🦁', meaning: 'lion',  difficulty: 'easy'   },
    { word: 'קוף',   emoji: '🐒', meaning: 'monkey',difficulty: 'easy'   },

    // Medium
    { word: 'TODO', emoji: '🌟', meaning: 'TODO', difficulty: 'medium' },
    // ... add 15 medium items

    // Hard
    { word: 'TODO', emoji: '🌟', meaning: 'TODO', difficulty: 'hard' },
    // ... add 15 hard items
];

/* ─── Game Config ──────────────────────────────────── */
const GAME_CONFIG = {
    easy:   { questionsPerRound: 5,  optionsCount: 2, starsPerCorrect: 1 },
    medium: { questionsPerRound: 8,  optionsCount: 3, starsPerCorrect: 2 },
    hard:   { questionsPerRound: 10, optionsCount: 4, starsPerCorrect: 3 },
};

/* ─── Feedback Messages (Hebrew) ───────────────────── */
const ENCOURAGEMENT = [
    'כל הכבוד! 🌟',
    'מצוין! ✨',
    'אלוף/ה! 🏆',
    'ממש טוב! 👏',
    'מדהים! 🎉',
    'סופר! ⭐',
    'יפה מאוד! 🌈',
    'עשית זאת! 🎊',
    'פנטסטי! 💫',
    'ברכות! 🥳',
];

const TRY_AGAIN = [
    'כמעט! נסה שוב 💪',
    'לא נורא, נסה שוב! 🔄',
    'אל תוותר! 😊',
    'קרוב מאוד! 🎯',
    'ממשיכים! 🚀',
];
