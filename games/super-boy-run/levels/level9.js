// ==================================================
// LEVEL 9 - JUMPING ENEMIES INTRO
// ==================================================
// First introduction to jumping enemies that hop periodically

const level9 = {
    name: "Level 9 - Jumping Enemies",

    // PLATFORMS
    platforms: [
        { x: 0, y: 500, width: 350, height: 100 },
        { x: 450, y: 500, width: 300, height: 100 },
        { x: 850, y: 500, width: 250, height: 100 },
        { x: 1200, y: 480, width: 200, height: 120 },
        { x: 1500, y: 500, width: 300, height: 100 },
        { x: 1900, y: 500, width: 250, height: 100 },
        { x: 2250, y: 500, width: 500, height: 100 }
    ],

    // ENEMIES: Jumping enemies that hop up and down (slower for 4-year-olds)
    enemies: [
        // Jumping enemy on second platform
        { x: 600, y: 450, vx: 1, patrol: { min: 450, max: 750 }, type: 'jumping', jumpStrength: 6 },

        // Jumping enemy with lower jumps
        { x: 950, y: 450, vx: 1, patrol: { min: 850, max: 1100 }, type: 'jumping', jumpStrength: 8 },

        // Jumping enemy on wide platform near end
        { x: 1600, y: 450, vx: 1, patrol: { min: 1500, max: 1800 }, type: 'jumping', jumpStrength: 7 },

        // Jumping enemy at the end (slower)
        { x: 2000, y: 450, vx: 1.5, patrol: { min: 1900, max: 2150 }, type: 'jumping', jumpStrength: 7 }
    ],

    // COLLECTIBLES
    collectibles: [
        { x: 150, y: 420, type: 'coin', collected: false },
        { x: 550, y: 380, type: 'coin', collected: false },   // Time jump to get this
        { x: 900, y: 370, type: 'coin', collected: false },
        { x: 1300, y: 400, type: 'coin', collected: false },
        { x: 1700, y: 380, type: 'coin', collected: false },
        { x: 2450, y: 420, type: 'coin', collected: false }
    ],

    powerUps: [],

    goal: { x: 2650, y: 420 }
};
