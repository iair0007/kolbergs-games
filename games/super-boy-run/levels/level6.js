// ==================================================
// LEVEL 6 - SIMPLE COINS
// ==================================================
// Easy level without enemies - just platforming and coin collecting

const level6 = {
    name: "Level 6 - Simple Coins",

    // PLATFORMS: Wide and forgiving platforms
    platforms: [
        { x: 0, y: 500, width: 500, height: 100 },        // Large starting platform
        { x: 600, y: 500, width: 400, height: 100 },      // Second platform
        { x: 1100, y: 480, width: 300, height: 120 },     // Slightly raised
        { x: 1500, y: 500, width: 400, height: 100 },     // Fourth platform
        { x: 2000, y: 500, width: 500, height: 100 }      // Final platform
    ],

    // ENEMIES: None - practice level
    enemies: [],

    // COLLECTIBLES: Plenty of coins to collect
    collectibles: [
        { x: 200, y: 420, type: 'coin', collected: false },
        { x: 350, y: 420, type: 'coin', collected: false },
        { x: 700, y: 420, type: 'coin', collected: false },
        { x: 850, y: 420, type: 'coin', collected: false },
        { x: 1200, y: 400, type: 'coin', collected: false },
        { x: 1350, y: 400, type: 'coin', collected: false },
        { x: 1650, y: 420, type: 'coin', collected: false },
        { x: 2200, y: 420, type: 'coin', collected: false }
    ],

    powerUps: [],

    goal: { x: 2400, y: 420 }
};
