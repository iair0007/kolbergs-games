// ==================================================
// LEVEL 2 - FIRST CHALLENGE
// ==================================================
// Introduces enemies and wider gaps

const level2 = {
    name: "Level 2 - First Challenge",

    // PLATFORMS
    platforms: [
        { x: 0, y: 500, width: 400, height: 100 },
        { x: 550, y: 500, width: 250, height: 100 },      // Wider platform (user requested)
        { x: 900, y: 450, width: 150, height: 150 },
        { x: 1150, y: 500, width: 200, height: 100 },
        { x: 1450, y: 400, width: 150, height: 200 },
        { x: 1700, y: 500, width: 600, height: 100 }
    ],

    // ENEMIES: First introduction to enemies
    // vx: 1 means enemy moves at slower speed (reduced from 2 for 4-year-olds)
    enemies: [
        { x: 600, y: 450, vx: 1, patrol: { min: 520, max: 750 } },    // Patrols the second platform (shifted left)
        { x: 1800, y: 450, vx: 1, patrol: { min: 1700, max: 2100 } }  // Patrols final platform (wider range)
    ],

    // COLLECTIBLES
    collectibles: [
        { x: 670, y: 420, type: 'coin', collected: false },
        { x: 975, y: 370, type: 'coin', collected: false },
        { x: 1250, y: 420, type: 'coin', collected: false },
        { x: 1900, y: 420, type: 'coin', collected: false }
    ],

    powerUps: [],

    goal: { x: 2150, y: 420 }
};
