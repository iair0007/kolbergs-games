// ==================================================
// LEVEL 3 - MOVING OBSTACLES
// ==================================================
// Introduces moving platforms and the star power-up!

const level3 = {
    name: "Level 3 - Moving Obstacles",

    // PLATFORMS: Some platforms move!
    // moving: true means the platform moves
    // vy: vertical velocity (positive = down, negative = up)
    // vx: horizontal velocity (positive = right, negative = left)
    // moveRange: min/max coordinates the platform moves between
    platforms: [
        { x: 0, y: 500, width: 300, height: 100 },

        // Moving platform (vertical) - bounces up and down (slower for kids)
        { x: 450, y: 450, width: 120, height: 20, moving: true, vy: 1.5, moveRange: { min: 350, max: 500 } },

        { x: 700, y: 500, width: 150, height: 100 },

        // Moving platform (horizontal) - slides left and right (slower for kids)
        { x: 1000, y: 400, width: 120, height: 20, moving: true, vx: 2, moveRange: { min: 900, max: 1150 } },

        { x: 1400, y: 500, width: 200, height: 100 },
        { x: 1700, y: 450, width: 150, height: 150 },
        { x: 1950, y: 500, width: 800, height: 100 }
    ],

    // ENEMIES
    // Slower enemies for 4-year-olds
    enemies: [
        { x: 750, y: 450, vx: 1, patrol: { min: 700, max: 900 } },        // Slower, wider patrol
        { x: 1500, y: 450, vx: 1.5, patrol: { min: 1400, max: 1650 } }   // Slightly faster but wider range
    ],

    // COLLECTIBLES
    collectibles: [
        { x: 470, y: 370, type: 'coin', collected: false },
        { x: 1020, y: 320, type: 'coin', collected: false },
        { x: 1750, y: 370, type: 'coin', collected: false },
        { x: 2300, y: 420, type: 'coin', collected: false }
    ],

    // POWER-UPS: First star appears!
    // Star gives you flying ability for 5 seconds
    powerUps: [
        { x: 2100, y: 380, type: 'star', collected: false }  // ⭐ Flying power-up!
    ],

    goal: { x: 2600, y: 420 }
};
