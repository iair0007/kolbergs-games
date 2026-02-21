'use strict';

/* ═══════════════════════════════════════════════════════
   פורץ הקודים — data.js
   Colors, difficulty config, and static content.
═══════════════════════════════════════════════════════ */

const COLORS = [
    { id: 'red',    name: 'אדום',   hex: '#FF6B6B' },
    { id: 'green',  name: 'ירוק',   hex: '#2ECC71' },
    { id: 'blue',   name: 'כחול',   hex: '#3498DB' },
    { id: 'yellow', name: 'צהוב',   hex: '#F1C40F' },
    { id: 'purple', name: 'סגול',   hex: '#9B59B6' },
    { id: 'orange', name: 'כתום',   hex: '#FF9F43' },
];

const DIFFICULTY_CONFIG = {
    easy:   { sequenceLength: 3, colorsCount: 4, maxAttempts: 8,  label: 'קל',     emoji: '🟢' },
    medium: { sequenceLength: 4, colorsCount: 5, maxAttempts: 8,  label: 'בינוני', emoji: '🟡' },
    hard:   { sequenceLength: 5, colorsCount: 6, maxAttempts: 10, label: 'קשה',    emoji: '🔴' },
};
