/**
 * Shape Builder - Game Data
 * Shape definitions, colors, and pattern templates
 */

// Shape definitions with Hebrew names
const SHAPES = {
    circle: {
        name: 'עיגול',
        nameEn: 'Circle',
        path: 'M 50 50 m -40 0 a 40 40 0 1 0 80 0 a 40 40 0 1 0 -80 0'
    },
    square: {
        name: 'ריבוע',
        nameEn: 'Square',
        path: 'M 15 15 L 85 15 L 85 85 L 15 85 Z'
    },
    triangle: {
        name: 'משולש',
        nameEn: 'Triangle',
        path: 'M 50 15 L 85 85 L 15 85 Z'
    },
    rectangle: {
        name: 'מלבן',
        nameEn: 'Rectangle',
        path: 'M 10 30 L 90 30 L 90 70 L 10 70 Z'
    },
    pentagon: {
        name: 'מחומש',
        nameEn: 'Pentagon',
        path: 'M 50 15 L 85 40 L 70 80 L 30 80 L 15 40 Z'
    },
    hexagon: {
        name: 'משושה',
        nameEn: 'Hexagon',
        path: 'M 50 10 L 80 30 L 80 70 L 50 90 L 20 70 L 20 30 Z'
    },
    star: {
        name: 'כוכב',
        nameEn: 'Star',
        path: 'M 50 15 L 58 40 L 85 40 L 65 55 L 73 80 L 50 65 L 27 80 L 35 55 L 15 40 L 42 40 Z'
    },
    heart: {
        name: 'לב',
        nameEn: 'Heart',
        path: 'M 50 80 C 50 80 15 55 15 35 C 15 20 25 15 35 15 C 42 15 50 20 50 20 C 50 20 58 15 65 15 C 75 15 85 20 85 35 C 85 55 50 80 50 80 Z'
    }
};

// Bright color palette for kids
const COLORS = [
    { name: 'אדום', nameEn: 'Red', hex: '#FF6B6B' },
    { name: 'טורקיז', nameEn: 'Turquoise', hex: '#4ECDC4' },
    { name: 'כחול', nameEn: 'Blue', hex: '#45B7D1' },
    { name: 'כתום', nameEn: 'Orange', hex: '#FFA07A' },
    { name: 'ירוק', nameEn: 'Green', hex: '#98D8C8' },
    { name: 'צהוב', nameEn: 'Yellow', hex: '#F7DC6F' },
    { name: 'סגול', nameEn: 'Purple', hex: '#BB8FCE' },
    { name: 'תכלת', nameEn: 'Sky Blue', hex: '#85C1E2' }
];

// Pattern templates for Pattern Match mode
const PATTERNS = [
    {
        id: 1,
        name: 'בית פשוט',
        nameEn: 'Simple House',
        shapes: [
            { type: 'square', x: 200, y: 250, color: '#FF6B6B', rotation: 0, size: 100 },
            { type: 'triangle', x: 200, y: 170, color: '#FFA07A', rotation: 0, size: 100 }
        ]
    },
    {
        id: 2,
        name: 'עץ',
        nameEn: 'Tree',
        shapes: [
            { type: 'rectangle', x: 200, y: 280, color: '#8B4513', rotation: 0, size: 40 },
            { type: 'circle', x: 200, y: 200, color: '#98D8C8', rotation: 0, size: 80 }
        ]
    },
    {
        id: 3,
        name: 'פרח',
        nameEn: 'Flower',
        shapes: [
            { type: 'rectangle', x: 200, y: 300, color: '#98D8C8', rotation: 0, size: 60 },
            { type: 'circle', x: 200, y: 180, color: '#F7DC6F', rotation: 0, size: 40 },
            { type: 'circle', x: 160, y: 200, color: '#FF6B6B', rotation: 0, size: 50 },
            { type: 'circle', x: 240, y: 200, color: '#FF6B6B', rotation: 0, size: 50 },
            { type: 'circle', x: 200, y: 230, color: '#FF6B6B', rotation: 0, size: 50 }
        ]
    },
    {
        id: 4,
        name: 'רובוט',
        nameEn: 'Robot',
        shapes: [
            { type: 'square', x: 200, y: 200, color: '#85C1E2', rotation: 0, size: 80 },
            { type: 'rectangle', x: 200, y: 280, color: '#45B7D1', rotation: 0, size: 60 },
            { type: 'circle', x: 180, y: 190, color: '#F7DC6F', rotation: 0, size: 20 },
            { type: 'circle', x: 220, y: 190, color: '#F7DC6F', rotation: 0, size: 20 }
        ]
    },
    {
        id: 5,
        name: 'מכונית',
        nameEn: 'Car',
        shapes: [
            { type: 'rectangle', x: 200, y: 240, color: '#FF6B6B', rotation: 0, size: 100 },
            { type: 'square', x: 200, y: 200, color: '#4ECDC4', rotation: 0, size: 60 },
            { type: 'circle', x: 160, y: 280, color: '#1a1a1a', rotation: 0, size: 30 },
            { type: 'circle', x: 240, y: 280, color: '#1a1a1a', rotation: 0, size: 30 }
        ]
    },
    {
        id: 6,
        name: 'שמש',
        nameEn: 'Sun',
        shapes: [
            { type: 'circle', x: 200, y: 200, color: '#F7DC6F', rotation: 0, size: 80 },
            { type: 'triangle', x: 200, y: 130, color: '#FFA07A', rotation: 0, size: 30 },
            { type: 'triangle', x: 270, y: 200, color: '#FFA07A', rotation: 90, size: 30 },
            { type: 'triangle', x: 200, y: 270, color: '#FFA07A', rotation: 180, size: 30 },
            { type: 'triangle', x: 130, y: 200, color: '#FFA07A', rotation: 270, size: 30 }
        ]
    },
    {
        id: 7,
        name: 'דג',
        nameEn: 'Fish',
        shapes: [
            { type: 'circle', x: 200, y: 200, color: '#4ECDC4', rotation: 0, size: 70 },
            { type: 'triangle', x: 250, y: 200, color: '#45B7D1', rotation: 90, size: 50 },
            { type: 'circle', x: 180, y: 190, color: '#1a1a1a', rotation: 0, size: 15 }
        ]
    },
    {
        id: 8,
        name: 'ארנב',
        nameEn: 'Rabbit',
        shapes: [
            { type: 'circle', x: 200, y: 230, color: '#BB8FCE', rotation: 0, size: 60 },
            { type: 'circle', x: 200, y: 180, color: '#BB8FCE', rotation: 0, size: 50 },
            { type: 'rectangle', x: 180, y: 150, color: '#BB8FCE', rotation: 0, size: 40 },
            { type: 'rectangle', x: 220, y: 150, color: '#BB8FCE', rotation: 0, size: 40 }
        ]
    },
    {
        id: 9,
        name: 'כוכב לילה',
        nameEn: 'Night Star',
        shapes: [
            { type: 'star', x: 200, y: 200, color: '#F7DC6F', rotation: 0, size: 100 },
            { type: 'circle', x: 200, y: 200, color: '#FFA07A', rotation: 0, size: 40 }
        ]
    },
    {
        id: 10,
        name: 'גלידה',
        nameEn: 'Ice Cream',
        shapes: [
            { type: 'triangle', x: 200, y: 280, color: '#FFA07A', rotation: 180, size: 80 },
            { type: 'circle', x: 200, y: 180, color: '#FF6B6B', rotation: 0, size: 50 },
            { type: 'circle', x: 200, y: 220, color: '#4ECDC4', rotation: 0, size: 50 }
        ]
    }
];

// Timed challenges
const CHALLENGES = [
    { name: 'צור משולש', nameEn: 'Create Triangle', shape: 'triangle', time: 60 },
    { name: 'צור בית', nameEn: 'Create House', pattern: 1, time: 90 },
    { name: 'צור פרח', nameEn: 'Create Flower', pattern: 3, time: 120 },
    { name: 'צור רובוט', nameEn: 'Create Robot', pattern: 4, time: 120 },
    { name: 'צור מכונית', nameEn: 'Create Car', pattern: 5, time: 120 }
];
