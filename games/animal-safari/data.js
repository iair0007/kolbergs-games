/**
 * Animal Safari - Animal Database
 * Hebrew primary language with English secondary
 */

const ANIMALS = [
    {
        id: 'lion',
        name: 'אריה',
        nameEn: 'Lion',
        image: 'assets/images/animals/lion.png',
        sound: 'roar',
        fact: 'אריות הם החתולים היחידים שחיים בקבוצות הנקראות להקות!',
        factEn: 'Lions are the only cats that live in groups called prides!'
    },
    {
        id: 'elephant',
        name: 'פיל',
        nameEn: 'Elephant',
        image: 'assets/images/animals/elephant.png',
        sound: 'trumpet',
        fact: 'פילים יכולים לזכור דברים במשך שנים רבות!',
        factEn: 'Elephants can remember things for many years!'
    },
    {
        id: 'giraffe',
        name: 'ג׳ירפה',
        nameEn: 'Giraffe',
        image: 'assets/images/animals/giraffe.png',
        sound: 'hum',
        fact: 'ג׳ירפות הן החיות הגבוהות ביותר בעולם!',
        factEn: 'Giraffes are the tallest animals in the world!'
    },
    {
        id: 'zebra',
        name: 'זברה',
        nameEn: 'Zebra',
        image: 'assets/images/animals/zebra.png',
        sound: 'bray',
        fact: 'לכל זברה יש דפוס פסים ייחודי משלה!',
        factEn: 'Each zebra has its own unique stripe pattern!'
    },
    {
        id: 'tiger',
        name: 'נמר',
        nameEn: 'Tiger',
        image: 'assets/images/animals/tiger.png',
        sound: 'growl',
        fact: 'נמרים הם החתולים הגדולים ביותר בעולם!',
        factEn: 'Tigers are the largest cats in the world!'
    },
    {
        id: 'bear',
        name: 'דוב',
        nameEn: 'Bear',
        image: 'assets/images/animals/bear.png',
        sound: 'growl',
        fact: 'דובים יכולים לרוץ במהירות של עד 40 קמ״ש!',
        factEn: 'Bears can run up to 40 km/h!'
    },
    {
        id: 'panda',
        name: 'פנדה',
        nameEn: 'Panda',
        image: 'assets/images/animals/panda.png',
        sound: 'bleat',
        fact: 'פנדות אוכלות במבוק כמעט כל היום!',
        factEn: 'Pandas eat bamboo almost all day long!'
    },
    {
        id: 'penguin',
        name: 'פינגווין',
        nameEn: 'Penguin',
        image: 'assets/images/animals/penguin.png',
        sound: 'squawk',
        fact: 'פינגווינים יכולים לשחות מהר מאוד במים!',
        factEn: 'Penguins can swim very fast in water!'
    }
];

// Sound effects mapping (using Web Speech API for animal sounds)
const ANIMAL_SOUNDS = {
    roar: { text: 'רוֹאַר', pitch: 0.5, rate: 0.8 },
    trumpet: { text: 'טרומפט', pitch: 0.7, rate: 0.9 },
    hum: { text: 'הממ', pitch: 0.8, rate: 1.0 },
    bray: { text: 'היהה', pitch: 0.9, rate: 1.1 },
    growl: { text: 'גרר', pitch: 0.6, rate: 0.8 },
    bleat: { text: 'בהה', pitch: 1.0, rate: 1.0 },
    squawk: { text: 'קווק', pitch: 1.2, rate: 1.2 }
};

// Difficulty configurations
const DIFFICULTY_CONFIG = {
    easy: {
        pairs: 6,
        animals: ANIMALS.slice(0, 6),
        timer: null,
        gridClass: 'easy'
    },
    medium: {
        pairs: 8,
        animals: ANIMALS,
        timer: 180, // 3 minutes
        gridClass: 'medium'
    },
    hard: {
        pairs: 8,
        animals: ANIMALS,
        timer: 120, // 2 minutes
        gridClass: 'hard'
    }
};
