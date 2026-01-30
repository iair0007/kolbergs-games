/**
 * Hebrew Hero - Data File
 * All letters, words, and game content defined here for easy expansion
 */

// Full Hebrew Alphabet with names and difficulty levels
const HEBREW_LETTERS = [
    // Easy letters (distinct shapes)
    { letter: 'א', name: 'אָלֶף', transliteration: 'Alef', difficulty: 'easy', group: 1 },
    { letter: 'ב', name: 'בֵּית', transliteration: 'Bet', difficulty: 'easy', group: 1 },
    { letter: 'ג', name: 'גִימֶל', transliteration: 'Gimel', difficulty: 'easy', group: 1 },
    { letter: 'ד', name: 'דָלֶת', transliteration: 'Dalet', difficulty: 'easy', group: 1 },
    { letter: 'ה', name: 'הֵא', transliteration: 'He', difficulty: 'easy', group: 1 },
    { letter: 'ו', name: 'וָו', transliteration: 'Vav', difficulty: 'easy', group: 2 },
    { letter: 'ז', name: 'זַיִן', transliteration: 'Zayin', difficulty: 'easy', group: 2 },
    { letter: 'ח', name: 'חֵית', transliteration: 'Chet', difficulty: 'easy', group: 2 },
    { letter: 'ט', name: 'טֵית', transliteration: 'Tet', difficulty: 'easy', group: 2 },
    { letter: 'י', name: 'יוֹד', transliteration: 'Yod', difficulty: 'easy', group: 2 },

    // Medium letters (some similar pairs)
    { letter: 'כ', name: 'כַּף', transliteration: 'Kaf', difficulty: 'medium', group: 3, similar: ['ב'] },
    { letter: 'ל', name: 'לָמֶד', transliteration: 'Lamed', difficulty: 'medium', group: 3 },
    { letter: 'מ', name: 'מֵם', transliteration: 'Mem', difficulty: 'medium', group: 3 },
    { letter: 'נ', name: 'נוּן', transliteration: 'Nun', difficulty: 'medium', group: 3, similar: ['ג'] },
    { letter: 'ס', name: 'סָמֶך', transliteration: 'Samech', difficulty: 'medium', group: 3 },
    { letter: 'ע', name: 'עַיִן', transliteration: 'Ayin', difficulty: 'medium', group: 4 },
    { letter: 'פ', name: 'פֵּא', transliteration: 'Pe', difficulty: 'medium', group: 4 },
    { letter: 'צ', name: 'צָדִי', transliteration: 'Tsadi', difficulty: 'medium', group: 4 },
    { letter: 'ק', name: 'קוֹף', transliteration: 'Qof', difficulty: 'medium', group: 4 },
    { letter: 'ר', name: 'רֵישׁ', transliteration: 'Resh', difficulty: 'medium', group: 4, similar: ['ד'] },

    // Hard letters (final forms and similar letters)
    { letter: 'ש', name: 'שִׁין', transliteration: 'Shin', difficulty: 'hard', group: 5 },
    { letter: 'ת', name: 'תָו', transliteration: 'Tav', difficulty: 'hard', group: 5 },
    { letter: 'ך', name: 'כַּף סוֹפִית', transliteration: 'Final Kaf', difficulty: 'hard', group: 5, final: true },
    { letter: 'ם', name: 'מֵם סוֹפִית', transliteration: 'Final Mem', difficulty: 'hard', group: 5, final: true },
    { letter: 'ן', name: 'נוּן סוֹפִית', transliteration: 'Final Nun', difficulty: 'hard', group: 6, final: true },
    { letter: 'ף', name: 'פֵּא סוֹפִית', transliteration: 'Final Pe', difficulty: 'hard', group: 6, final: true },
    { letter: 'ץ', name: 'צָדִי סוֹפִית', transliteration: 'Final Tsadi', difficulty: 'hard', group: 6, final: true }
];

// Simple Hebrew words for kids with emojis as hints
const HEBREW_WORDS = [
    // Easy words (2-3 letters, common objects)
    { word: 'אב', emoji: '👨', hint: 'אָבָא', difficulty: 'easy', category: 'family' },
    { word: 'אם', emoji: '👩', hint: 'אִמָא', difficulty: 'easy', category: 'family' },
    { word: 'יד', emoji: '✋', hint: 'יָד', difficulty: 'easy', category: 'body' },
    { word: 'עץ', emoji: '🌳', hint: 'עֵץ', difficulty: 'easy', category: 'nature' },
    { word: 'דג', emoji: '🐟', hint: 'דָג', difficulty: 'easy', category: 'animals' },
    { word: 'גב', emoji: '🔙', hint: 'גָב', difficulty: 'easy', category: 'body' },
    { word: 'כד', emoji: '🏺', hint: 'כַד', difficulty: 'easy', category: 'objects' },
    { word: 'חם', emoji: '🔥', hint: 'חָם', difficulty: 'easy', category: 'weather' },

    // Medium words (3-4 letters)
    { word: 'בית', emoji: '🏠', hint: 'בַּיִת', difficulty: 'medium', category: 'places' },
    { word: 'ילד', emoji: '👦', hint: 'יֶלֶד', difficulty: 'medium', category: 'people' },
    { word: 'ילדה', emoji: '👧', hint: 'יַלְדָה', difficulty: 'medium', category: 'people' },
    { word: 'שמש', emoji: '☀️', hint: 'שֶׁמֶשׁ', difficulty: 'medium', category: 'nature' },
    { word: 'ירח', emoji: '🌙', hint: 'יָרֵחַ', difficulty: 'medium', category: 'nature' },
    { word: 'ספר', emoji: '📚', hint: 'סֵפֶר', difficulty: 'medium', category: 'school' },
    { word: 'כלב', emoji: '🐕', hint: 'כֶּלֶב', difficulty: 'medium', category: 'animals' },
    { word: 'חתול', emoji: '🐱', hint: 'חָתוּל', difficulty: 'medium', category: 'animals' },
    { word: 'פרח', emoji: '🌸', hint: 'פֶּרַח', difficulty: 'medium', category: 'nature' },
    { word: 'מים', emoji: '💧', hint: 'מַיִם', difficulty: 'medium', category: 'nature' },
    { word: 'לחם', emoji: '🍞', hint: 'לֶחֶם', difficulty: 'medium', category: 'food' },
    { word: 'תפוח', emoji: '🍎', hint: 'תַפּוּחַ', difficulty: 'medium', category: 'food' },
    { word: 'בננה', emoji: '🍌', hint: 'בָּנָנָה', difficulty: 'medium', category: 'food' },
    { word: 'עוגה', emoji: '🎂', hint: 'עוּגָה', difficulty: 'medium', category: 'food' },
    { word: 'כדור', emoji: '⚽', hint: 'כַּדוּר', difficulty: 'medium', category: 'toys' },
    { word: 'ציפור', emoji: '🐦', hint: 'צִפּוֹר', difficulty: 'medium', category: 'animals' },
    { word: 'דלת', emoji: '🚪', hint: 'דֶּלֶת', difficulty: 'medium', category: 'objects' },
    { word: 'שולחן', emoji: '🪑', hint: 'שֻׁלְחָן', difficulty: 'medium', category: 'furniture' },
    { word: 'כיסא', emoji: '💺', hint: 'כִּסֵּא', difficulty: 'medium', category: 'furniture' },

    // Hard words (longer words, less common)
    { word: 'פרפר', emoji: '🦋', hint: 'פַּרְפַּר', difficulty: 'hard', category: 'animals' },
    { word: 'גלידה', emoji: '🍦', hint: 'גְּלִידָה', difficulty: 'hard', category: 'food' },
    { word: 'מחשב', emoji: '💻', hint: 'מַחְשֵׁב', difficulty: 'hard', category: 'objects' },
    { word: 'טלפון', emoji: '📱', hint: 'טֶלֶפוֹן', difficulty: 'hard', category: 'objects' },
    { word: 'משקפיים', emoji: '👓', hint: 'מִשְׁקָפַיִם', difficulty: 'hard', category: 'objects' },
    { word: 'אופניים', emoji: '🚲', hint: 'אוֹפַנַיִם', difficulty: 'hard', category: 'vehicles' },
    { word: 'מטריה', emoji: '☂️', hint: 'מִטְרִיָּה', difficulty: 'hard', category: 'objects' },
    { word: 'שמלה', emoji: '👗', hint: 'שִׂמְלָה', difficulty: 'hard', category: 'clothes' },
    { word: 'מכנסיים', emoji: '👖', hint: 'מִכְנָסַיִם', difficulty: 'hard', category: 'clothes' },
    { word: 'חולצה', emoji: '👕', hint: 'חֻלְצָה', difficulty: 'hard', category: 'clothes' },
    { word: 'ארנב', emoji: '🐰', hint: 'אַרְנָב', difficulty: 'hard', category: 'animals' },
    { word: 'דובדבן', emoji: '🍒', hint: 'דֻּבְדְּבָן', difficulty: 'hard', category: 'food' }
];

// Encouragement messages for correct answers
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

// Gentle correction messages for wrong answers
const TRY_AGAIN = [
    'נסה שוב! 💪',
    'כמעט! 🌈',
    'עוד פעם! 🎈',
    'אפשר! ✨',
    'תנסה עוד! 💫'
];

// Game configuration by difficulty
const DIFFICULTY_CONFIG = {
    easy: {
        questionsPerRound: 5,
        optionsCount: 3,
        timeLimit: null, // No time limit
        hintsEnabled: true,
        letterPool: HEBREW_LETTERS.filter(l => l.difficulty === 'easy'),
        wordPool: HEBREW_WORDS.filter(w => w.difficulty === 'easy'),
        starsPerCorrect: 2,
        coinsPerCorrect: 5
    },
    medium: {
        questionsPerRound: 7,
        optionsCount: 4,
        timeLimit: 30, // seconds (optional)
        hintsEnabled: true,
        letterPool: HEBREW_LETTERS.filter(l => l.difficulty === 'easy' || l.difficulty === 'medium'),
        wordPool: HEBREW_WORDS.filter(w => w.difficulty === 'easy' || w.difficulty === 'medium'),
        starsPerCorrect: 3,
        coinsPerCorrect: 8
    },
    hard: {
        questionsPerRound: 10,
        optionsCount: 5,
        timeLimit: 20, // seconds (optional)
        hintsEnabled: false,
        letterPool: HEBREW_LETTERS,
        wordPool: HEBREW_WORDS,
        starsPerCorrect: 5,
        coinsPerCorrect: 12
    }
};
