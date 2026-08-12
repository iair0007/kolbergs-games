# Kolberg's Games - Quick Reference

> **Full Documentation**: See [.agent/workflows/game-design-system.md](.agent/workflows/game-design-system.md)  
> **Create New Game**: See [.agent/workflows/create-new-game.md](.agent/workflows/create-new-game.md)

## 🎯 Quick Standards

### Reference Implementation
**hebrew-writer** (`games/hebrew-writer/`) is the gold standard. When in doubt, copy its patterns.

---

## 📱 Required: Home Button

Every game MUST have this exact home button:

```html
<a href="../../index.html" class="home-btn" aria-label="Return to Home">🏠</a>
```

```css
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
```

---

## 🎨 Required: CSS Variables

```css
:root {
    --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    --secondary-gradient: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    --success-gradient: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
    --warning-gradient: linear-gradient(135deg, #f2994a 0%, #f2c94c 100%);
    --bg-gradient: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
    --card-bg: rgba(255, 255, 255, 0.1);
    --text-primary: #ffffff;
    --text-secondary: rgba(255, 255, 255, 0.8);
    --border-radius: 16px;
    --transition: all 0.3s ease;
}
```

---

## 📄 Required: HTML Meta Tags

```html
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<link rel="stylesheet" href="../../platform/responsive.css">
```

---

## 🔊 Audio Pattern (for speech/sound games)

```javascript
// 1. Initialize on user gesture
function unlockAudio() {
    initAudioContext();
    return audioContext.resume().then(() => {
        // Warmup speech synthesis for mobile
    });
}

// 2. Call in start button handler
startBtn.addEventListener('click', startGame);
startBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    startGame();
}, { passive: false });

function startGame() {
    unlockAudio().then(() => {
        // Start game
    });
}
```

See `games/hebrew-writer/main.js` for complete implementation.

---

## 🎯 Required: Puzzle Size Caps

Any content a child works through piece by piece:

- **Max 12 colors** in a palette they choose from
- **Max 1024 squares / items** in one puzzle (a 32 × 32 grid)

Difficulty comes from more detail, not more grind. Build tools must enforce
both caps themselves — see `games/paint-by-number/tools/`.

---

## ✅ Quick Checklist

Before launching a new game:

- [ ] Home button at `top: 15px; left: 15px` (circular, 50px)
- [ ] `responsive.css` linked BEFORE game styles
- [ ] CSS variables defined
- [ ] Viewport meta tag with `viewport-fit=cover`
- [ ] Audio unlocked on first user interaction (if using audio)
- [ ] Tested on mobile (portrait & landscape)
- [ ] Tested on tablet
- [ ] Tested on desktop
- [ ] No horizontal scrolling
- [ ] Palette ≤ 12 colors, puzzle ≤ 1024 squares

---

## 🚀 Creating a New Game

1. Copy templates from `.agent/workflows/create-new-game.md`
2. Replace "Your Game Name" with your game name
3. Add game logic
4. Add to `games.json`
5. Test on all devices

---

## 📚 Full Documentation

- **Complete Design System**: [.agent/workflows/game-design-system.md](.agent/workflows/game-design-system.md)
- **Step-by-Step Workflow**: [.agent/workflows/create-new-game.md](.agent/workflows/create-new-game.md)
- **Reference Game**: [games/hebrew-writer/](games/hebrew-writer/)
- **Platform CSS**: [platform/responsive.css](platform/responsive.css)
