// ==================================================
// LEVEL 8 - FLYING ENEMIES INTRO
// ==================================================
// First introduction to flying enemies that bob up and down

const level8 = {
    name: "Level 8 - Flying Enemies",

    // PLATFORMS
    platforms: [
        { x: 0, y: 500, width: 400, height: 100 },
        { x: 500, y: 500, width: 300, height: 100 },
        { x: 900, y: 480, width: 200, height: 120 },
        { x: 1200, y: 500, width: 300, height: 100 },
        { x: 1600, y: 500, width: 250, height: 100 },
        { x: 1950, y: 480, width: 200, height: 120 },
        { x: 2250, y: 500, width: 500, height: 100 }
    ],

    // ENEMIES: Flying enemies that bob up and down
    enemies: [
        // Flying enemy over second platform - slow and predictable
        { x: 650, y: 400, vx: 1.5, patrol: { min: 520, max: 780 }, type: 'flying', bobAmount: 30 },

        // Flying enemy with wider patrol
        { x: 1350, y: 380, vx: 2, patrol: { min: 1220, max: 1480 }, type: 'flying', bobAmount: 40 },

        // Flying enemy near the end
        { x: 2050, y: 360, vx: 1.5, patrol: { min: 1970, max: 2130 }, type: 'flying', bobAmount: 35 }
    ],

    // COLLECTIBLES
    collectibles: [
        { x: 200, y: 420, type: 'coin', collected: false },
        { x: 650, y: 320, type: 'coin', collected: false },   // Above flying enemy
        { x: 1000, y: 400, type: 'coin', collected: false },
        { x: 1350, y: 300, type: 'coin', collected: false },  // Above flying enemy
        { x: 1700, y: 420, type: 'coin', collected: false },
        { x: 2450, y: 420, type: 'coin', collected: false }
    ],

    // POWER-UPS: Star to help with flying enemies
    powerUps: [
        { x: 2350, y: 400, type: 'star', collected: false }
    ],

    goal: { x: 2650, y: 420 }
};
