/**
 * Hero Target Practice - Main Game Logic
 */



const App = {
    // Game State
    state: {
        currentScreen: 'selection', // selection, game, gameover
        selectedHero: null,
        score: 0,
        highScore: parseInt(localStorage.getItem('hero-target-highscore') || '0'),
        lives: 3,
        multiplier: 1,
        gameActive: false,
        lastSpawnTime: 0,
        difficulty: 1, // 1 to 10
    },

    // Config
    heroes: [
        { id: 'batman', name: 'Batman', color: '#333', projectile: 'batarang', image: 'assets/batman.png' },
        { id: 'flash', name: 'The Flash', color: '#d1121d', projectile: 'lightning', image: 'assets/flash.png' },
        { id: 'superman', name: 'Superman', color: '#0059b3', projectile: 'laser', image: 'assets/superman.png' },
        { id: 'captain', name: 'Captain', color: '#003366', projectile: 'shield', image: 'assets/captain.png' },
    ],

    elements: {
        app: document.getElementById('app'),
        screens: {
            selection: document.getElementById('selection-screen'),
            gameover: document.getElementById('game-over-screen'),
        },
        gameArea: document.getElementById('game-area'),
        hud: document.getElementById('hud'),
        heroesGrid: document.getElementById('heroes-grid'),
        backgroundLayer: document.getElementById('background-layer'),
        targetsLayer: document.getElementById('targets-layer'),
        projectilesLayer: document.getElementById('projectiles-layer'),
        heroContainer: document.getElementById('hero-container'),
        scoreDisplay: document.getElementById('score'),
        multiplierDisplay: document.getElementById('multiplier'),
        livesDisplay: document.getElementById('lives'),
        finalScore: document.getElementById('final-score-val'),
        highScore: document.getElementById('high-score-val'),
        finalStars: document.getElementById('final-stars'),
        retryBtn: document.getElementById('retry-btn'),
        menuBtn: document.getElementById('menu-btn'),
    },

    // Runtime variables
    targets: [],
    projectiles: [],
    animationFrameId: null,

    init() {
        this.renderHeroes();
        this.attachListeners();
        this.resizeGame();
        window.addEventListener('resize', () => this.resizeGame());
    },

    renderHeroes() {
        this.elements.heroesGrid.innerHTML = '';
        this.heroes.forEach(hero => {
            const card = document.createElement('div');
            card.className = 'hero-card';
            card.onclick = () => this.selectHero(hero);

            // Placeholder for image - in real version these would be actual assets
            // Check if we can find a local image or use a generic one
            const img = document.createElement('img');
            img.className = 'hero-img';
            img.src = hero.image;
            img.alt = hero.name;

            card.appendChild(img);

            const name = document.createElement('div');
            name.className = 'hero-name';
            name.textContent = hero.name;
            card.appendChild(name);

            this.elements.heroesGrid.appendChild(card);
        });
    },

    selectHero(hero) {
        this.state.selectedHero = hero;
        this.startGame();
    },

    startGame() {
        this.state.score = 0;
        this.state.lives = 3;
        this.state.multiplier = 1;
        this.state.gameActive = true;
        this.state.difficulty = 1;
        this.targets = [];
        this.projectiles = [];

        // Show Game UI
        this.showScreen('game');
        this.elements.hud.classList.remove('hidden');
        this.elements.gameArea.classList.remove('hidden');

        // Setup Hero
        this.elements.heroContainer.innerHTML = '';
        const heroSprite = document.createElement('img');
        heroSprite.className = 'hero-sprite';
        heroSprite.src = this.state.selectedHero.image;
        this.elements.heroContainer.appendChild(heroSprite);

        this.updateHUD();
        this.gameLoop();
    },

    gameLoop(timestamp) {
        if (!this.state.gameActive) return;

        // Spawn targets logic
        if (!this.state.lastSpawnTime || timestamp - this.state.lastSpawnTime > (2000 / this.state.difficulty)) {
            this.spawnTarget();
            this.state.lastSpawnTime = timestamp;
        }

        this.updateTargets();
        this.updateProjectiles();
        this.checkCollisions();

        this.animationFrameId = requestAnimationFrame((ts) => this.gameLoop(ts));
    },

    spawnTarget() {
        const typeRoll = Math.random();
        let type = 'villain';
        if (typeRoll > 0.8) type = 'civilian'; // Don't hit!
        if (typeRoll > 0.95) type = 'star'; // Bonus

        const target = {
            id: Date.now() + Math.random(),
            type: type,
            x: Math.random() < 0.5 ? -50 : window.innerWidth + 50, // Start left or right
            y: 50 + Math.random() * (window.innerHeight - 250),
            speed: (Math.random() < 0.5 ? 2 : -2) * (1 + this.state.difficulty * 0.1),
            el: null
        };

        // If starting from left, speed is positive. If right, negative.
        if (target.x > 0) target.speed = -Math.abs(target.speed);
        else target.speed = Math.abs(target.speed);

        const el = document.createElement('div');
        el.className = `target ${type}`;
        el.style.left = `${target.x}px`;
        el.style.top = `${target.y}px`;

        const img = document.createElement('img');
        img.src = type === 'villain' ? 'assets/villain.png' : type === 'civilian' ? 'assets/civilian.png' : 'assets/star.png';
        el.appendChild(img);

        this.elements.targetsLayer.appendChild(el);
        target.el = el;
        this.targets.push(target);
    },

    updateTargets() {
        this.targets.forEach((t, index) => {
            t.x += t.speed;
            t.el.style.left = `${t.x}px`;

            // Remove if off screen
            if ((t.speed > 0 && t.x > window.innerWidth) || (t.speed < 0 && t.x < -60)) {
                t.el.remove();
                this.targets.splice(index, 1);
            }
        });
    },

    shoot(x, y) {
        if (!this.state.gameActive) return;

        // Calculate angle from hero to click
        const heroRect = this.elements.heroContainer.getBoundingClientRect();
        const heroX = heroRect.left + heroRect.width / 2;
        const heroY = heroRect.top + heroRect.height / 2;

        const angle = Math.atan2(y - heroY, x - heroX);
        const velocity = {
            x: Math.cos(angle) * 15,
            y: Math.sin(angle) * 15
        };

        const proj = {
            id: Date.now(),
            x: heroX,
            y: heroY,
            vx: velocity.x,
            vy: velocity.y,
            el: null
        };

        const el = document.createElement('div');
        el.className = 'projectile';
        el.style.left = `${proj.x}px`;
        el.style.top = `${proj.y}px`;
        el.style.backgroundColor = this.state.selectedHero.color;

        this.elements.projectilesLayer.appendChild(el);
        proj.el = el;
        this.projectiles.push(proj);
    },

    updateProjectiles() {
        this.projectiles.forEach((p, index) => {
            p.x += p.vx;
            p.y += p.vy;
            p.el.style.left = `${p.x}px`;
            p.el.style.top = `${p.y}px`;

            // Remove if off screen
            if (p.x < 0 || p.x > window.innerWidth || p.y < 0 || p.y > window.innerHeight) {
                p.el.remove();
                this.projectiles.splice(index, 1);
            }
        });
    },

    checkCollisions() {
        // Simple circle collision
        const hitRadius = 30; // Target radius
        const projRadius = 10;

        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const p = this.projectiles[i];
            let hit = false;

            for (let j = this.targets.length - 1; j >= 0; j--) {
                const t = this.targets[j];
                const dx = p.x - (t.x + 30); // center offset
                const dy = p.y - (t.y + 30);
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < hitRadius + projRadius) {
                    this.handleHit(t, p);
                    this.targets.splice(j, 1);
                    hit = true;
                    break;
                }
            }

            if (hit) {
                p.el.remove();
                this.projectiles.splice(i, 1);
            }
        }
    },

    handleHit(target, projectile) {
        target.el.remove();

        // Score popup
        const popup = document.createElement('div');
        popup.className = 'popup-score';
        popup.style.left = `${target.x}px`;
        popup.style.top = `${target.y}px`;

        if (target.type === 'villain') {
            const points = 100 * this.state.multiplier;
            this.state.score += points;
            popup.textContent = `+${points}`;
            this.state.multiplier = Math.min(this.state.multiplier + 0.1, 5); // Max 5x multiplier/combo logic can be refined
        } else if (target.type === 'civilian') {
            this.state.lives--;
            popup.textContent = 'Oops! -❤️';
            popup.style.color = '#ff4757';
            this.state.multiplier = 1; // Reset combo
            if (this.state.lives <= 0) this.gameOver();
        } else if (target.type === 'star') {
            const points = 500;
            this.state.score += points;
            popup.textContent = `BONUS! +${points}`;
            popup.style.color = '#ffd700';
            this.heal();
        }

        this.elements.gameArea.appendChild(popup);
        setTimeout(() => popup.remove(), 1000);

        this.updateHUD();
    },

    heal() {
        if (this.state.lives < 5) this.state.lives++;
    },

    updateHUD() {
        this.elements.scoreDisplay.textContent = Math.floor(this.state.score);
        this.elements.multiplierDisplay.textContent = `x${this.state.multiplier.toFixed(1)}`;
        this.elements.livesDisplay.textContent = '❤️'.repeat(this.state.lives);
    },

    gameOver() {
        this.state.gameActive = false;
        cancelAnimationFrame(this.animationFrameId);

        if (this.state.score > this.state.highScore) {
            this.state.highScore = this.state.score;
            localStorage.setItem('hero-target-highscore', this.state.highScore);
        }

        this.elements.finalScore.textContent = Math.floor(this.state.score);
        this.elements.highScore.textContent = Math.floor(this.state.highScore);
        this.elements.finalStars.textContent = this.state.score > 2000 ? '⭐⭐⭐' : this.state.score > 1000 ? '⭐⭐' : '⭐';

        this.showScreen('gameover');
    },

    showScreen(screenName) {
        // Hide all screens
        Object.values(this.elements.screens).forEach(s => s.classList.add('hidden'));
        this.elements.hud.classList.add('hidden');
        this.elements.gameArea.classList.add('hidden');

        // Show requested
        if (screenName === 'selection') {
            this.elements.screens.selection.classList.remove('hidden');
            this.elements.screens.selection.classList.add('active');
        } else if (screenName === 'game') {
            // No full screen overlay for game, just layers
        } else if (screenName === 'gameover') {
            this.elements.screens.gameover.classList.remove('hidden');
            this.elements.screens.gameover.classList.add('active');
        }

        this.state.currentScreen = screenName;
    },

    attachListeners() {
        // Selection
        this.elements.retryBtn.onclick = () => this.startGame();
        this.elements.menuBtn.onclick = () => this.showScreen('selection');

        // Shooting
        this.elements.app.addEventListener('mousedown', (e) => this.inputStart(e.clientX, e.clientY));
        this.elements.app.addEventListener('touchstart', (e) => {
            // Prevent scrolling
            // e.preventDefault(); 
            const touch = e.touches[0];
            this.inputStart(touch.clientX, touch.clientY);
        }, { passive: false });
    },

    inputStart(x, y) {
        if (this.state.currentScreen === 'game') {
            this.shoot(x, y);
        }
    },

    resizeGame() {
        // Handled by CSS largely, but can adjust canvas if we used canvas
    }
};

window.onload = () => App.init();
