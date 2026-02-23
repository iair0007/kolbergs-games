/**
 * הרגשות שלי — data.js
 *
 * Emotion recognition game for pre-readers aged 5-6.
 * Each scenario has an emoji scene, spoken description,
 * the correct emotion, and its emoji face.
 *
 * No reading required — all content is emoji + Hebrew TTS.
 */

/* ─── Emotions Reference ───────────────────────────── */
// Each emotion: emoji face, color accent
const EMOTIONS = {
    'שמח':    { emoji: '😊', color: '#FFD700' },
    'עצוב':   { emoji: '😢', color: '#6495ED' },
    'כועס':   { emoji: '😠', color: '#FF6347' },
    'מפוחד':  { emoji: '😨', color: '#9370DB' },
    'מופתע':  { emoji: '😲', color: '#FF69B4' },
    'גאה':    { emoji: '🥹', color: '#32CD32' },
    'נרגש':   { emoji: '🥳', color: '#FF8C00' },
    'עייף':   { emoji: '😴', color: '#708090' },
    'מבולבל': { emoji: '😕', color: '#20B2AA' },
    'מאוכזב': { emoji: '😞', color: '#4682B4' },
};

/* ─── Game Scenarios ───────────────────────────────── */
// scene: emojis showing the situation (displayed large)
// description: spoken Hebrew text describing the scene
// emotion: Hebrew emotion word (must match EMOTIONS key)
const ITEMS = [

    /* ─── EASY: 4 emotions — שמח, עצוב, כועס, מפוחד ─── */

    // שמח (happy)
    { scene: '🎂🎉🎈', description: 'יש מסיבת יום הולדת', emotion: 'שמח', difficulty: 'easy' },
    { scene: '🍦🌈✨', description: 'יש גלידה מתוקה', emotion: 'שמח', difficulty: 'easy' },
    { scene: '🐕❤️🤗', description: 'יש כלב חמוד לחבק', emotion: 'שמח', difficulty: 'easy' },
    { scene: '🎠🎡🎢', description: 'הגענו לפארק שעשועים', emotion: 'שמח', difficulty: 'easy' },
    { scene: '👵💕🤗', description: 'סבתא נותנת חיבוק גדול', emotion: 'שמח', difficulty: 'easy' },

    // עצוב (sad)
    { scene: '🧸💔😿', description: 'הבובה האהובה אבדה', emotion: 'עצוב', difficulty: 'easy' },
    { scene: '🌧️💧😿', description: 'ירד גשם ואי אפשר לצאת', emotion: 'עצוב', difficulty: 'easy' },
    { scene: '🍕❌😿', description: 'נגמרה הפיצה האהובה', emotion: 'עצוב', difficulty: 'easy' },
    { scene: '🤕💔😢', description: 'נפלתי ונחבלתי', emotion: 'עצוב', difficulty: 'easy' },
    { scene: '🎈💨😢', description: 'הבלון עף ואבד', emotion: 'עצוב', difficulty: 'easy' },

    // כועס (angry)
    { scene: '🧸😤👊', description: 'לקחו לי את הצעצוע', emotion: 'כועס', difficulty: 'easy' },
    { scene: '🚫🎮😤', description: 'אמא אמרה לכבות את המשחק', emotion: 'כועס', difficulty: 'easy' },
    { scene: '😤💢🤜', description: 'מישהו דחף אותי', emotion: 'כועס', difficulty: 'easy' },
    { scene: '🖼️💔😤', description: 'שברו לי את הציור', emotion: 'כועס', difficulty: 'easy' },
    { scene: '🚫🍬😤', description: 'אסור לאכול ממתקים עכשיו', emotion: 'כועס', difficulty: 'easy' },

    // מפוחד (scared)
    { scene: '🌩️⚡🌑', description: 'יש רעם חזק בחוץ', emotion: 'מפוחד', difficulty: 'easy' },
    { scene: '🕷️😱🏃', description: 'יש עכביש גדול', emotion: 'מפוחד', difficulty: 'easy' },
    { scene: '🌑👻🕯️', description: 'חשוך מאוד בחדר', emotion: 'מפוחד', difficulty: 'easy' },
    { scene: '🐕😱🏃', description: 'כלב גדול רץ לקראתי', emotion: 'מפוחד', difficulty: 'easy' },
    { scene: '👹😱💨', description: 'ראיתי מסכה מפחידה', emotion: 'מפוחד', difficulty: 'easy' },

    /* ─── MEDIUM: adding מופתע, גאה, נרגש ─── */

    // שמח
    { scene: '🏖️☀️🌊', description: 'הגענו לחוף הים', emotion: 'שמח', difficulty: 'medium' },
    { scene: '🐣🐥💕', description: 'אפרוח קטן וחמוד', emotion: 'שמח', difficulty: 'medium' },
    { scene: '🎁🎀💝', description: 'קיבלתי מתנה יפה', emotion: 'שמח', difficulty: 'medium' },

    // עצוב
    { scene: '👫🚫😞', description: 'חבר לא רוצה לשחק איתי', emotion: 'עצוב', difficulty: 'medium' },
    { scene: '🐟🪣💧', description: 'הדג שלי נפטר', emotion: 'עצוב', difficulty: 'medium' },

    // כועס
    { scene: '🧩😤💢', description: 'מישהו שבר את הפאזל שלי', emotion: 'כועס', difficulty: 'medium' },
    { scene: '⏰🚫😤', description: 'לא הניחו לי לסיים', emotion: 'כועס', difficulty: 'medium' },

    // מפוחד
    { scene: '🌊🏄😨', description: 'גל ענק בא לעברי', emotion: 'מפוחד', difficulty: 'medium' },
    { scene: '🔥🚨😨', description: 'ראיתי שריפה', emotion: 'מפוחד', difficulty: 'medium' },

    // מופתע (surprised)
    { scene: '🎁✨🎊', description: 'קיבלתי מתנה מפתיעה', emotion: 'מופתע', difficulty: 'medium' },
    { scene: '🎉🎊🎭', description: 'כולם צעקו הפתעה', emotion: 'מופתע', difficulty: 'medium' },
    { scene: '🦋🌸✨', description: 'פרפר ענק נחת עלי', emotion: 'מופתע', difficulty: 'medium' },
    { scene: '🐇🎩✨', description: 'קוסם הוציא ארנב מהכובע', emotion: 'מופתע', difficulty: 'medium' },
    { scene: '🌈🌦️✨', description: 'פתאום יצאה קשת ענקית', emotion: 'מופתע', difficulty: 'medium' },

    // גאה (proud)
    { scene: '📚⭐🏅', description: 'קיבלתי ציון מעולה', emotion: 'גאה', difficulty: 'medium' },
    { scene: '🎨🖌️👏', description: 'ציירתי ציור יפה מאוד', emotion: 'גאה', difficulty: 'medium' },
    { scene: '⚽🥅🏆', description: 'הבקעתי גול', emotion: 'גאה', difficulty: 'medium' },
    { scene: '🧩✅🎯', description: 'פתרתי את הפאזל לבד', emotion: 'גאה', difficulty: 'medium' },
    { scene: '🚲🏁⭐', description: 'למדתי לרכב על אופניים', emotion: 'גאה', difficulty: 'medium' },

    // נרגש (excited)
    { scene: '✈️🌍🎒', description: 'יוצאים לטיול', emotion: 'נרגש', difficulty: 'medium' },
    { scene: '🏖️🌊☀️', description: 'הגענו לים', emotion: 'נרגש', difficulty: 'medium' },
    { scene: '🎬🍿🎭', description: 'הולכים לסרט', emotion: 'נרגש', difficulty: 'medium' },
    { scene: '🐘🦒🦁', description: 'הולכים לגן החיות', emotion: 'נרגש', difficulty: 'medium' },
    { scene: '🎁🎁🎁', description: 'מחר יום הולדת שלי', emotion: 'נרגש', difficulty: 'medium' },

    /* ─── HARD: adding עייף, מבולבל, מאוכזב ─── */

    // שמח
    { scene: '🎻🎼🎶', description: 'ניגנתי יפה בהופעה', emotion: 'שמח', difficulty: 'hard' },

    // עצוב
    { scene: '🏫🚌😞', description: 'נגמרו החופשות', emotion: 'עצוב', difficulty: 'hard' },
    { scene: '🌸🍃😢', description: 'הצמח שלי נבל', emotion: 'עצוב', difficulty: 'hard' },

    // כועס
    { scene: '😤🖥️❌', description: 'המחשב נסגר ואיבדתי את המשחק', emotion: 'כועס', difficulty: 'hard' },

    // מפוחד
    { scene: '🌪️🏠😨', description: 'סופה חזקה בחוץ', emotion: 'מפוחד', difficulty: 'hard' },
    { scene: '💉😱🏥', description: 'הרופא מוציא מזרק', emotion: 'מפוחד', difficulty: 'hard' },

    // מופתע
    { scene: '🎂🎤🎵', description: 'שרו לי שיר יום הולדת בהפתעה', emotion: 'מופתע', difficulty: 'hard' },
    { scene: '🐟🔵✨', description: 'ראיתי דג צבעוני ענק', emotion: 'מופתע', difficulty: 'hard' },

    // גאה
    { scene: '🌟⭐🏆', description: 'זכיתי בתחרות', emotion: 'גאה', difficulty: 'hard' },
    { scene: '📐🏅👏', description: 'בניתי משהו בעצמי', emotion: 'גאה', difficulty: 'hard' },

    // נרגש
    { scene: '🌅🌊🏄', description: 'הולכים לגלוש בים', emotion: 'נרגש', difficulty: 'hard' },
    { scene: '🏆🌟🎊', description: 'זכינו באליפות', emotion: 'נרגש', difficulty: 'hard' },

    // עייף (tired)
    { scene: '🌙⭐😪', description: 'כבר מאוחר בלילה', emotion: 'עייף', difficulty: 'hard' },
    { scene: '🏃🏃🏃', description: 'רצנו הרבה מאוד', emotion: 'עייף', difficulty: 'hard' },
    { scene: '📚📚📚', description: 'למדנו כל היום', emotion: 'עייף', difficulty: 'hard' },
    { scene: '🌛💤🛏️', description: 'לא ישנתי מספיק', emotion: 'עייף', difficulty: 'hard' },
    { scene: '🎪🎡🎢', description: 'שיחקנו כל היום בפארק', emotion: 'עייף', difficulty: 'hard' },

    // מבולבל (confused)
    { scene: '🗺️❓🤔', description: 'לא יודע לאן ללכת', emotion: 'מבולבל', difficulty: 'hard' },
    { scene: '📖❓💭', description: 'לא מבין את השיעור', emotion: 'מבולבל', difficulty: 'hard' },
    { scene: '🎯🎯🎯', description: 'יש הרבה כיוונים שונים', emotion: 'מבולבל', difficulty: 'hard' },
    { scene: '🔢❓🤔', description: 'לא מבין את התרגיל', emotion: 'מבולבל', difficulty: 'hard' },
    { scene: '🗺️🧩❓', description: 'אבדתי בחידה', emotion: 'מבולבל', difficulty: 'hard' },

    // מאוכזב (disappointed)
    { scene: '☔🏖️😞', description: 'ירד גשם ביום הטיול', emotion: 'מאוכזב', difficulty: 'hard' },
    { scene: '🎮🔋❌', description: 'נגמרה הסוללה במשחק', emotion: 'מאוכזב', difficulty: 'hard' },
    { scene: '🏅🥈😞', description: 'כמעט זכיתי במדליית זהב', emotion: 'מאוכזב', difficulty: 'hard' },
    { scene: '🍦❌😞', description: 'נפלה הגלידה על הרצפה', emotion: 'מאוכזב', difficulty: 'hard' },
    { scene: '🎈💨😞', description: 'הבלון התפוצץ', emotion: 'מאוכזב', difficulty: 'hard' },
];

/* ─── Game Config ──────────────────────────────────── */
const GAME_CONFIG = {
    easy: {
        questionsPerRound: 6,
        optionsCount: 2,
        starsPerCorrect: 1,
        emotions: ['שמח', 'עצוב', 'כועס', 'מפוחד'],
    },
    medium: {
        questionsPerRound: 8,
        optionsCount: 3,
        starsPerCorrect: 2,
        emotions: ['שמח', 'עצוב', 'כועס', 'מפוחד', 'מופתע', 'גאה', 'נרגש'],
    },
    hard: {
        questionsPerRound: 10,
        optionsCount: 4,
        starsPerCorrect: 3,
        emotions: ['שמח', 'עצוב', 'כועס', 'מפוחד', 'מופתע', 'גאה', 'נרגש', 'עייף', 'מבולבל', 'מאוכזב'],
    },
};

/* ─── Feedback Messages (Hebrew) ───────────────────── */
const ENCOURAGEMENT = [
    'כל הכבוד! 🌟',
    'מצוין! ✨',
    'אלוף! 🏆',
    'ממש טוב! 👏',
    'מדהים! 🎉',
    'סופר! ⭐',
    'יפה מאוד! 🌈',
    'עשית זאת! 🎊',
    'פנטסטי! 💫',
    'ברכות! 🥳',
    'אתה מבין רגשות! ❤️',
    'לב חכם! 💛',
];

const TRY_AGAIN = [
    'כמעט! נסה שוב 💪',
    'לא נורא, ממשיכים! 🔄',
    'אל תוותר! 😊',
    'קרוב מאוד! 🎯',
    'ממשיכים! 🚀',
    'תנסה שוב! 💙',
];
