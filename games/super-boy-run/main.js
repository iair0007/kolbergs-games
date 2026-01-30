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
    playerSpeed: 4,
    jumpStrength: 12,
    maxJumpStrength: 14.5,
    minJumpStrength: 8,
    gravity: 0.5,
    startingLives: 5,
    flyDuration: 5000  // milliseconds
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
const btnLeft = document.getElementById('btn-left');
const btnRight = document.getElementById('btn-right');
const btnJump = document.getElementById('btn-jump');

btnLeft.addEventListener('touchstart', (e) => { e.preventDefault(); Keys.left = true; });
btnLeft.addEventListener('touchend', (e) => { e.preventDefault(); Keys.left = false; });
btnRight.addEventListener('touchstart', (e) => { e.preventDefault(); Keys.right = true; });
btnRight.addEventListener('touchend', (e) => { e.preventDefault(); Keys.right = false; });

btnJump.addEventListener('touchstart', (e) => {
    e.preventDefault();
    Player.jumpPressTime = Date.now();
    Player.jumpHeld = true;
    Keys.jump = true;
});

btnJump.addEventListener('touchend', (e) => {
    e.preventDefault();
    Keys.jump = false;
    Player.jumpHeld = false;
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
    boyFly: null            // Flying with star power-up
};

let assetsLoaded = false;

function loadAssets() {
    return new Promise((resolve) => {
        let loaded = 0;
        const total = 8;  // Updated from 6 to 8 (added 2 new sprites)

        function checkComplete() {
            loaded++;
            if (loaded === total) {
                assetsLoaded = true;
                resolve();
            }
        }

        const assetPath = '../../shared/assets/';

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

    // Update level buttons
    document.querySelectorAll('.level-btn').forEach(btn => {
        btn.classList.toggle('selected', parseInt(btn.dataset.level) === GameSettings.startLevel);
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
    saveProgress();
}

function updateUI() {
    document.getElementById('lives').textContent = GameState.lives;
    document.getElementById('score').textContent = GameState.score;
    document.getElementById('level').textContent = GameState.currentLevel + 1;
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
        enemy.x += enemy.vx;

        // Patrol behavior
        if (enemy.x >= enemy.patrol.max) {
            enemy.vx = -Math.abs(enemy.vx);
        } else if (enemy.x <= enemy.patrol.min) {
            enemy.vx = Math.abs(enemy.vx);
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
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(coin.x, coin.y, 12, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#FFA500';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    });

    // Draw power-ups
    if (currentLevelData.powerUps) {
        currentLevelData.powerUps.forEach(powerUp => {
            if (!powerUp.collected && powerUp.type === 'star') {
                // Draw star
                ctx.fillStyle = '#FFD700';
                ctx.strokeStyle = '#FFA500';
                ctx.lineWidth = 2;
                drawStar(ctx, powerUp.x, powerUp.y, 5, 20, 10);

                // Sparkle effect
                const sparkle = Math.sin(Date.now() / 200) * 0.3 + 0.7;
                ctx.globalAlpha = sparkle;
                ctx.fillStyle = '#FFFFFF';
                drawStar(ctx, powerUp.x, powerUp.y, 5, 15, 7);
                ctx.globalAlpha = 1;
            }
        });
    }

    // Draw enemies
    ctx.fillStyle = '#FF0000';
    currentLevelData.enemies.forEach(enemy => {
        ctx.beginPath();
        ctx.arc(enemy.x, enemy.y, 20, 0, Math.PI * 2);
        ctx.fill();

        // Evil eyes
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(enemy.x - 7, enemy.y - 5, 4, 0, Math.PI * 2);
        ctx.arc(enemy.x + 7, enemy.y - 5, 4, 0, Math.PI * 2);
        ctx.fill();
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

function drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
    let rot = Math.PI / 2 * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y);
        rot += step;

        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y);
        rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
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

// Level selection buttons
document.querySelectorAll('.level-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        GameSettings.startLevel = parseInt(btn.dataset.level);
        updateSettingsUI();
    });
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

function startGame(continue_from_save) {
    if (continue_from_save) {
        const progress = loadProgress();
        GameState.currentLevel = progress.lastLevel || 0;
    } else {
        GameState.lives = GameSettings.startingLives;  // Use settings
        GameState.score = 0;
        GameState.currentLevel = GameSettings.startLevel;  // Use settings
    }

    loadLevel(GameState.currentLevel);
    hideAllScreens();
    GameState.gameRunning = true;
}

function nextLevel() {
    loadLevel(GameState.currentLevel + 1);
    hideAllScreens();
    GameState.gameRunning = true;
}

function restartGame() {
    GameState.lives = GameSettings.startingLives;  // Use settings
    GameState.score = 0;
    loadLevel(GameState.currentLevel);
    hideAllScreens();
    GameState.gameRunning = true;
}

function showMainMenu() {
    GameState.gameRunning = false;

    // Check if there's saved progress
    const progress = loadProgress();
    const continueBtn = document.getElementById('btn-continue');
    if (progress.lastLevel !== null && progress.lastLevel < LEVELS.length - 1) {
        continueBtn.style.display = 'block';
        continueBtn.textContent = `CONTINUE (Level ${progress.lastLevel + 1})`;
    } else {
        continueBtn.style.display = 'none';
    }

    showScreen('start-screen');
}

// Remove old showLevelSelect function (replaced by settings screen)

// ===========================
// INITIALIZATION
// ===========================
async function init() {
    console.log('Super Boy Run - Loading...');

    // Load settings first
    loadSettings();

    await loadAssets();
    console.log('Assets loaded!');
    loadLevel(0);

    // Check for saved progress
    const progress = loadProgress();
    const continueBtn = document.getElementById('btn-continue');
    if (progress.lastLevel !== null && progress.lastLevel < LEVELS.length - 1) {
        continueBtn.style.display = 'block';
        continueBtn.textContent = `CONTINUE (Level ${progress.lastLevel + 1})`;
    }

    gameLoop();
}

window.onload = init;
