// ==================================================
// LEVEL 5 - THE FINAL CHALLENGE
// ==================================================
// The longest and hardest level with everything combined!
// Length: 3900px (almost twice as long as level 1!)

const level5 = {
    name: "Level 5 - The Final Challenge",

    // PLATFORMS: Complex mix of moving and stationary platforms
    platforms: [
        { x: 0, y: 500, width: 200, height: 100 },
        { x: 300, y: 450, width: 80, height: 20 },

        // Moving platform (horizontal) - slower for kids
        { x: 480, y: 400, width: 80, height: 20, moving: true, vx: 1.5, moveRange: { min: 400, max: 600 } },

        { x: 700, y: 480, width: 100, height: 20 },
        { x: 900, y: 400, width: 100, height: 20 },
        { x: 1100, y: 500, width: 150, height: 100 },

        // Moving platform (vertical) - slower for kids
        { x: 1350, y: 450, width: 80, height: 20, moving: true, vy: 1.5, moveRange: { min: 350, max: 500 } },

        { x: 1550, y: 400, width: 100, height: 20 },
        { x: 1750, y: 350, width: 80, height: 20 },

        // Moving platform (horizontal) - slower for kids
        { x: 1930, y: 500, width: 120, height: 20, moving: true, vx: 2, moveRange: { min: 1850, max: 2050 } },

        { x: 2250, y: 480, width: 150, height: 20 },
        { x: 2500, y: 500, width: 200, height: 100 },
        { x: 2800, y: 450, width: 100, height: 150 },

        // Another moving platform - slower
        { x: 3000, y: 400, width: 150, height: 20, moving: true, vx: 1.5, moveRange: { min: 2900, max: 3200 } },

        { x: 3400, y: 500, width: 600, height: 100 }  // Final big platform
    ],

    // ENEMIES: Slower and wider patrols for 4-year-olds
    enemies: [
        { x: 350, y: 400, vx: 1, patrol: { min: 300, max: 420 } },        // Wider patrol
        { x: 750, y: 430, vx: 1, patrol: { min: 700, max: 850 } },        // Wider patrol
        { x: 1150, y: 450, vx: 1.5, patrol: { min: 1100, max: 1300 } },   // Slower, wider
        { x: 1600, y: 350, vx: 1, patrol: { min: 1550, max: 1700 } },     // Wider patrol
        { x: 2600, y: 450, vx: 1, patrol: { min: 2500, max: 2750 } },     // Wider patrol
        { x: 3600, y: 450, vx: 1.5, patrol: { min: 3400, max: 3850 } }    // Slower, wider
    ],

    // COLLECTIBLES: 7 coins scattered throughout
    collectibles: [
        { x: 340, y: 370, type: 'coin', collected: false },
        { x: 730, y: 400, type: 'coin', collected: false },
        { x: 950, y: 320, type: 'coin', collected: false },
        { x: 1800, y: 270, type: 'coin', collected: false },
        { x: 2350, y: 400, type: 'coin', collected: false },
        { x: 3100, y: 320, type: 'coin', collected: false },
        { x: 3700, y: 420, type: 'coin', collected: false }
    ],

    // POWER-UPS: 2 stars! Use them wisely to fly over difficult sections
    powerUps: [
        { x: 1200, y: 420, type: 'star', collected: false },  // First star - early game
        { x: 2850, y: 370, type: 'star', collected: false }   // Second star - late game
    ],

    goal: { x: 3900, y: 420 }  // Victory at the end of a long journey!
};
