/**
 * Color Match Challenge - Color Data
 */

const COLORS = {
    easy: [
        { name: 'Red', nameHe: 'אדום', hex: '#FF0000' },
        { name: 'Blue', nameHe: 'כחול', hex: '#0000FF' },
        { name: 'Yellow', nameHe: 'צהוב', hex: '#FFFF00' },
        { name: 'Green', nameHe: 'ירוק', hex: '#00FF00' },
        { name: 'Orange', nameHe: 'כתום', hex: '#FF8800' },
        { name: 'Purple', nameHe: 'סגול', hex: '#9900FF' }
    ],
    medium: [
        { name: 'Red', nameHe: 'אדום', hex: '#FF0000' },
        { name: 'Blue', nameHe: 'כחול', hex: '#0000FF' },
        { name: 'Yellow', nameHe: 'צהוב', hex: '#FFFF00' },
        { name: 'Green', nameHe: 'ירוק', hex: '#00FF00' },
        { name: 'Orange', nameHe: 'כתום', hex: '#FF8800' },
        { name: 'Purple', nameHe: 'סגול', hex: '#9900FF' },
        { name: 'Pink', nameHe: 'ורוד', hex: '#FF69B4' },
        { name: 'Brown', nameHe: 'חום', hex: '#8B4513' },
        { name: 'Gray', nameHe: 'אפור', hex: '#808080' },
        { name: 'Black', nameHe: 'שחור', hex: '#000000' },
        { name: 'White', nameHe: 'לבן', hex: '#FFFFFF' }
    ],
    hard: [
        { name: 'Red', nameHe: 'אדום', hex: '#FF0000' },
        { name: 'Blue', nameHe: 'כחול', hex: '#0000FF' },
        { name: 'Yellow', nameHe: 'צהוב', hex: '#FFFF00' },
        { name: 'Green', nameHe: 'ירוק', hex: '#00FF00' },
        { name: 'Orange', nameHe: 'כתום', hex: '#FF8800' },
        { name: 'Purple', nameHe: 'סגול', hex: '#9900FF' },
        { name: 'Pink', nameHe: 'ורוד', hex: '#FF69B4' },
        { name: 'Brown', nameHe: 'חום', hex: '#8B4513' },
        { name: 'Gray', nameHe: 'אפור', hex: '#808080' },
        { name: 'Turquoise', nameHe: 'טורקיז', hex: '#40E0D0' },
        { name: 'Magenta', nameHe: 'מגנטה', hex: '#FF00FF' },
        { name: 'Cyan', nameHe: 'ציאן', hex: '#00FFFF' },
        { name: 'Lime', nameHe: 'ליים', hex: '#CCFF00' },
        { name: 'Indigo', nameHe: 'אינדיגו', hex: '#4B0082' },
        { name: 'Coral', nameHe: 'אלמוג', hex: '#FF7F50' }
    ]
};

const DIFFICULTY_SETTINGS = {
    easy: {
        timePerRound: 10,
        totalRounds: 10,
        optionsCount: 4
    },
    medium: {
        timePerRound: 7,
        totalRounds: 15,
        optionsCount: 5
    },
    hard: {
        timePerRound: 5,
        totalRounds: 20,
        optionsCount: 6
    }
};
