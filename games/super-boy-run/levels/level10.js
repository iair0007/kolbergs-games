// ==================================================
// LEVEL 10 - MIXED ENEMIES
// ==================================================
// Combines all enemy types: ground, flying, and jumping

const level10 = {
    name: "Level 10 - Mixed Enemies",

    // PLATFORMS: Mix of static and moving
    platforms: [
        { x: 0, y: 500, width: 300, height: 100 },
        { x: 400, y: 500, width: 250, height: 100 },
        { x: 750, y: 480, width: 200, height: 120 },

        // Moving platform (slower for kids)
        { x: 1050, y: 450, width: 120, height: 20, moving: true, vx: 1.5, moveRange: { min: 1000, max: 1200 } },

        { x: 1350, y: 500, width: 250, height: 100 },
        { x: 1700, y: 480, width: 200, height: 120 },

        // Vertical moving platform (slower for kids)
        { x: 2000, y: 450, width: 120, height: 20, moving: true, vy: 1.5, moveRange: { min: 380, max: 500 } },

        { x: 2250, y: 500, width: 300, height: 100 },
        { x: 2650, y: 500, width: 600, height: 100 }
    ],

    // ENEMIES: Mix of all types! (Slower for 4-year-olds)
    enemies: [
        // Ground enemy
        { x: 500, y: 450, vx: 1, patrol: { min: 400, max: 650 } },

        // Flying enemy
        { x: 850, y: 380, vx: 1, patrol: { min: 750, max: 950 }, type: 'flying', bobAmount: 35 },

        // Jumping enemy
        { x: 1450, y: 450, vx: 1, patrol: { min: 1350, max: 1600 }, type: 'jumping', jumpStrength: 7 },

        // Flying enemy over moving platform area
        { x: 1800, y: 360, vx: 1.5, patrol: { min: 1700, max: 1900 }, type: 'flying', bobAmount: 40 },

        // Ground enemy at the end (slower)
        { x: 2850, y: 450, vx: 1.5, patrol: { min: 2650, max: 3070 } },

        // Jumping enemy near goal
        { x: 3000, y: 450, vx: 1, patrol: { min: 2880, max: 3120 }, type: 'jumping', jumpStrength: 8 }
    ],

    // COLLECTIBLES
    collectibles: [
        { x: 150, y: 420, type: 'coin', collected: false },
        { x: 500, y: 380, type: 'coin', collected: false },
        { x: 850, y: 300, type: 'coin', collected: false },
        { x: 1120, y: 370, type: 'coin', collected: false },
        { x: 1800, y: 280, type: 'coin', collected: false },
        { x: 2400, y: 420, type: 'coin', collected: false },
        { x: 2900, y: 380, type: 'coin', collected: false }
    ],

    // POWER-UPS
    powerUps: [
        { x: 2100, y: 350, type: 'star', collected: false }
    ],

    goal: { x: 3150, y: 420 }
};
