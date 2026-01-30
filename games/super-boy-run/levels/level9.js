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

    // ENEMIES: Jumping enemies that hop up and down
    enemies: [
        // Jumping enemy on second platform
        { x: 600, y: 450, vx: 2, patrol: { min: 470, max: 730 }, type: 'jumping', jumpStrength: 8 },

        // Jumping enemy with higher jumps
        { x: 950, y: 450, vx: 1.5, patrol: { min: 870, max: 1080 }, type: 'jumping', jumpStrength: 12 },

        // Jumping enemy on wide platform near end
        { x: 1600, y: 450, vx: 2, patrol: { min: 1520, max: 1780 }, type: 'jumping', jumpStrength: 10 },

        // Fast jumping enemy at the end
        { x: 2000, y: 450, vx: 2.5, patrol: { min: 1920, max: 2130 }, type: 'jumping', jumpStrength: 9 }
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
