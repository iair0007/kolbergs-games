'use strict';

/* ═══════════════════════════════════════════════════════
   פורץ הקודים — data.js
═══════════════════════════════════════════════════════ */

const COLORS = [
    { id: 'red',    name: 'אדום',   hex: '#FF6B6B' },
    { id: 'green',  name: 'ירוק',   hex: '#2ECC71' },
    { id: 'blue',   name: 'כחול',   hex: '#3498DB' },
    { id: 'yellow', name: 'צהוב',   hex: '#F1C40F' },
    { id: 'purple', name: 'סגול',   hex: '#9B59B6' },
    { id: 'orange', name: 'כתום',   hex: '#FF9F43' },
];

// colorsCount  = colors in the code (= minimum palette size, no extra color)
// allowRepeats = true only for super — all other levels always have unique colors in code
// maxHints     = how many hint reveals are available per game
const DIFFICULTY_CONFIG = {
    easy:   { sequenceLength: 3, colorsCount: 3, maxAttempts: 8,  label: 'קל',     emoji: '🟢', allowRepeats: false, maxHints: 2 },
    medium: { sequenceLength: 4, colorsCount: 4, maxAttempts: 8,  label: 'בינוני', emoji: '🟡', allowRepeats: false, maxHints: 2 },
    hard:   { sequenceLength: 5, colorsCount: 5, maxAttempts: 10, label: 'קשה',    emoji: '🔴', allowRepeats: false, maxHints: 1 },
    super:  { sequenceLength: 5, colorsCount: 6, maxAttempts: 12, label: 'סופר',   emoji: '💀', allowRepeats: true,  maxHints: 1 },
};
