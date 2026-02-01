// ===========================
// GAME CONSTANTS & SETTINGS
// ===========================
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const PLAYER_WIDTH = 48;
const PLAYER_HEIGHT = 64;
const MAX_JUMP_HOLD_TIME = 500; // ms
const FLY_SPEED = 3;

// DEFAULT SETTINGS (can be overridden by user)
const DEFAULT_SETTINGS = {
    startLevel: 0,
    playerSpeed: 1.5,         // Slower for 4-year-old (was 2.5)
    jumpStrength: 14,         // Gentler jumps for young kids (was 17)
    maxJumpStrength: 16,      // Max jump adjusted accordingly (was 20)
    minJumpStrength: 8,
    gravity: 0.4,             // Reduced for floatier feel (was 0.5)
    startingLives: 8,         // More forgiving for young players (was 5)
    flyDuration: 7000,  // milliseconds
    difficultyMultiplier: 1.0 // Scaling factor per level
};

// Current game settings (loaded from localStorage or defaults)
let GameSettings = { ...DEFAULT_SETTINGS };

// Dynamic constants (updated from settings)
let GRAVITY = GameSettings.gravity;
let BASE_JUMP_STRENGTH = -GameSettings.jumpStrength;
let MAX_JUMP_STRENGTH = -GameSettings.maxJumpStrength;
let MIN_JUMP_STRENGTH = -GameSettings.minJumpStrength;
let PLAYER_SPEED = GameSettings.playerSpeed;
let FLY_DURATION = GameSettings.flyDuration;
let DIFFICULTY = 1.0;

// ===========================
// GAME STATE
// ===========================
const GameState = {
    currentLevel: 0,
    lives: 5,
    score: 0,
    gameRunning: false,
    paused: false,
    camera: { x: 0, y: 0 },
    powerUp: { type: null, timeLeft: 0 },
    testMode: false
};

// ===========================
// PLAYER OBJECT
// ===========================
const Player = {
    x: 100,
    y: 400,
    vx: 0,
    vy: 0,
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
    grounded: false,
    direction: 1, // 1 = right, -1 = left
    state: 'running', // 'running', 'jumping', 'falling', 'flying', 'win', 'lose'
    animFrame: 0,
    animTimer: 0,
    jumpPressTime: 0,
    jumpHeld: false
};

// ===========================
// INPUT HANDLING
// ===========================
const Keys = {
    left: false,
    right: false,
    jump: false,
    shift: false
};

// Keyboard controls
document.addEventListener('keydown', (e) => {
    if (e.code === 'ArrowLeft') Keys.left = true;
    if (e.code === 'ArrowRight') Keys.right = true;
    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') Keys.shift = true;
    if (e.code === 'ArrowUp' || e.code === 'Space') {
        if (!Keys.jump && Player.grounded) {
            Player.jumpPressTime = Date.now();
            Player.jumpHeld = true;
        }
        Keys.jump = true;
        e.preventDefault();
    }
});

document.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowLeft') Keys.left = false;
    if (e.code === 'ArrowRight') Keys.right = false;
    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') Keys.shift = false;
    if (e.code === 'ArrowUp' || e.code === 'Space') {
        Keys.jump = false;
        Player.jumpHeld = false;
    }
});

// Touch controls
// Touch controls
const btnLeft = document.getElementById('btn-left');
const btnRight = document.getElementById('btn-right');
// btnJump removed - jumping is now tap-anywhere

// Directional buttons
btnLeft.addEventListener('touchstart', (e) => { e.preventDefault(); Keys.left = true; });
btnLeft.addEventListener('touchend', (e) => { e.preventDefault(); Keys.left = false; });
btnRight.addEventListener('touchstart', (e) => { e.preventDefault(); Keys.right = true; });
btnRight.addEventListener('touchend', (e) => { e.preventDefault(); Keys.right = false; });

// Global touch handler for Jumping (Tap Anywhere)
let jumpTouchId = null;

document.addEventListener('touchstart', (e) => {
    // Also ignore if game not running or paused
    if (!GameState.gameRunning || GameState.paused) return;

    // Find a touch that is NOT on controls
    for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        const target = touch.target;

        // If this touch is NOT control button
        if (!target.closest('.control-btn') && !target.closest('button')) {
            jumpTouchId = touch.identifier;
            Player.jumpPressTime = Date.now();
            Player.jumpHeld = true;
            Keys.jump = true;
            break; // Only need one jump touch
        }
    }
}, { passive: false });

document.addEventListener('touchend', (e) => {
    // Check if the jump touch ended
    if (jumpTouchId !== null) {
        for (let i = 0; i < e.changedTouches.length; i++) {
            if (e.changedTouches[i].identifier === jumpTouchId) {
                Keys.jump = false;
                Player.jumpHeld = false;
                jumpTouchId = null;
                break;
            }
        }
    }
}, { passive: false });

// Loop to clear jump if lost (unlikely but safe)
document.addEventListener('touchcancel', (e) => {
    if (jumpTouchId !== null) {
        for (let i = 0; i < e.changedTouches.length; i++) {
            if (e.changedTouches[i].identifier === jumpTouchId) {
                Keys.jump = false;
                Player.jumpHeld = false;
                jumpTouchId = null;
                break;
            }
        }
    }
});

// ===========================
// CANVAS SETUP
// ===========================
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = GAME_WIDTH;
    canvas.height = GAME_HEIGHT;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// ===========================
// ASSET LOADING
// ===========================
// SPRITES: Character images for different states
const Sprites = {
    boyRunning: null,       // First running frame
    boyRunning2: null,      // Second running frame (for animation)
    boyJumpUp: null,        // Jump start/end frame
    boyJumpUp2: null,       // Mid-air jump frame
    boyJumpDown: null,      // Falling frame
    boyWin: null,           // Victory pose
    boyLose: null,          // Defeat pose
    boyFly: null,            // Flying with star power-up
    enemyGround: null,
    enemyFlying: null,
    coin: null,
    star: null
};

let assetsLoaded = false;

function loadAssets() {
    return new Promise((resolve) => {
        let loaded = 0;
        const total = 12;  // Updated: 8 char sprites + 4 new platform sprites

        function checkComplete() {
            loaded++;
            if (loaded === total) {
                assetsLoaded = true;
                resolve();
            }
        }

        const assetPath = '../../shared/assets/';
        const platformPath = '../../platform/images/';

        // Running animation frames (alternate between these)
        Sprites.boyRunning = new Image();
        Sprites.boyRunning.onload = checkComplete;
        Sprites.boyRunning.src = assetPath + 'boy_running.png';

        Sprites.boyRunning2 = new Image();
        Sprites.boyRunning2.onload = checkComplete;
        Sprites.boyRunning2.src = assetPath + 'boy_running2.png';

        // Jumping animation frames (alternate during jump)
        Sprites.boyJumpUp = new Image();
        Sprites.boyJumpUp.onload = checkComplete;
        Sprites.boyJumpUp.src = assetPath + 'boy_jumps_up.png';

        Sprites.boyJumpUp2 = new Image();
        Sprites.boyJumpUp2.onload = checkComplete;
        Sprites.boyJumpUp2.src = assetPath + 'boy_jumps_up2.png';

        Sprites.boyJumpDown = new Image();
        Sprites.boyJumpDown.onload = checkComplete;
        Sprites.boyJumpDown.src = assetPath + 'boy_jumps_down.png';

        Sprites.boyWin = new Image();
        Sprites.boyWin.onload = checkComplete;
        Sprites.boyWin.src = assetPath + 'boy_win.png';

        Sprites.boyLose = new Image();
        Sprites.boyLose.onload = checkComplete;
        Sprites.boyLose.src = assetPath + 'boy_lose.png';

        Sprites.boyFly = new Image();
        Sprites.boyFly.onload = checkComplete;
        Sprites.boyFly.src = assetPath + 'boy_fly.png';

        // Platform Images - Enemies & Collectibles
        Sprites.enemyGround = new Image();
        Sprites.enemyGround.onload = checkComplete;
        Sprites.enemyGround.src = platformPath + 'enemies/enemyRobot.png';

        Sprites.enemyFlying = new Image();
        Sprites.enemyFlying.onload = checkComplete;
        Sprites.enemyFlying.src = platformPath + 'enemies/flaying.png';

        Sprites.coin = new Image();
        Sprites.coin.onload = checkComplete;
        Sprites.coin.src = platformPath + 'others/coin.png';

        Sprites.star = new Image();
        Sprites.star.onload = checkComplete;
        Sprites.star.src = platformPath + 'others/star.png';
    });
}

// Level data loaded from external files
let currentLevelData = null;

// ===========================
// COLLISION DETECTION
// ===========================
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y;
}

// ===========================
// LOCAL STORAGE
// ===========================
function saveProgress() {
    localStorage.setItem('superBoyRun_lastLevel', GameState.currentLevel);
    localStorage.setItem('superBoyRun_highScore', GameState.score);
}

function loadProgress() {
    const lastLevel = localStorage.getItem('superBoyRun_lastLevel');
    const highScore = localStorage.getItem('superBoyRun_highScore');
    return {
        lastLevel: lastLevel ? parseInt(lastLevel) : null,
        highScore: highScore ? parseInt(highScore) : 0
    };
}

function clearProgress() {
    localStorage.removeItem('superBoyRun_lastLevel');
}

// ===========================
// SETTINGS MANAGEMENT
// ===========================
function loadSettings() {
    const saved = localStorage.getItem('superBoyRun_settings');
    if (saved) {
        try {
            GameSettings = { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
        } catch (e) {
            console.error('Failed to load settings:', e);
            GameSettings = { ...DEFAULT_SETTINGS };
        }
    } else {
        GameSettings = { ...DEFAULT_SETTINGS };
    }
    applySettings();
}

function saveSettings() {
    localStorage.setItem('superBoyRun_settings', JSON.stringify(GameSettings));
    applySettings();
}

function applySettings() {
    // Update dynamic constants
    GRAVITY = GameSettings.gravity;
    BASE_JUMP_STRENGTH = -GameSettings.jumpStrength;
    MAX_JUMP_STRENGTH = -GameSettings.maxJumpStrength;
    MIN_JUMP_STRENGTH = -GameSettings.minJumpStrength;
    PLAYER_SPEED = GameSettings.playerSpeed;
    FLY_DURATION = GameSettings.flyDuration;

    // Update UI
    updateSettingsUI();
}

function updateSettingsUI() {
    // Update sliders
    document.getElementById('speed-slider').value = GameSettings.playerSpeed;
    document.getElementById('speed-value').textContent = GameSettings.playerSpeed;

    document.getElementById('jump-slider').value = GameSettings.jumpStrength;
    document.getElementById('jump-value').textContent = GameSettings.jumpStrength;

    document.getElementById('maxjump-slider').value = GameSettings.maxJumpStrength;
    document.getElementById('maxjump-value').textContent = GameSettings.maxJumpStrength;

    document.getElementById('gravity-slider').value = GameSettings.gravity;
    document.getElementById('gravity-value').textContent = GameSettings.gravity;

    document.getElementById('lives-slider').value = GameSettings.startingLives;
    document.getElementById('lives-value').textContent = GameSettings.startingLives;

    document.getElementById('fly-slider').value = GameSettings.flyDuration / 1000;
    document.getElementById('fly-value').textContent = GameSettings.flyDuration / 1000;

    // Update level dropdown
    document.getElementById('level-select').value = GameSettings.startLevel;
}

function initializeLevelSelect() {
    const levelSelects = [
        document.getElementById('level-select'),       // Settings one
        document.getElementById('start-level-select')  // Start screen one
    ];

    // Create an array of objects with { originalIndex, levelData }
    const sortedLevels = LEVELS.map((level, index) => ({
        index: index,
        name: level.name
    })).sort((a, b) => {
        // Extract level number from name "Level X - ..."
        const matchA = a.name.match(/Level (\d+)/);
        const matchB = b.name.match(/Level (\d+)/);
        const numA = matchA ? parseInt(matchA[1]) : 0;
        const numB = matchB ? parseInt(matchB[1]) : 0;
        return numA - numB;
    });

    levelSelects.forEach(select => {
        if (!select) return;
        select.innerHTML = '';
        sortedLevels.forEach((levelObj) => {
            const option = document.createElement('option');
            option.value = levelObj.index;
            option.textContent = levelObj.name;
            select.appendChild(option);
        });
        // Set default value
        select.value = GameSettings.startLevel;

        // Add listener to sync changes
        select.addEventListener('change', (e) => {
            GameSettings.startLevel = parseInt(e.target.value);
            // Sync other selectors
            levelSelects.forEach(s => s && (s.value = GameSettings.startLevel));
            saveSettings();
        });
    });
}

function resetSettings() {
    GameSettings = { ...DEFAULT_SETTINGS };
    saveSettings();
}

function copySettingsToClipboard() {
    const code = `// Super Boy Run - Custom Settings
// Copy these values into main.js at the top to make permanent

const PLAYER_SPEED = ${GameSettings.playerSpeed};
const BASE_JUMP_STRENGTH = -${GameSettings.jumpStrength};
const MAX_JUMP_STRENGTH = -${GameSettings.maxJumpStrength};
const MIN_JUMP_STRENGTH = -${GameSettings.minJumpStrength};
const GRAVITY = ${GameSettings.gravity};
const FLY_DURATION = ${GameSettings.flyDuration}; // milliseconds

// Starting configuration:
// Default Lives: ${GameSettings.startingLives}
// Default Start Level: ${GameSettings.startLevel + 1}
`;

    navigator.clipboard.writeText(code).then(() => {
        alert('Settings copied to clipboard! ✅\n\nYou can paste these into main.js to make them permanent.');
    }).catch(err => {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = code;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        alert('Settings copied to clipboard! ✅');
    });
}

// ===========================
// GAME LOGIC
// ===========================
function resetPlayer() {
    Player.x = 100;
    Player.y = 400;
    Player.vx = 0;
    Player.vy = 0;
    Player.grounded = false;
    Player.state = 'running';
    Player.direction = 1;
    Player.jumpPressTime = 0;
    Player.jumpHeld = false;
}

function loadLevel(levelIndex) {
    GameState.currentLevel = levelIndex;
    currentLevelData = JSON.parse(JSON.stringify(LEVELS[levelIndex])); // Deep clone

    // Reset collectibles and power-ups
    currentLevelData.collectibles.forEach(c => c.collected = false);
    if (currentLevelData.powerUps) {
        currentLevelData.powerUps.forEach(p => p.collected = false);
    }

    // Reset enemies
    currentLevelData.enemies.forEach(e => {
        if (!e.originalX) e.originalX = e.x;
    });

    resetPlayer();
    GameState.camera.x = 0;
    GameState.camera.y = 0;
    GameState.powerUp = { type: null, timeLeft: 0 };

    updateUI();

    // Apply difficulty scaling
    // Level 0 = 0% increase, Level 10 = 50% increase (gentler for young players)
    // Formula: 1 + (LevelIndex * 0.05) - reduced from 0.1 for 4-year-olds
    DIFFICULTY = 1 + (levelIndex * 0.05);

    // Increase player speed slightly (2% per level, down from 5%)
    PLAYER_SPEED = GameSettings.playerSpeed * (1 + (levelIndex * 0.02));

    // Increase enemy speed
    currentLevelData.enemies.forEach(e => {
        if (e.vx) e.vx *= DIFFICULTY;
        if (e.patrol) {
            // Ensure patrol range is respected, but speed is higher
        }

        // Chance to add flying behavior to some enemies in higher levels
        if (levelIndex > 3 && Math.random() < (levelIndex * 0.1)) {
            // 10% chance per level above 3 to become a flyer if it wasn't
            if (e.type !== 'flying' && e.type !== 'jumping') {
                // Convert some ground enemies to jumpers/flyers
                // e.type = 'jumping'; // Let's not mutate type blindly as it needs assets
            }
        }
    });

    saveProgress();
}

function updateUI() {
    document.getElementById('lives').textContent = GameState.lives;
    document.getElementById('score').textContent = GameState.score;

    // Extract level number from name "Level X - ..."
    if (currentLevelData && currentLevelData.name) {
        const match = currentLevelData.name.match(/Level (\d+)/);
        document.getElementById('level').textContent = match ? match[1] : (GameState.currentLevel + 1);
    } else {
        document.getElementById('level').textContent = GameState.currentLevel + 1;
    }
}

function updatePlayer() {
    // Check if flying
    const isFlying = GameState.powerUp.type === 'star' && GameState.powerUp.timeLeft > 0;

    // Horizontal movement
    if (Keys.left) {
        Player.vx = -PLAYER_SPEED;
        Player.direction = -1;
    } else if (Keys.right) {
        Player.vx = PLAYER_SPEED;
        Player.direction = 1;
    } else {
        Player.vx = 0;
    }

    // Flying controls
    if (isFlying) {
        Player.state = 'flying';
        if (Keys.jump) {
            Player.vy = -FLY_SPEED; // Fly up
        } else {
            Player.vy = FLY_SPEED * 0.5; // Gentle descent
        }

        // Countdown power-up
        GameState.powerUp.timeLeft -= 16; // ~60fps
        if (GameState.powerUp.timeLeft <= 0) {
            GameState.powerUp.type = null;
        }
    } else {
        // Variable jump with hold time
        // FIXED: Allow jumpHeld to be reset when grounded for rapid consecutive jumps
        if (Player.grounded && Keys.jump && !Player.jumpHeld) {
            // Start new jump
            Player.jumpPressTime = Date.now();
            Player.jumpHeld = true;
        }

        if (Keys.jump && Player.grounded && Player.jumpHeld) {
            const holdDuration = Math.min(Date.now() - Player.jumpPressTime, MAX_JUMP_HOLD_TIME);
            const jumpStrength = MIN_JUMP_STRENGTH + (BASE_JUMP_STRENGTH - MIN_JUMP_STRENGTH) * (holdDuration / MAX_JUMP_HOLD_TIME);
            const finalJumpStrength = Math.min(jumpStrength, MAX_JUMP_STRENGTH);

            Player.vy = finalJumpStrength;
            Player.grounded = false;
            Player.jumpHeld = false; // Prevent continuous jumping
        }

        // Apply gravity
        Player.vy += GRAVITY;
    }

    // Update position
    Player.x += Player.vx;
    Player.y += Player.vy;

    // Update animation state
    if (isFlying) {
        Player.state = 'flying';
    } else if (!Player.grounded) {
        Player.state = Player.vy < 0 ? 'jumping' : 'falling';
    } else {
        Player.state = Player.vx !== 0 ? 'running' : 'running';
    }

    // Animation frame
    Player.animTimer++;
    if (Player.animTimer > 8) {
        Player.animTimer = 0;
        Player.animFrame = (Player.animFrame + 1) % 4;
    }

    // Ground collision
    Player.grounded = false;
    currentLevelData.platforms.forEach(platform => {
        if (checkCollision(Player, platform)) {
            // Check if player is falling onto platform
            if (Player.vy > 0 && Player.y + Player.height - Player.vy <= platform.y + 10) {
                Player.y = platform.y - Player.height;
                Player.vy = 0;
                Player.grounded = true;
            }
        }
    });

    // Check collectibles
    currentLevelData.collectibles.forEach(coin => {
        if (!coin.collected && checkCollision(Player, { x: coin.x - 15, y: coin.y - 15, width: 30, height: 30 })) {
            coin.collected = true;
            GameState.score += 10;
            updateUI();
        }
    });

    // Check power-ups
    if (currentLevelData.powerUps) {
        currentLevelData.powerUps.forEach(powerUp => {
            if (!powerUp.collected && checkCollision(Player, { x: powerUp.x - 20, y: powerUp.y - 20, width: 40, height: 40 })) {
                powerUp.collected = true;
                if (powerUp.type === 'star') {
                    GameState.powerUp = { type: 'star', timeLeft: FLY_DURATION };
                }
            }
        });
    }

    // Check enemies (only if not flying)
    if (!isFlying) {
        currentLevelData.enemies.forEach(enemy => {
            if (checkCollision(Player, { x: enemy.x - 20, y: enemy.y - 20, width: 40, height: 40 })) {
                loseLife();
            }
        });
    }

    // Check goal
    if (checkCollision(Player, { x: currentLevelData.goal.x - 25, y: currentLevelData.goal.y - 50, width: 50, height: 50 })) {
        winLevel();
    }

    // Fall off map
    if (Player.y > GAME_HEIGHT + 100) {
        loseLife();
    }

    // Update camera
    updateCamera();
}

function updateCamera() {
    // Camera follows player with offset
    const targetX = Player.x - GAME_WIDTH / 3;
    GameState.camera.x = Math.max(0, targetX);
}

function updateEnemies() {
    currentLevelData.enemies.forEach(enemy => {
        // Initialize enemy state if needed
        if (enemy.originalY === undefined) {
            enemy.originalY = enemy.y;
        }
        if (enemy.time === undefined) {
            enemy.time = Math.random() * Math.PI * 2; // Random start phase
        }

        // Horizontal patrol movement
        enemy.x += enemy.vx;

        // Patrol behavior
        if (enemy.x >= enemy.patrol.max) {
            enemy.vx = -Math.abs(enemy.vx);
        } else if (enemy.x <= enemy.patrol.min) {
            enemy.vx = Math.abs(enemy.vx);
        }

        // Type-specific movement
        if (enemy.type === 'flying') {
            // Flying enemies bob up and down in a sine wave
            enemy.time += 0.08;
            const bobAmount = enemy.bobAmount || 40;
            enemy.y = enemy.originalY + Math.sin(enemy.time) * bobAmount;
        } else if (enemy.type === 'jumping') {
            // Jumping enemies jump periodically
            enemy.time += 0.05;
            if (enemy.vy === undefined) enemy.vy = 0;
            if (enemy.grounded === undefined) enemy.grounded = true;

            // Apply gravity
            enemy.vy += 0.5;
            enemy.y += enemy.vy;

            // Ground check
            if (enemy.y >= enemy.originalY) {
                enemy.y = enemy.originalY;
                enemy.vy = 0;
                enemy.grounded = true;
            }

            // Jump at intervals
            if (enemy.grounded && Math.sin(enemy.time) > 0.95) {
                enemy.vy = -(enemy.jumpStrength || 10);
                enemy.grounded = false;
            }
        }
    });
}

function updatePlatforms() {
    currentLevelData.platforms.forEach(platform => {
        if (platform.moving) {
            // Horizontal movement
            if (platform.vx !== undefined) {
                platform.x += platform.vx;
                if (platform.x >= platform.moveRange.max || platform.x <= platform.moveRange.min) {
                    platform.vx = -platform.vx;
                }

                // Move player with platform if standing on it
                if (Player.grounded && checkCollision(Player, platform)) {
                    Player.x += platform.vx;
                }
            }

            // Vertical movement
            if (platform.vy !== undefined) {
                platform.y += platform.vy;
                if (platform.y >= platform.moveRange.max || platform.y <= platform.moveRange.min) {
                    platform.vy = -platform.vy;
                }

                // Move player with platform if standing on it
                if (Player.grounded && checkCollision(Player, platform)) {
                    Player.y += platform.vy;
                }
            }
        }
    });
}

function loseLife() {
    GameState.lives--;
    updateUI();

    if (GameState.lives <= 0) {
        gameOver();
    } else {
        resetPlayer();
        GameState.powerUp = { type: null, timeLeft: 0 };

        // Reset all collectibles and power-ups so they reappear
        currentLevelData.collectibles.forEach(c => c.collected = false);
        if (currentLevelData.powerUps) {
            currentLevelData.powerUps.forEach(p => p.collected = false);
        }
    }
}

function winLevel() {
    GameState.gameRunning = false;

    if (GameState.currentLevel < LEVELS.length - 1) {
        // Show level complete screen
        document.getElementById('level-score').textContent = `Score: ${GameState.score}`;
        showScreen('level-complete-screen');
    } else {
        // Victory!
        victory();
    }
}

function gameOver() {
    GameState.gameRunning = false;
    Player.state = 'lose';
    document.getElementById('final-score').textContent = `Final Score: ${GameState.score}`;
    showScreen('game-over-screen');
}

function victory() {
    Player.state = 'win';
    document.getElementById('total-score').textContent = `Total Score: ${GameState.score}`;
    showScreen('victory-screen');
    clearProgress(); // Clear saved progress on win
}

// ===========================
// RENDERING
// ===========================
function render() {
    // Clear canvas
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Apply camera transform
    ctx.save();
    ctx.translate(-GameState.camera.x, -GameState.camera.y);

    // Draw platforms
    currentLevelData.platforms.forEach(platform => {
        ctx.fillStyle = platform.moving ? '#8B4513' : '#654321';
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);

        // Platform top highlight
        ctx.fillStyle = platform.moving ? '#A0522D' : '#8B4513';
        ctx.fillRect(platform.x, platform.y, platform.width, 8);
    });

    // Draw collectibles
    currentLevelData.collectibles.forEach(coin => {
        if (!coin.collected) {
            // Draw coin image
            ctx.drawImage(Sprites.coin, coin.x - 12, coin.y - 12, 24, 24);
        }
    });

    // Draw power-ups
    if (currentLevelData.powerUps) {
        currentLevelData.powerUps.forEach(powerUp => {
            if (!powerUp.collected && powerUp.type === 'star') {
                // Draw star image
                ctx.drawImage(Sprites.star, powerUp.x - 15, powerUp.y - 15, 30, 30);

                // Sparkle effect (overlay)
                const sparkle = Math.sin(Date.now() / 200) * 0.3 + 0.7;
                ctx.globalAlpha = sparkle;
                // Add a glow effect
                ctx.shadowBlur = 10;
                ctx.shadowColor = "white";
                ctx.globalAlpha = 1;
                ctx.shadowBlur = 0;
            }
        });
    }

    // Draw enemies
    currentLevelData.enemies.forEach(enemy => {
        let sprite = Sprites.enemyGround;

        if (enemy.type === 'flying') {
            sprite = Sprites.enemyFlying;
        }

        // Draw enemy image
        // Assuming 40x40 size for enemies (matching previous 20px radius)
        ctx.drawImage(sprite, enemy.x - 20, enemy.y - 20, 40, 40);
    });



    // Draw goal
    const goal = currentLevelData.goal;
    ctx.fillStyle = '#00FF00';
    ctx.fillRect(goal.x - 25, goal.y - 50, 50, 50);
    ctx.fillStyle = '#32CD32';
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🏁', goal.x, goal.y - 15);

    // Draw player
    drawPlayer();

    ctx.restore();

    // Draw power-up timer
    if (GameState.powerUp.type === 'star' && GameState.powerUp.timeLeft > 0) {
        const timeLeft = Math.ceil(GameState.powerUp.timeLeft / 1000);
        ctx.fillStyle = 'rgba(255, 215, 0, 0.8)';
        ctx.fillRect(10, 60, 200, 40);
        ctx.fillStyle = '#000';
        ctx.font = 'bold 20px Fredoka, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`⭐ Flying: ${timeLeft}s`, 20, 85);
    }
}



function drawPlayer() {
    let sprite = Sprites.boyRunning;

    if (Player.state === 'flying') {
        sprite = Sprites.boyFly;
    } else if (Player.state === 'jumping') {
        // Alternate between jump frames for animation
        // Use boyJumpUp at start/end, boyJumpUp2 while in mid-air
        sprite = (Player.animFrame % 2 === 0) ? Sprites.boyJumpUp : Sprites.boyJumpUp2;
    } else if (Player.state === 'falling') {
        sprite = Sprites.boyJumpDown;
    } else if (Player.state === 'win') {
        sprite = Sprites.boyWin;
    } else if (Player.state === 'lose') {
        sprite = Sprites.boyLose;
    } else if (Player.state === 'running') {
        // Alternate between running frames for smooth animation
        sprite = (Player.animFrame % 2 === 0) ? Sprites.boyRunning : Sprites.boyRunning2;
    }

    if (sprite && sprite.complete) {
        ctx.save();
        ctx.translate(Player.x + Player.width / 2, Player.y + Player.height / 2);
        if (Player.direction === -1) {
            ctx.scale(-1, 1);
        }

        // Flying sparkle effect
        if (Player.state === 'flying') {
            ctx.globalAlpha = 0.8;
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#FFD700';
        }

        ctx.drawImage(sprite, -Player.width / 2, -Player.height / 2, Player.width, Player.height);
        ctx.restore();
    } else {
        // Fallback rectangle
        ctx.fillStyle = '#4169E1';
        ctx.fillRect(Player.x, Player.y, Player.width, Player.height);
    }
}

// ===========================
// GAME LOOP
// ===========================
function gameLoop() {
    if (GameState.gameRunning && !GameState.paused) {
        updatePlayer();
        updateEnemies();
        updatePlatforms();
    }

    render();
    requestAnimationFrame(gameLoop);
}

// ===========================
// SCREEN MANAGEMENT
// ===========================
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

function hideAllScreens() {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
}

// ===========================
// BUTTON HANDLERS
// ===========================
document.getElementById('btn-start').addEventListener('click', () => startGame(false));
document.getElementById('btn-continue').addEventListener('click', () => startGame(true));
document.getElementById('btn-next-level').addEventListener('click', nextLevel);
document.getElementById('btn-restart').addEventListener('click', restartGame);
document.getElementById('btn-menu').addEventListener('click', showMainMenu);
document.getElementById('btn-play-again').addEventListener('click', restartGame);
document.getElementById('btn-quit').addEventListener('click', () => {
    GameState.gameRunning = false;
    showMainMenu();
});

// Home button (top-left corner) - navigates to platform homepage
document.getElementById('btn-home').addEventListener('click', () => {
    window.location.href = '../../index.html';
});

// Settings panel handlers
document.getElementById('btn-settings').addEventListener('click', () => {
    showScreen('settings-screen');
});

document.getElementById('btn-close-settings').addEventListener('click', () => {
    saveSettings();
    showScreen('start-screen');
});

document.getElementById('btn-reset-settings').addEventListener('click', () => {
    if (confirm('Reset all settings to defaults?')) {
        resetSettings();
    }
});

document.getElementById('btn-copy-settings').addEventListener('click', () => {
    copySettingsToClipboard();
});

// Slider event listeners
document.getElementById('speed-slider').addEventListener('input', (e) => {
    GameSettings.playerSpeed = parseFloat(e.target.value);
    document.getElementById('speed-value').textContent = GameSettings.playerSpeed;
});

document.getElementById('jump-slider').addEventListener('input', (e) => {
    GameSettings.jumpStrength = parseFloat(e.target.value);
    document.getElementById('jump-value').textContent = GameSettings.jumpStrength;
});

document.getElementById('maxjump-slider').addEventListener('input', (e) => {
    GameSettings.maxJumpStrength = parseFloat(e.target.value);
    document.getElementById('maxjump-value').textContent = GameSettings.maxJumpStrength;
});

document.getElementById('gravity-slider').addEventListener('input', (e) => {
    GameSettings.gravity = parseFloat(e.target.value);
    document.getElementById('gravity-value').textContent = GameSettings.gravity;
});

document.getElementById('lives-slider').addEventListener('input', (e) => {
    GameSettings.startingLives = parseInt(e.target.value);
    document.getElementById('lives-value').textContent = GameSettings.startingLives;
});

document.getElementById('fly-slider').addEventListener('input', (e) => {
    GameSettings.flyDuration = parseInt(e.target.value) * 1000;
    document.getElementById('fly-value').textContent = parseInt(e.target.value);
});

// Remove old test mode keyboard shortcut
// (replaced by settings screen)

function nextLevel() {
    loadLevel(GameState.currentLevel + 1);
    hideAllScreens();
    GameState.gameRunning = true;
}

function hideAllScreens() {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    // Touch controls visibility is handled by CSS (media queries) or toggled elsewhere
    document.getElementById('touch-controls').style.removeProperty('display');
}

function startGame() {
    // Start game from selected level
    // If startGame() is called with no args, it relies on GameSettings
    GameState.lives = GameSettings.startingLives;
    GameState.score = 0;
    GameState.currentLevel = GameSettings.startLevel;
    loadLevel(GameState.currentLevel);
    hideAllScreens();
    GameState.gameRunning = true;
    requestAnimationFrame(gameLoop);
}

function restartGame() {
    // Reset game state and restart from the beginning
    GameState.lives = GameSettings.startingLives;
    GameState.score = 0;
    GameState.currentLevel = GameSettings.startLevel;
    loadLevel(GameState.currentLevel);
    hideAllScreens();
    GameState.gameRunning = true;
}

function showMainMenu() {
    GameState.gameRunning = false;

    // Check if there's saved progress
    const progress = loadProgress();
    const continueBtn = document.getElementById('btn-continue');

    // Robust check for progress and LEVELS array availability
    if (progress && progress.lastLevel !== null && typeof LEVELS !== 'undefined' && progress.lastLevel < LEVELS.length - 1) {
        continueBtn.style.display = 'block';
        // Robust level number extraction
        let levelNum = progress.lastLevel + 1;
        if (LEVELS[progress.lastLevel]) {
            const levelName = LEVELS[progress.lastLevel].name;
            const match = levelName.match(/Level (\d+)/);
            if (match) levelNum = match[1];
        }
        continueBtn.textContent = `CONTINUE (Level ${levelNum})`;
    } else {
        continueBtn.style.display = 'none';
    }

    showScreen('start-screen');
}

// ===========================
// INITIALIZATION
// ===========================
async function init() {
    console.log('Super Boy Run - Loading...');

    // Load settings first
    loadSettings();
    initializeLevelSelect(); // Populate dropdown
    updateSettingsUI(); // Set initial value

    try {
        await loadAssets();
        console.log('Assets loaded!');
    } catch (e) {
        console.error('Error loading assets:', e);
    }

    // Initialize first level data using setting
    loadLevel(GameSettings.startLevel || 0);

    // Show menu
    showMainMenu();

    // Start loop
    gameLoop();
}

// Call init() directly - script is at end of body, DOM is ready
init();
