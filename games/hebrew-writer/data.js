/**
 * Hebrew Writer - Data File
 * Words with pictures (emojis) for the writing learning game
 */

// Hebrew alphabet for letter selection
const HEBREW_ALPHABET = [
    'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י',
    'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ', 'ק', 'ר',
    'ש', 'ת', 'ך', 'ם', 'ן', 'ף', 'ץ'
];

// Words with pictures (emojis) for the game
const WORD_DATA = [
    // Easy words (2-3 letters) - great for beginners
    { word: 'אב', emoji: '👨', meaning: 'אבא', difficulty: 'easy' },
    { word: 'אם', emoji: '👩', meaning: 'אמא', difficulty: 'easy' },
    { word: 'יד', emoji: '✋', meaning: 'יד', difficulty: 'easy' },
    { word: 'עץ', emoji: '🌳', meaning: 'עץ', difficulty: 'easy' },
    { word: 'דג', emoji: '🐟', meaning: 'דג', difficulty: 'easy' },
    { word: 'כד', emoji: '🏺', meaning: 'כד', difficulty: 'easy' },
    { word: 'חם', emoji: '🔥', meaning: 'חם', difficulty: 'easy' },
    { word: 'קר', emoji: '❄️', meaning: 'קר', difficulty: 'easy' },
    { word: 'גן', emoji: '🏡', meaning: 'גן', difficulty: 'easy' },
    { word: 'הר', emoji: '⛰️', meaning: 'הר', difficulty: 'easy' },
    { word: 'נר', emoji: '🕯️', meaning: 'נר', difficulty: 'easy' },
    { word: 'סל', emoji: '🧺', meaning: 'סל', difficulty: 'easy' },
    { word: 'כף', emoji: '🥄', meaning: 'כף', difficulty: 'easy' },
    { word: 'פה', emoji: '👄', meaning: 'פה', difficulty: 'easy' },
    { word: 'אף', emoji: '👃', meaning: 'אף', difficulty: 'easy' },

    // Medium words (3-4 letters)
    { word: 'בית', emoji: '🏠', meaning: 'בית', difficulty: 'medium' },
    { word: 'ילד', emoji: '👦', meaning: 'ילד', difficulty: 'medium' },
    { word: 'שמש', emoji: '☀️', meaning: 'שמש', difficulty: 'medium' },
    { word: 'ירח', emoji: '🌙', meaning: 'ירח', difficulty: 'medium' },
    { word: 'ספר', emoji: '📚', meaning: 'ספר', difficulty: 'medium' },
    { word: 'כלב', emoji: '🐕', meaning: 'כלב', difficulty: 'medium' },
    { word: 'פרח', emoji: '🌸', meaning: 'פרח', difficulty: 'medium' },
    { word: 'מים', emoji: '💧', meaning: 'מים', difficulty: 'medium' },
    { word: 'לחם', emoji: '🍞', meaning: 'לחם', difficulty: 'medium' },
    { word: 'כדור', emoji: '⚽', meaning: 'כדור', difficulty: 'medium' },
    { word: 'דלת', emoji: '🚪', meaning: 'דלת', difficulty: 'medium' },
    { word: 'גמל', emoji: '🐫', meaning: 'גמל', difficulty: 'medium' },
    { word: 'זאב', emoji: '🐺', meaning: 'זאב', difficulty: 'medium' },
    { word: 'אריה', emoji: '🦁', meaning: 'אריה', difficulty: 'medium' },
    { word: 'פיל', emoji: '🐘', meaning: 'פיל', difficulty: 'medium' },

    // Hard words (4+ letters) - full word writing
    { word: 'תפוח', emoji: '🍎', meaning: 'תפוח', difficulty: 'hard' },
    { word: 'בננה', emoji: '🍌', meaning: 'בננה', difficulty: 'hard' },
    { word: 'עוגה', emoji: '🎂', meaning: 'עוגה', difficulty: 'hard' },
    { word: 'ציפור', emoji: '🐦', meaning: 'ציפור', difficulty: 'hard' },
    { word: 'חתול', emoji: '🐱', meaning: 'חתול', difficulty: 'hard' },
    { word: 'פרפר', emoji: '🦋', meaning: 'פרפר', difficulty: 'hard' },
    { word: 'גלידה', emoji: '🍦', meaning: 'גלידה', difficulty: 'hard' },
    { word: 'תפוז', emoji: '🍊', meaning: 'תפוז', difficulty: 'hard' },
    { word: 'לימון', emoji: '🍋', meaning: 'לימון', difficulty: 'hard' },
    { word: 'ארנב', emoji: '🐰', meaning: 'ארנב', difficulty: 'hard' },
    { word: 'מטוס', emoji: '✈️', meaning: 'מטוס', difficulty: 'hard' },
    { word: 'רכבת', emoji: '🚂', meaning: 'רכבת', difficulty: 'hard' },
    { word: 'בלון', emoji: '🎈', meaning: 'בלון', difficulty: 'hard' },
    { word: 'בובה', emoji: '🎎', meaning: 'בובה', difficulty: 'hard' },
    { word: 'כיסא', emoji: '💺', meaning: 'כיסא', difficulty: 'hard' }
];

// Encouragement messages
const ENCOURAGEMENT = [
    'מעולה! 🌟',
    'כל הכבוד! 👏',
    'נפלא! ✨',
    'מדהים! 🎉',
    'יופי! 💫',
    'נכון מאוד! 🎯',
    'סחתיין! 🏆',
    'גאון! 🧠',
    'וואו! 🚀',
    'בול! 🎪'
];

// Try again messages
const TRY_AGAIN = [
    'נסה שוב! 💪',
    'כמעט! 🌈',
    'עוד פעם! 🎈',
    'אפשר! ✨',
    'תנסה עוד! 💫'
];

// Game configuration
const GAME_CONFIG = {
    easy: {
        questionsPerRound: 5,
        optionsCount: 4,
        starsPerCorrect: 2,
        coinsPerCorrect: 5
    },
    medium: {
        questionsPerRound: 5,
        optionsCount: 4,
        starsPerCorrect: 3,
        coinsPerCorrect: 8
    },
    hard: {
        questionsPerRound: 5,
        optionsCount: 6,
        starsPerCorrect: 5,
        coinsPerCorrect: 12
    }
};
