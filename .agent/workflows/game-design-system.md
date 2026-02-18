---
description: Kolberg's Games Design System - Standards for All Games
---

# Kolberg's Games Design System

This document defines the **mandatory design standards** for all games in the Kolberg's Games platform. Following these standards ensures consistency, quality, and cross-device compatibility.

## 📋 Table of Contents

1. [Core Principles](#core-principles)
2. [HTML Structure](#html-structure)
3. [CSS Standards](#css-standards)
4. [Navigation & Controls](#navigation--controls)
5. [Audio System](#audio-system)
6. [Responsive Design](#responsive-design)
7. [Visual Design](#visual-design)
8. [Implementation Checklist](#implementation-checklist)

---

## Core Principles

### Reference Implementation
**hebrew-writer** is the gold standard reference implementation. When in doubt, follow its patterns.

### Cross-Device Compatibility
All games MUST work flawlessly on:
- 📱 Mobile phones (iOS & Android)
- 📱 Tablets (portrait & landscape)
- 💻 Desktop computers

### Consistency First
Users should feel they're using the same platform across all games. Navigation, buttons, and interactions must be identical.

---

## HTML Structure

### Required Meta Tags
```html
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
```

### Required Stylesheet Order
```html
<link rel="stylesheet" href="../../platform/responsive.css">
<!-- Optional: Google Fonts -->
<link rel="stylesheet" href="styles.css">
```

### Root Container
All games MUST use an `#app` container:
```html
<body>
    <div id="app">
        <!-- Home Button (REQUIRED) -->
        <a href="../../index.html" class="home-btn" aria-label="Return to Home">🏠</a>
        
        <!-- Game content -->
    </div>
</body>
```

---

## CSS Standards

### Required CSS Variables
Every game's `styles.css` MUST define these variables:

```css
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
```

### Base Styles
```css
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
    font-family: 'Rubik', sans-serif; /* or game-specific font */
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
```

---

## Navigation & Controls

### Home Button (MANDATORY)
**Every game MUST have this exact home button:**

#### HTML
```html
<a href="../../index.html" class="home-btn" aria-label="Return to Home">🏠</a>
```

#### CSS
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

### Button Styles
All interactive buttons should follow this pattern:

```css
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
```

---

## Audio System

### Web Speech API (for Hebrew/Text-to-Speech)
All games using voice MUST implement this pattern from hebrew-writer:

#### Key Features
1. **Audio Context Initialization** - Must be triggered by user gesture
2. **Voice Detection** - Check for Hebrew voice availability
3. **Mobile Compatibility** - Unlock audio on first user interaction
4. **Graceful Degradation** - Handle missing voices

#### Implementation Pattern
```javascript
// Audio Context (Shared)
let audioContext = null;
let audioUnlocked = false;
let speechReady = false;
let hebrewVoice = null;

// Initialize AudioContext
function initAudioContext() {
    if (audioContext) return audioContext;
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        console.log('AudioContext created, state:', audioContext.state);
    } catch (e) {
        console.warn('Could not create AudioContext:', e);
    }
    return audioContext;
}

// Find Hebrew voice
function findHebrewVoice() {
    if (!('speechSynthesis' in window)) return null;
    const voices = speechSynthesis.getVoices();
    return voices.find(v => v.lang.startsWith('he'));
}

// Wait for voices to load
function waitForVoices() {
    return new Promise((resolve) => {
        if (!('speechSynthesis' in window)) {
            resolve();
            return;
        }
        
        let voices = speechSynthesis.getVoices();
        if (voices.length > 0) {
            hebrewVoice = findHebrewVoice();
            resolve();
            return;
        }
        
        speechSynthesis.onvoiceschanged = () => {
            hebrewVoice = findHebrewVoice();
            resolve();
        };
    });
}

// Unlock audio (call on first user interaction)
function unlockAudio() {
    if (audioUnlocked && speechReady) return Promise.resolve();
    
    initAudioContext();
    
    return new Promise((resolve) => {
        const promises = [];
        
        // Resume AudioContext
        if (audioContext && audioContext.state === 'suspended') {
            promises.push(
                audioContext.resume().then(() => {
                    console.log('AudioContext resumed');
                    audioUnlocked = true;
                })
            );
        }
        
        // Wait for speech voices
        if ('speechSynthesis' in window) {
            promises.push(
                waitForVoices().then(() => {
                    speechSynthesis.cancel();
                    if (hebrewVoice) {
                        // Warmup speech
                        const warmUp = new SpeechSynthesisUtterance('.');
                        warmUp.volume = 0.01;
                        warmUp.rate = 2;
                        warmUp.lang = 'he-IL';
                        warmUp.voice = hebrewVoice;
                        warmUp.onend = () => { speechReady = true; };
                        speechSynthesis.speak(warmUp);
                    } else {
                        speechReady = true;
                    }
                })
            );
        }
        
        Promise.all(promises).then(() => {
            setTimeout(resolve, 200);
        });
    });
}

// Speak word
function speakWord(word) {
    if (!hebrewVoice) return;
    
    speechSynthesis.cancel();
    
    setTimeout(() => {
        const cleanWord = word.replace(/[?!.,;:]/g, '');
        const utterance = new SpeechSynthesisUtterance(cleanWord);
        utterance.lang = 'he-IL';
        utterance.rate = 0.8;
        utterance.voice = hebrewVoice;
        speechSynthesis.speak(utterance);
    }, 50);
}
```

#### Event Listener Setup
```javascript
// Start button - MUST unlock audio
startBtn.addEventListener('click', startGame);
startBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    startGame();
}, { passive: false });

function startGame() {
    unlockAudio().then(() => {
        // Start game logic
    });
}
```

---

## Responsive Design

### Screen System
Use a screen-based navigation system:

```css
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
```

### Mobile Breakpoints
```css
@media (max-width: 480px) {
    .game-title {
        font-size: 2rem;
    }
    
    /* Adjust button sizes */
    .magic-btn {
        padding: 12px 30px;
        font-size: 1.1rem;
    }
}
```

---

## Visual Design

### Color Palette
Use vibrant gradients and glassmorphism:
- **Primary**: Purple gradient (`#667eea` → `#764ba2`)
- **Secondary**: Pink gradient (`#f093fb` → `#f5576c`)
- **Success**: Green gradient (`#11998e` → `#38ef7d`)
- **Warning**: Orange gradient (`#f2994a` → `#f2c94c`)
- **Background**: Dark blue gradient (`#1a1a2e` → `#16213e` → `#0f3460`)

### Glassmorphism Cards
```css
.card {
    background: var(--card-bg);
    backdrop-filter: blur(10px);
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: var(--border-radius);
    padding: 30px;
}
```

### Animations
Use smooth, playful animations:

```css
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
```

---

## Implementation Checklist

When creating a new game, verify:

### ✅ HTML Structure
- [ ] Viewport meta tag with `viewport-fit=cover`
- [ ] `responsive.css` linked BEFORE game styles
- [ ] `#app` root container
- [ ] Home button with exact styling
- [ ] Proper semantic HTML

### ✅ CSS Standards
- [ ] All CSS variables defined
- [ ] Base styles applied
- [ ] Home button styled correctly
- [ ] Responsive breakpoints implemented
- [ ] Glassmorphism effects used

### ✅ Navigation
- [ ] Home button positioned at `top: 15px; left: 15px`
- [ ] Home button is circular (50px × 50px)
- [ ] Home button has hover effect
- [ ] Home button links to `../../index.html`

### ✅ Audio (if applicable)
- [ ] AudioContext initialized on user gesture
- [ ] Voice detection implemented
- [ ] Mobile audio unlock on first interaction
- [ ] Graceful degradation for missing voices

### ✅ Responsive Design
- [ ] Works on mobile (portrait & landscape)
- [ ] Works on tablet
- [ ] Works on desktop
- [ ] No horizontal scrolling
- [ ] Touch-friendly button sizes (min 44px)

### ✅ Visual Polish
- [ ] Vibrant color gradients
- [ ] Smooth animations
- [ ] Glassmorphism effects
- [ ] Consistent typography
- [ ] Proper spacing and alignment

---

## Quick Reference: hebrew-writer Files

For detailed implementation examples, refer to:
- **HTML**: `/games/hebrew-writer/index.html`
- **CSS**: `/games/hebrew-writer/styles.css`
- **JavaScript**: `/games/hebrew-writer/main.js`

---

## Common Mistakes to Avoid

❌ **DON'T**:
- Use different home button styles per game
- Skip the `responsive.css` import
- Forget mobile audio unlock
- Use plain colors instead of gradients
- Ignore mobile testing

✅ **DO**:
- Copy the exact home button code
- Test on real mobile devices
- Use CSS variables consistently
- Implement smooth animations
- Follow the hebrew-writer pattern

---

## Version History

- **v1.0** (2026-02-16): Initial design system based on hebrew-writer
