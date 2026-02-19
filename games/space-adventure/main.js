/**
 * Space Adventure - Main Game Logic
 * Hebrew kid-friendly space shooter game
 */

// ==========================================
// AUDIO CONTEXT
// ==========================================
let audioContext = null;
let audioUnlocked = false;

function initAudioContext() {
    if (audioContext) return audioContext;
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        console.log('AudioContext created');
    } catch (e) {
        console.warn('Could not create AudioContext:', e);
    }
    return audioContext;
}

function unlockAudio() {
    if (audioUnlocked) return Promise.resolve();

    initAudioContext();

    return new Promise((resolve) => {
        if (audioContext && audioContext.state === 'suspended') {
            audioContext.resume().then(() => {
                console.log('AudioContext resumed');
                audioUnlocked = true;
                resolve();
            });
        } else {
            audioUnlocked = true;
            resolve();
        }
    });
}

// ==========================================
// GAME STATE
// ==========================================
const GameState = {
    score: 0,
    lives: 3,
    difficulty: 'medium',
    gameSpeed: 1,
    asteroids: [],
    enemies: [],
    coins: [],
    projectiles: [],
    particles: [],
    scorePopups: [],
    gameRunning: false,
    lastSpawnTime: 0,
    lastEnemySpawnTime: 0,
    lastCoinSpawnTime: 0,
    survivalTime: 0,
    highScore: 0
};

// Difficulty settings
const DifficultySettings = {
    easy: {
        lives: 5,
        asteroidSpeed: 0.8,       // Very slow for kids
        enemySpeed: 1.0,
        asteroidSpawnRate: 3000,   // Spawn less often
        enemySpawnRate: 7000,
        starSpawnRate: 1500,
        asteroidCount: 2
    },
    medium: {
        lives: 3,
        asteroidSpeed: 1.5,
        enemySpeed: 2.0,
        asteroidSpawnRate: 2000,
        enemySpawnRate: 4500,
        starSpawnRate: 2000,
        asteroidCount: 3
    },
    hard: {
        lives: 2,
        asteroidSpeed: 2.5,
        enemySpeed: 3.0,
        asteroidSpawnRate: 1200,
        enemySpawnRate: 3000,
        starSpawnRate: 2500,
        asteroidCount: 4
    }
};

// Player spaceship
const Player = {
    x: 100,
    y: 300,
    width: 60,
    height: 60,
    vx: 0,
    vy: 0,
    speed: 4,
    shooting: false
};

// Input tracking
const Keys = {
    up: false,
    down: false,
    left: false,
    right: false
};

// Canvas and context
let canvas, ctx;
let animationId;

// ==========================================
// INITIALIZATION
// ==========================================
function init() {
    canvas = document.getElementById('game-canvas');
    ctx = canvas.getContext('2d');

    // Load high score
    GameState.highScore = parseInt(localStorage.getItem('spaceAdventureHighScore') || '0');

    setupEventListeners();
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
}

function resizeCanvas() {
    const container = canvas.parentElement;
    const maxWidth = Math.min(800, window.innerWidth - 40);
    const maxHeight = Math.min(600, window.innerHeight - 150);
    const ratio = 800 / 600;

    let width = maxWidth;
    let height = width / ratio;

    if (height > maxHeight) {
        height = maxHeight;
        width = height * ratio;
    }

    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
}

function setupEventListeners() {
    // Difficulty selection
    document.querySelectorAll('.difficulty-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            GameState.difficulty = btn.dataset.difficulty;
        });
    });

    // Set default difficulty
    document.querySelector('.difficulty-btn[data-difficulty="medium"]').classList.add('selected');

    // Start game button
    const startBtn = document.getElementById('start-game');
    startBtn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        startGame();
    });

    // Play again button
    document.getElementById('play-again').addEventListener('click', startGame);

    // Back to menu button
    document.getElementById('back-to-menu').addEventListener('click', () => {
        showScreen('welcome-screen');
    });

    // Keyboard controls
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    // Touch controls
    const touchZones = document.querySelectorAll('.touch-zone');
    touchZones.forEach(zone => {
        zone.addEventListener('touchstart', handleTouchStart, { passive: false });
        zone.addEventListener('touchend', handleTouchEnd, { passive: false });
    });

    // Tap canvas to shoot
    canvas.addEventListener('click', shoot);
    canvas.addEventListener('touchstart', (e) => {
        // Only shoot if not touching a control button
        if (!e.target.closest('.touch-zone')) {
            e.preventDefault();
            shoot();
        }
    }, { passive: false });
}

// ==========================================
// INPUT HANDLERS
// ==========================================
function handleKeyDown(e) {
    if (!GameState.gameRunning) return;

    switch (e.key) {
        case 'ArrowUp':
            Keys.up = true;
            break;
        case 'ArrowDown':
            Keys.down = true;
            break;
        case 'ArrowLeft':
            Keys.left = true;
            break;
        case 'ArrowRight':
            Keys.right = true;
            break;
        case ' ':
            e.preventDefault();
            shoot();
            break;
    }
}

function handleKeyUp(e) {
    switch (e.key) {
        case 'ArrowUp':
            Keys.up = false;
            break;
        case 'ArrowDown':
            Keys.down = false;
            break;
        case 'ArrowLeft':
            Keys.left = false;
            break;
        case 'ArrowRight':
            Keys.right = false;
            break;
    }
}

function handleTouchStart(e) {
    e.preventDefault();
    if (!GameState.gameRunning) return;

    const action = e.target.closest('.touch-zone')?.dataset?.action;
    if (action === 'up') Keys.up = true;
    else if (action === 'down') Keys.down = true;
    else if (action === 'left') Keys.left = true;
    else if (action === 'right') Keys.right = true;
    else if (action === 'fire') shoot();
}

function handleTouchEnd(e) {
    e.preventDefault();
    const action = e.target.closest('.touch-zone')?.dataset?.action;
    if (action === 'up') Keys.up = false;
    else if (action === 'down') Keys.down = false;
    else if (action === 'left') Keys.left = false;
    else if (action === 'right') Keys.right = false;
}

// ==========================================
// SCREEN NAVIGATION
// ==========================================
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

// ==========================================
// GAME LOGIC
// ==========================================
function startGame() {
    unlockAudio().then(() => {
        // Reset game state
        const settings = DifficultySettings[GameState.difficulty];
        GameState.score = 0;
        GameState.lives = settings.lives;
        GameState.gameSpeed = 1;
        GameState.asteroids = [];
        GameState.enemies = [];
        GameState.coins = [];
        GameState.projectiles = [];
        GameState.particles = [];
        GameState.scorePopups = [];
        GameState.gameRunning = true;
        GameState.lastSpawnTime = Date.now();
        GameState.lastEnemySpawnTime = Date.now();
        GameState.lastCoinSpawnTime = Date.now();
        GameState.survivalTime = Date.now();

        // Reset player
        Player.x = 100;
        Player.y = 300;
        Player.vx = 0;
        Player.vy = 0;

        // Reset keys
        Keys.up = false;
        Keys.down = false;
        Keys.left = false;
        Keys.right = false;

        // Update UI
        updateHUD();
        showScreen('game-screen');

        // Start game loop
        gameLoop();
    });
}

function gameLoop() {
    if (!GameState.gameRunning) return;

    update();
    render();

    animationId = requestAnimationFrame(gameLoop);
}

function update() {
    const now = Date.now();
    const settings = DifficultySettings[GameState.difficulty];

    // Calculate velocity from keys
    Player.vy = 0;
    Player.vx = 0;
    if (Keys.up) Player.vy = -Player.speed;
    if (Keys.down) Player.vy = Player.speed;
    if (Keys.left) Player.vx = -Player.speed;
    if (Keys.right) Player.vx = Player.speed;

    // Update player position (clamped to screen)
    Player.x += Player.vx;
    Player.y += Player.vy;
    Player.x = Math.max(0, Math.min(canvas.width - Player.width, Player.x));
    Player.y = Math.max(0, Math.min(canvas.height - Player.height, Player.y));

    // Spawn asteroids
    if (now - GameState.lastSpawnTime > settings.asteroidSpawnRate) {
        spawnAsteroid();
        GameState.lastSpawnTime = now;
    }

    // Spawn enemies (varied types)
    if (now - GameState.lastEnemySpawnTime > settings.enemySpawnRate) {
        spawnEnemy();
        GameState.lastEnemySpawnTime = now;
    }

    // Spawn coins
    if (now - GameState.lastCoinSpawnTime > 1800) {
        spawnCoin();
        GameState.lastCoinSpawnTime = now;
    }

    // Update asteroids
    for (let i = GameState.asteroids.length - 1; i >= 0; i--) {
        const asteroid = GameState.asteroids[i];
        asteroid.x -= asteroid.speed * GameState.gameSpeed;
        asteroid.rotation += 0.02;

        if (asteroid.x + asteroid.width < 0) {
            GameState.asteroids.splice(i, 1);
            continue;
        }

        if (checkCollision(Player, asteroid)) {
            GameState.asteroids.splice(i, 1);
            loseLife();
            createExplosion(asteroid.x, asteroid.y);
        }
    }

    // Update enemies
    for (let i = GameState.enemies.length - 1; i >= 0; i--) {
        const enemy = GameState.enemies[i];
        enemy.x -= enemy.speed * GameState.gameSpeed;

        // Different movement patterns per type
        if (enemy.type === 'ufo') {
            enemy.y += Math.sin(now * 0.003 + enemy.offset) * 1.5;
        } else if (enemy.type === 'alien') {
            enemy.y += Math.cos(now * 0.004 + enemy.offset) * 2;
        } else if (enemy.type === 'bug') {
            enemy.y += Math.sin(now * 0.008 + enemy.offset) * 3;
        }

        if (enemy.x + enemy.width < 0) {
            GameState.enemies.splice(i, 1);
            continue;
        }

        if (checkCollision(Player, enemy)) {
            GameState.enemies.splice(i, 1);
            loseLife();
            createExplosion(enemy.x, enemy.y);
        }
    }

    // Update coins
    for (let i = GameState.coins.length - 1; i >= 0; i--) {
        const coin = GameState.coins[i];
        coin.x -= coin.speed * GameState.gameSpeed;
        coin.rotation += 0.05;
        coin.bobPhase += 0.05;

        if (coin.x + coin.width < 0) {
            GameState.coins.splice(i, 1);
            continue;
        }

        if (checkCollision(Player, coin)) {
            GameState.coins.splice(i, 1);
            GameState.score += 50;
            updateHUD();
            createScorePopup(coin.x, coin.y, '+50 🪙');
            createSparkles(coin.x, coin.y);
        }
    }

    // Update projectiles
    for (let i = GameState.projectiles.length - 1; i >= 0; i--) {
        const projectile = GameState.projectiles[i];
        projectile.x += projectile.speed;

        if (projectile.x > canvas.width) {
            GameState.projectiles.splice(i, 1);
            continue;
        }

        let hit = false;

        // Check collision with asteroids
        for (let j = GameState.asteroids.length - 1; j >= 0; j--) {
            const asteroid = GameState.asteroids[j];
            if (checkCollision(projectile, asteroid)) {
                GameState.projectiles.splice(i, 1);
                GameState.asteroids.splice(j, 1);
                GameState.score += 100;
                updateHUD();
                createExplosion(asteroid.x, asteroid.y);
                createScorePopup(asteroid.x, asteroid.y, '+100 💥');
                hit = true;
                break;
            }
        }

        if (hit) continue;

        // Check collision with enemies
        for (let j = GameState.enemies.length - 1; j >= 0; j--) {
            const enemy = GameState.enemies[j];
            if (checkCollision(projectile, enemy)) {
                GameState.projectiles.splice(i, 1);
                enemy.hp--;
                createExplosion(enemy.x, enemy.y);

                if (enemy.hp <= 0) {
                    const points = enemy.type === 'ufo' ? 200 : enemy.type === 'alien' ? 300 : 150;
                    GameState.enemies.splice(j, 1);
                    GameState.score += points;
                    updateHUD();
                    createScorePopup(enemy.x, enemy.y, `+${points} ⭐`);
                }
                hit = true;
                break;
            }
        }
    }

    // Update particles
    for (let i = GameState.particles.length - 1; i >= 0; i--) {
        const particle = GameState.particles[i];
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life -= 1;
        particle.alpha -= 0.02;

        if (particle.life <= 0 || particle.alpha <= 0) {
            GameState.particles.splice(i, 1);
        }
    }

    // Update score popups
    for (let i = GameState.scorePopups.length - 1; i >= 0; i--) {
        const popup = GameState.scorePopups[i];
        popup.y -= 1.5;
        popup.life -= 1;
        popup.alpha -= 0.02;

        if (popup.life <= 0 || popup.alpha <= 0) {
            GameState.scorePopups.splice(i, 1);
        }
    }

    // Survival bonus (every second)
    if (now - GameState.survivalTime > 1000) {
        GameState.score += 10;
        GameState.survivalTime = now;
        updateHUD();
    }

    // Gentler difficulty progression - caps at 1.6x speed
    GameState.gameSpeed = 1 + Math.min(Math.floor(GameState.score / 1500) * 0.1, 0.6);
}

function render() {
    // Clear canvas
    ctx.fillStyle = '#0a0e27';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw stars background (parallax effect)
    drawStarfield();

    // Draw player spaceship
    drawPlayer();

    // Draw asteroids
    GameState.asteroids.forEach(asteroid => {
        drawAsteroid(asteroid);
    });

    // Draw enemies (varied types)
    GameState.enemies.forEach(enemy => {
        drawEnemy(enemy);
    });

    // Draw coins
    GameState.coins.forEach(coin => {
        drawCoin(coin);
    });

    // Draw projectiles
    GameState.projectiles.forEach(projectile => {
        drawProjectile(projectile);
    });

    // Draw particles
    GameState.particles.forEach(particle => {
        drawParticle(particle);
    });

    // Draw score popups
    GameState.scorePopups.forEach(popup => {
        drawScorePopup(popup);
    });
}

// ==========================================
// DRAWING FUNCTIONS
// ==========================================
function drawStarfield() {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    for (let i = 0; i < 50; i++) {
        const x = (i * 37 + Date.now() * 0.01) % canvas.width;
        const y = (i * 53) % canvas.height;
        const size = (i % 3) + 1;
        ctx.fillRect(x, y, size, size);
    }
}

function drawPlayer() {
    // Draw spaceship (simple rocket shape)
    ctx.save();
    ctx.translate(Player.x + Player.width / 2, Player.y + Player.height / 2);

    // Body
    ctx.fillStyle = '#4facfe';
    ctx.beginPath();
    ctx.moveTo(20, 0);
    ctx.lineTo(-20, -15);
    ctx.lineTo(-20, 15);
    ctx.closePath();
    ctx.fill();

    // Window
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(5, 0, 8, 0, Math.PI * 2);
    ctx.fill();

    // Flames
    const flameSize = Math.random() * 5 + 10;
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.moveTo(-20, -8);
    ctx.lineTo(-20 - flameSize, 0);
    ctx.lineTo(-20, 8);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
}

function drawAsteroid(asteroid) {
    ctx.save();
    // Center translation based on width/height/size
    const radius = asteroid.size ? asteroid.size / 2 : asteroid.width / 2;
    ctx.translate(asteroid.x + radius, asteroid.y + radius);
    ctx.rotate(asteroid.rotation);

    // Draw rock-like shape with craters
    ctx.fillStyle = '#8b7355'; // Brown base
    // Draw circle base but slightly irregular
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();

    // Craters (darker spots)
    ctx.fillStyle = '#6b5335';
    ctx.beginPath();
    ctx.arc(-radius / 2, -radius / 4, radius / 3, 0, Math.PI * 2);
    ctx.arc(radius / 3, radius / 6, radius / 4, 0, Math.PI * 2);
    ctx.arc(-radius / 5, radius / 3, radius / 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

function drawEnemy(enemy) {
    ctx.save();
    ctx.translate(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);

    if (enemy.type === 'ufo') {
        // UFO - Classic flying saucer
        // Dome (glass)
        ctx.fillStyle = '#a8e6cf';
        ctx.beginPath();
        ctx.arc(0, -10, 15, Math.PI, 0);
        ctx.fill();

        // Saucer body
        ctx.fillStyle = '#ff8b94';
        ctx.beginPath();
        ctx.ellipse(0, 5, 30, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        // Blinking lights
        const blinkOn = Math.floor(Date.now() / 200) % 2 === 0;
        ctx.fillStyle = blinkOn ? '#fff' : '#ffd3b6';
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.arc(-20 + i * 20, 5, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    } else if (enemy.type === 'alien') {
        // Alien Ship - Menacing triangle
        ctx.fillStyle = '#7bed9f';
        ctx.beginPath();
        ctx.moveTo(-25, 15);
        ctx.lineTo(0, -20);
        ctx.lineTo(25, 15);
        ctx.closePath();
        ctx.fill();

        // Alien eye
        ctx.fillStyle = '#ff4757';
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI * 2);
        ctx.fill();

        // Pupil
        ctx.fillStyle = '#2f3542';
        ctx.beginPath();
        ctx.arc(0, 0, 4, 0, Math.PI * 2);
        ctx.fill();

        // Glow effect
        ctx.strokeStyle = 'rgba(123, 237, 159, 0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-25, 15);
        ctx.lineTo(0, -20);
        ctx.lineTo(25, 15);
        ctx.closePath();
        ctx.stroke();
    } else if (enemy.type === 'bug') {
        // Space Bug - Insect-like creature
        // Body segments
        ctx.fillStyle = '#e056fd';
        ctx.beginPath();
        ctx.arc(0, 0, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(-15, 0, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(-27, 0, 8, 0, Math.PI * 2);
        ctx.fill();

        // Wings (flapping)
        const wingFlap = Math.sin(Date.now() * 0.02) * 5;
        ctx.fillStyle = 'rgba(224, 86, 253, 0.4)';
        ctx.beginPath();
        ctx.ellipse(0, -15 - wingFlap, 15, 8, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(0, 15 + wingFlap, 15, 8, 0.3, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(8, -5, 4, 0, Math.PI * 2);
        ctx.arc(8, 5, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#2f3542';
        ctx.beginPath();
        ctx.arc(9, -5, 2, 0, Math.PI * 2);
        ctx.arc(9, 5, 2, 0, Math.PI * 2);
        ctx.fill();
    }

    // HP indicator for enemies with >1 HP
    if (enemy.hp > 1) {
        ctx.fillStyle = '#ff4757';
        for (let i = 0; i < enemy.hp; i++) {
            ctx.beginPath();
            ctx.arc(-10 + i * 10, -25, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    ctx.restore();
}

function drawCoin(coin) {
    ctx.save();
    ctx.translate(coin.x + coin.width / 2, coin.y + coin.height / 2 + Math.sin(coin.bobPhase) * 3);
    ctx.rotate(coin.rotation);

    // Outer ring (golden)
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(0, 0, 14, 0, Math.PI * 2);
    ctx.fill();

    // Inner ring (darker gold)
    ctx.fillStyle = '#ffb700';
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, Math.PI * 2);
    ctx.fill();

    // Dollar/coin symbol
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('$', 0, 0);

    // Shine effect
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.arc(-3, -4, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

function drawScorePopup(popup) {
    ctx.save();
    ctx.globalAlpha = popup.alpha;
    ctx.fillStyle = popup.color;
    ctx.font = 'bold 18px Rubik, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Shadow for readability
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 4;
    ctx.fillText(popup.text, popup.x, popup.y);
    ctx.shadowBlur = 0;

    ctx.restore();
}

function drawProjectile(projectile) {
    ctx.fillStyle = '#764ba2';
    ctx.shadowColor = '#764ba2';
    ctx.shadowBlur = 10;
    ctx.fillRect(projectile.x, projectile.y, projectile.width, projectile.height);
    ctx.shadowBlur = 0;
}

function drawParticle(particle) {
    ctx.fillStyle = particle.color;
    ctx.globalAlpha = particle.alpha;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
}

// ==========================================
// GAME MECHANICS
// ==========================================
function spawnAsteroid() {
    const settings = DifficultySettings[GameState.difficulty];
    const size = 40 + Math.random() * 30; // Define size first
    const asteroid = {
        x: canvas.width,
        y: Math.random() * (canvas.height - 60) + 30,
        size: size,
        width: size,   // Sync width with visual size
        height: size,  // Sync height with visual size
        speed: settings.asteroidSpeed + Math.random(),
        rotation: 0
    };
    GameState.asteroids.push(asteroid);
}

function spawnEnemy() {
    const settings = DifficultySettings[GameState.difficulty];
    // Random enemy type
    const types = ['ufo', 'alien', 'bug'];
    const type = types[Math.floor(Math.random() * types.length)];

    const hpMap = { ufo: 2, alien: 3, bug: 1 };
    const sizeMap = { ufo: { w: 60, h: 40 }, alien: { w: 50, h: 50 }, bug: { w: 50, h: 40 } };

    const enemy = {
        x: canvas.width,
        y: Math.random() * (canvas.height - 100) + 50,
        width: sizeMap[type].w,
        height: sizeMap[type].h,
        speed: settings.enemySpeed + (type === 'bug' ? 0.5 : 0),
        offset: Math.random() * 100,
        hp: hpMap[type],
        type: type
    };
    GameState.enemies.push(enemy);
}

function spawnCoin() {
    const coin = {
        x: canvas.width,
        y: Math.random() * (canvas.height - 40) + 20,
        width: 28,
        height: 28,
        speed: 1.2,
        rotation: 0,
        bobPhase: Math.random() * Math.PI * 2
    };
    GameState.coins.push(coin);
}

function shoot() {
    if (!GameState.gameRunning) return;

    const projectile = {
        x: Player.x + Player.width,
        y: Player.y + Player.height / 2 - 2,
        width: 20,
        height: 4,
        speed: 8
    };
    GameState.projectiles.push(projectile);
}

function checkCollision(obj1, obj2) {
    const w1 = obj1.width || obj1.size || 0;
    const h1 = obj1.height || obj1.size || 0;
    const w2 = obj2.width || obj2.size || 0;
    const h2 = obj2.height || obj2.size || 0;
    return obj1.x < obj2.x + w2 &&
        obj1.x + w1 > obj2.x &&
        obj1.y < obj2.y + h2 &&
        obj1.y + h1 > obj2.y;
}

function loseLife() {
    GameState.lives--;
    updateHUD();

    if (GameState.lives <= 0) {
        gameOver();
    }
}

function gameOver() {
    GameState.gameRunning = false;
    cancelAnimationFrame(animationId);

    // Update high score
    if (GameState.score > GameState.highScore) {
        GameState.highScore = GameState.score;
        localStorage.setItem('spaceAdventureHighScore', GameState.highScore);
    }

    // Show complete screen
    document.getElementById('final-score').textContent = GameState.score;
    document.getElementById('high-score').textContent = GameState.highScore;
    showScreen('complete-screen');
}

function updateHUD() {
    document.getElementById('score').textContent = GameState.score;

    // Update lives display with hearts
    const hearts = '❤️'.repeat(GameState.lives);
    document.getElementById('lives').textContent = hearts;
}

// ==========================================
// PARTICLE EFFECTS
// ==========================================
function createSparkles(x, y) {
    for (let i = 0; i < 10; i++) {
        const particle = {
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            size: Math.random() * 3 + 2,
            color: '#ffd700',
            alpha: 1,
            life: 30
        };
        GameState.particles.push(particle);
    }
}

function createExplosion(x, y) {
    for (let i = 0; i < 40; i++) {
        const particle = {
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 10,
            vy: (Math.random() - 0.5) * 10,
            size: Math.random() * 6 + 3,
            color: ['#ff6b6b', '#ffd700', '#ff8c00', '#ffffff'][Math.floor(Math.random() * 4)],
            alpha: 1,
            life: 60
        };
        GameState.particles.push(particle);
    }
}

function createScorePopup(x, y, text) {
    GameState.scorePopups.push({
        x: x,
        y: y,
        text: text,
        color: '#38ef7d',
        alpha: 1,
        life: 60
    });
}

// ==========================================
// START
// ==========================================
document.addEventListener('DOMContentLoaded', init);
