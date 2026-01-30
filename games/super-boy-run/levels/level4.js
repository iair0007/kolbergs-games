// ==================================================
// LEVEL 4 - EXPERT JUMPS
// ==================================================
// Precise platforming with narrow platforms and moving obstacles

const level4 = {
    name: "Level 4 - Expert Jumps",

    // PLATFORMS: Mix of narrow platforms and moving platforms
    platforms: [
        { x: 0, y: 500, width: 250, height: 100 },
        { x: 400, y: 480, width: 100, height: 20 },       // Narrow platform - precise jump needed
        { x: 600, y: 450, width: 100, height: 20 },       // Another narrow platform
        { x: 800, y: 420, width: 100, height: 20 },
        { x: 1000, y: 500, width: 200, height: 100 },

        // Moving platform (vertical) - harder to land on!
        { x: 1350, y: 400, width: 120, height: 20, moving: true, vy: 2, moveRange: { min: 300, max: 450 } },

        { x: 1600, y: 500, width: 150, height: 100 },
        { x: 1850, y: 450, width: 100, height: 20 },
        { x: 2050, y: 500, width: 300, height: 100 },
        { x: 2450, y: 450, width: 150, height: 150 },
        { x: 2700, y: 500, width: 400, height: 100 }
    ],

    // ENEMIES: More enemies!
    enemies: [
        { x: 450, y: 430, vx: 2, patrol: { min: 400, max: 500 } },   // Guards narrow platforms
        { x: 1100, y: 450, vx: 2, patrol: { min: 1000, max: 1200 } },
        { x: 1700, y: 450, vx: 3, patrol: { min: 1600, max: 1750 } },  // Fast enemy
        { x: 2150, y: 450, vx: 2, patrol: { min: 2050, max: 2250 } }
    ],

    // COLLECTIBLES
    collectibles: [
        { x: 450, y: 400, type: 'coin', collected: false },
        { x: 650, y: 370, type: 'coin', collected: false },
        { x: 850, y: 340, type: 'coin', collected: false },
        { x: 1900, y: 370, type: 'coin', collected: false },
        { x: 2850, y: 420, type: 'coin', collected: false }
    ],

    // POWER-UPS
    powerUps: [
        { x: 400, y: 370, type: 'star', collected: false },  // Star power-up near the end
        { x: 2500, y: 370, type: 'star', collected: false }  // Star power-up near the end
    ],

    goal: { x: 3000, y: 420 }
};
