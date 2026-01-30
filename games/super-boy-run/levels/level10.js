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

        // Moving platform
        { x: 1050, y: 450, width: 120, height: 20, moving: true, vx: 2, moveRange: { min: 1000, max: 1200 } },

        { x: 1350, y: 500, width: 250, height: 100 },
        { x: 1700, y: 480, width: 200, height: 120 },

        // Vertical moving platform
        { x: 2000, y: 450, width: 120, height: 20, moving: true, vy: 2, moveRange: { min: 380, max: 500 } },

        { x: 2250, y: 500, width: 300, height: 100 },
        { x: 2650, y: 500, width: 600, height: 100 }
    ],

    // ENEMIES: Mix of all types!
    enemies: [
        // Ground enemy
        { x: 500, y: 450, vx: 2, patrol: { min: 420, max: 630 } },

        // Flying enemy
        { x: 850, y: 380, vx: 1.5, patrol: { min: 770, max: 930 }, type: 'flying', bobAmount: 35 },

        // Jumping enemy
        { x: 1450, y: 450, vx: 2, patrol: { min: 1370, max: 1580 }, type: 'jumping', jumpStrength: 10 },

        // Flying enemy over moving platform area
        { x: 1800, y: 360, vx: 2, patrol: { min: 1720, max: 1880 }, type: 'flying', bobAmount: 40 },

        // Fast ground enemy at the end
        { x: 2850, y: 450, vx: 3, patrol: { min: 2670, max: 3050 } },

        // Jumping enemy near goal
        { x: 3000, y: 450, vx: 2, patrol: { min: 2900, max: 3100 }, type: 'jumping', jumpStrength: 12 }
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
