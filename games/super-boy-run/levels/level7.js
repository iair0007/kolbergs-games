// ==================================================
// LEVEL 7 - MOVING PLATFORMS INTRO
// ==================================================
// No enemies, introduces moving platforms gently

const level7 = {
    name: "Level 7 - Moving Platforms Intro",

    // PLATFORMS: Mix of static and slow-moving platforms
    platforms: [
        { x: 0, y: 500, width: 400, height: 100 },

        // Slow horizontal moving platform (slower for kids)
        { x: 550, y: 480, width: 150, height: 20, moving: true, vx: 1, moveRange: { min: 500, max: 700 } },

        { x: 850, y: 500, width: 200, height: 100 },

        // Slow vertical moving platform (slower for kids)
        { x: 1150, y: 450, width: 150, height: 20, moving: true, vy: 1, moveRange: { min: 400, max: 500 } },

        { x: 1400, y: 500, width: 300, height: 100 },

        // Another horizontal moving platform (slower for kids)
        { x: 1800, y: 480, width: 150, height: 20, moving: true, vx: 1.5, moveRange: { min: 1750, max: 1950 } },

        { x: 2100, y: 500, width: 500, height: 100 }
    ],

    // ENEMIES: None - focus on learning moving platforms
    enemies: [],

    // COLLECTIBLES
    collectibles: [
        { x: 300, y: 420, type: 'coin', collected: false },
        { x: 620, y: 400, type: 'coin', collected: false },
        { x: 950, y: 420, type: 'coin', collected: false },
        { x: 1220, y: 360, type: 'coin', collected: false },
        { x: 1550, y: 420, type: 'coin', collected: false },
        { x: 1875, y: 400, type: 'coin', collected: false },
        { x: 2350, y: 420, type: 'coin', collected: false }
    ],

    powerUps: [],

    goal: { x: 2500, y: 420 }
};
