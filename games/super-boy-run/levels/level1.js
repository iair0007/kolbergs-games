// ==================================================
// LEVEL 1 - TUTORIAL
// ==================================================
// This is the easiest level to introduce the player to the game mechanics

const level1 = {
    name: "Level 1 - Tutorial",

    // PLATFORMS: Where the player can stand
    // x, y: position (top-left corner)
    // width, height: size of the platform
    platforms: [
        { x: 0, y: 500, width: 600, height: 100 },        // Starting platform
        { x: 700, y: 500, width: 200, height: 100 },      // First gap to jump
        { x: 1000, y: 500, width: 300, height: 100 },     // Second platform
        { x: 1400, y: 450, width: 200, height: 150 },     // Slightly elevated platform
        { x: 1700, y: 500, width: 500, height: 100 }      // Final platform before goal
    ],

    // ENEMIES: Red moving obstacles that hurt the player
    // x, y: starting position
    // vx: horizontal velocity (speed of movement, positive = right, negative = left)
    // patrol: min/max x coordinates for the enemy to move between
    enemies: [],  // No enemies in tutorial level

    // COLLECTIBLES: Golden coins worth 10 points each
    // type: 'coin' for regular coins
    // collected: false means not yet collected
    collectibles: [
        { x: 400, y: 420, type: 'coin', collected: false },   // Coin on first platform
        { x: 800, y: 420, type: 'coin', collected: false },   // Coin after first gap
        { x: 1500, y: 370, type: 'coin', collected: false }   // Coin on elevated platform
    ],

    // POWER-UPS: Special items that give temporary abilities
    // type: 'star' gives flying ability for 5 seconds
    powerUps: [],  // No power-ups in tutorial

    // GOAL: Green flag that marks the end of the level
    goal: { x: 2000, y: 420 }
};
