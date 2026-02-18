---
description: Step-by-step workflow for creating a new game
---

# Create New Game Workflow

Follow these steps to create a new game that adheres to the Kolberg's Games Design System.

## Prerequisites

Before starting, review:
1. `.agent/workflows/game-design-system.md` - Design standards
2. `games/hebrew-writer/` - Reference implementation

---

## Step 1: Create Game Directory Structure

```bash
cd /Users/iairprivate/kolbergs-games/games
mkdir your-game-name
cd your-game-name
```

Create these files:
- `index.html` - Main game file
- `styles.css` - Game-specific styles
- `main.js` - Game logic
- `data.js` - Game data (if needed)

---

## Step 2: Setup HTML Boilerplate

Copy this template to `index.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    <title>Your Game Name - Kolberg's Games</title>
    <meta name="description" content="Game description">
    
    <!-- Platform responsive CSS (REQUIRED) -->
    <link rel="stylesheet" href="../../platform/responsive.css">
    
    <!-- Optional: Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
    
    <!-- Game styles -->
    <link rel="stylesheet" href="styles.css">
</head>

<body>
    <div id="app">
        <!-- Home Button (MANDATORY) -->
        <a href="../../index.html" class="home-btn" aria-label="Return to Home">🏠</a>

        <!-- Welcome Screen -->
        <div id="welcome-screen" class="screen active">
            <div class="screen-content">
                <div class="hero-badge">🎮</div>
                <h1 class="game-title">Your Game Name</h1>
                <p class="subtitle">Game description</p>
                
                <button class="start-btn magic-btn" id="start-game">
                    <span class="btn-icon">🚀</span>
                    <span>Start Game!</span>
                </button>
            </div>
        </div>

        <!-- Game Screen -->
        <div id="game-screen" class="screen">
            <div class="screen-content">
                <!-- Your game content here -->
            </div>
        </div>

        <!-- Complete Screen -->
        <div id="complete-screen" class="screen">
            <div class="screen-content">
                <div class="trophy">🏆</div>
                <h1 class="complete-title">Well Done!</h1>
                
                <div class="complete-actions">
                    <button class="magic-btn" id="play-again">
                        <span class="btn-icon">🔄</span>
                        <span>Play Again</span>
                    </button>
                    <button class="magic-btn secondary" id="back-to-menu">🏠 Main Menu</button>
                </div>
            </div>
        </div>
    </div>

    <script src="data.js"></script>
    <script src="main.js"></script>
</body>
</html>
```

---

## Step 3: Setup CSS with Design System

Copy this template to `styles.css`:

```css
/* Your Game Name - Styles */

/* ==========================================
   CSS VARIABLES (REQUIRED)
   ========================================== */
:root {
    /* Gradients */
    --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    --secondary-gradient: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    --success-gradient: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
    --warning-gradient: linear-gradient(135deg, #f2994a 0%, #f2c94c 100%);
    --bg-gradient: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
    
    /* Colors */
    --card-bg: rgba(255, 255, 255, 0.1);
    --text-primary: #ffffff;
    --text-secondary: rgba(255, 255, 255, 0.8);
    --shadow-color: rgba(0, 0, 0, 0.3);
    
    /* Layout */
    --border-radius: 16px;
    --transition: all 0.3s ease;
}

/* ==========================================
   BASE STYLES (REQUIRED)
   ========================================== */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

html, body {
    height: 100%;
    overflow: hidden;
}

body {
    font-family: 'Rubik', sans-serif;
    background: var(--bg-gradient);
    color: var(--text-primary);
    min-height: 100vh;
    min-height: 100svh;
}

#app {
    min-height: 100vh;
    min-height: 100svh;
    display: flex;
    flex-direction: column;
    position: relative;
}

/* ==========================================
   SCREENS (REQUIRED)
   ========================================== */
.screen {
    display: none;
    flex: 1;
    padding: 20px;
    padding-top: 70px;
    overflow-y: auto;
}

.screen.active {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.screen-content {
    width: 100%;
    max-width: 500px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
}

/* ==========================================
   HOME BUTTON (MANDATORY)
   ========================================== */
.home-btn {
    position: fixed;
    top: 15px;
    left: 15px;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: var(--card-bg);
    backdrop-filter: blur(10px);
    border: 2px solid rgba(255, 255, 255, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    text-decoration: none;
    z-index: 100;
    transition: var(--transition);
}

.home-btn:hover {
    transform: scale(1.1);
    background: rgba(255, 255, 255, 0.2);
}

/* ==========================================
   BUTTONS (REQUIRED)
   ========================================== */
.magic-btn {
    background: var(--primary-gradient);
    border: none;
    border-radius: 30px;
    padding: 15px 40px;
    font-size: 1.3rem;
    font-weight: 700;
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 10px;
    transition: var(--transition);
    box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
    font-family: inherit;
}

.magic-btn:hover {
    transform: translateY(-3px);
    box-shadow: 0 15px 40px rgba(102, 126, 234, 0.5);
}

.magic-btn.secondary {
    background: var(--card-bg);
    box-shadow: none;
}

/* ==========================================
   TITLES & TEXT
   ========================================== */
.game-title {
    font-size: 2.5rem;
    font-weight: 800;
    background: var(--primary-gradient);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-align: center;
}

.subtitle {
    font-size: 1.2rem;
    color: var(--text-secondary);
    text-align: center;
}

/* ==========================================
   ANIMATIONS
   ========================================== */
@keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-15px); }
}

@keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
}

.hero-badge {
    font-size: 80px;
    animation: bounce 2s infinite;
}

.trophy {
    font-size: 100px;
    animation: bounce 1s ease infinite;
}

/* ==========================================
   RESPONSIVE (REQUIRED)
   ========================================== */
@media (max-width: 480px) {
    .game-title {
        font-size: 2rem;
    }
    
    .hero-badge {
        font-size: 60px;
    }
    
    .magic-btn {
        padding: 12px 30px;
        font-size: 1.1rem;
    }
}

/* ==========================================
   GAME-SPECIFIC STYLES
   Add your custom game styles below
   ========================================== */
```

---

## Step 4: Setup JavaScript with Audio Support

Copy this template to `main.js`:

```javascript
/**
 * Your Game Name - Main Logic
 */

// ==========================================
// AUDIO CONTEXT (if using speech/sound)
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
    // Add your game state here
};

// ==========================================
// INITIALIZATION
// ==========================================
function init() {
    setupEventListeners();
}

function setupEventListeners() {
    // Start game button
    const startBtn = document.getElementById('start-game');
    startBtn.addEventListener('click', startGame);
    startBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        startGame();
    }, { passive: false });
    
    // Play again button
    document.getElementById('play-again').addEventListener('click', startGame);
    
    // Back to menu button
    document.getElementById('back-to-menu').addEventListener('click', () => {
        showScreen('welcome-screen');
    });
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
    // Unlock audio on user interaction
    unlockAudio().then(() => {
        showScreen('game-screen');
        // Add your game start logic here
    });
}

// ==========================================
// START
// ==========================================
document.addEventListener('DOMContentLoaded', init);
```

---

## Step 5: Add Game to Platform

Edit `/Users/iairprivate/kolbergs-games/games.json`:

```json
{
    "id": "your-game-id",
    "name": "Your Game Name",
    "description": "Game description",
    "icon": "🎮",
    "path": "games/your-game-name/index.html",
    "category": "puzzle",
    "difficulty": "easy",
    "players": "single"
}
```

---

## Step 6: Test Checklist

// turbo
Test your game on all platforms:

```bash
# Start local server
python3 -m http.server 8000
```

Then test:
- [ ] Desktop browser (Chrome, Safari, Firefox)
- [ ] Mobile phone (portrait & landscape)
- [ ] Tablet (portrait & landscape)
- [ ] Home button works
- [ ] Audio works (if applicable)
- [ ] No scrollbars
- [ ] Touch controls work
- [ ] Responsive layout works

---

## Step 7: Final Verification

Use the checklist from `game-design-system.md`:

### ✅ HTML Structure
- [ ] Viewport meta tag
- [ ] responsive.css linked
- [ ] #app container
- [ ] Home button

### ✅ CSS Standards
- [ ] CSS variables defined
- [ ] Home button styled
- [ ] Responsive breakpoints

### ✅ JavaScript
- [ ] Audio unlock on user gesture
- [ ] Event listeners for touch
- [ ] Screen navigation

---

## Common Issues & Solutions

### Issue: Audio doesn't work on mobile
**Solution**: Ensure `unlockAudio()` is called in the start button event handler.

### Issue: Home button looks different
**Solution**: Copy the exact CSS from `game-design-system.md`.

### Issue: Layout breaks on mobile
**Solution**: Verify `responsive.css` is loaded BEFORE your game styles.

### Issue: Touch events don't work
**Solution**: Add both `click` and `touchstart` event listeners.

---

## Resources

- **Design System**: `.agent/workflows/game-design-system.md`
- **Reference Game**: `games/hebrew-writer/`
- **Platform CSS**: `platform/responsive.css`
