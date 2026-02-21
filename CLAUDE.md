# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Kolberg's Games is a static, browser-based game platform for child-friendly games. Pure HTML/CSS/JavaScript — no frameworks, no build tools, no Node.js. Deployed on GitHub Pages.

## Running Locally

\```bash
python3 -m http.server 8000
# Open http://localhost:8000
\```

Opening `index.html` directly from the filesystem will not work — asset loading relies on HTTP requests.

## Workflow Rules
- Always open a Pull Request after making any code changes
- Never push to a branch without opening a PR
- Always link the PR to the issue it fixes using "Fixes #issue_number" in the PR description
- PR title should reference the issue (e.g. "Fix #12 - brief description")
- Never close an issue without a linked PR
- Always add a clear description in the PR explaining what was changed and why
- Post a comment on the issue summarizing what you changed before opening the PR

## Architecture

**No build step.** All files are served as-is. All paths must be relative for GitHub Pages compatibility.

### Key Directories

- `platform/` — Shared engine: `responsive.css` (viewport/safe-area handling), `resize.js` (canvas auto-resize), `platform.js` + `platform.css` (landing page card grid), `games.json` (game registry)
- `games/<game-id>/` — Self-contained game folders (index.html, main.js, styles.css, optional data.js and assets/)
- `shared/assets/` — Reusable character sprites and images
- `specs/` — Authoritative architecture and behavior specifications (source of truth when specs and implementation disagree)
- `.agent/workflows/` — Game creation workflow and design system docs

### How Games Work

Each game is a standalone HTML page under `games/<game-id>/`. The platform landing page (`index.html`) reads `platform/games.json` and generates clickable cards linking to each game.

Games use a screen-based pattern: `#welcome-screen`, `#game-screen`, `#complete-screen` toggled via an `.active` CSS class. No routing library — just show/hide divs.

### Adding a New Game

1. **Copy the template**: `cp -r game-template games/<game-id>` — never start from scratch
2. Edit the four files: `data.js` (content), `index.html` (structure), `styles.css` (style), `main.js` (logic)
3. Register in `platform/games.json` (id, title, description, path, image)
4. Reference implementation: `games/hebrew-writer/`

### Cross-Device Support

All games must work on desktop, phone, and tablet (portrait and landscape). Use responsive units (`svh`, `dvh`, `clamp()`), avoid fixed pixel sizes that exceed viewport, handle both mouse and touch events, and test on mobile via browser DevTools device emulation. See `specs/responsive-layout.md` for full requirements.

### Required Patterns for Every Game

- Include `<link rel="stylesheet" href="../../platform/responsive.css">` **before** game styles
- Viewport meta: `<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">`
- Home button: `<a href="../../index.html" class="home-btn">🏠</a>` — fixed, top-left, 50px circular
- Standard CSS variables (defined in `GAME_STANDARDS.md`): `--primary-gradient`, `--bg-gradient`, `--card-bg`, `--text-primary`, `--border-radius`, `--transition`, etc.
- Audio must be unlocked on first user gesture (see `GAME_STANDARDS.md` for pattern)

### Starting a New Game

**Always copy from `game-template/`** — never start a game from scratch. The template already has all mobile, audio, and layout patterns implemented correctly. Copy the three files (`index.html`, `styles.css`, `main.js`) into `games/<game-id>/` and adapt the content.

---

## Non-Negotiable Rules — Every Game Must Pass These

These rules exist because every single new game has had the same three categories of bugs. Read carefully before writing any game code.

### Rule 1 — Touch Events (Mobile Buttons)

**Every interactive button must have BOTH a `click` AND a `touchstart` handler.** Using only `click` causes 300ms delay and non-response on iOS Safari.

```javascript
// CORRECT — required pattern for every button
btn.addEventListener('click', handler);
btn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    handler();
}, { passive: false });
```

`{ passive: false }` and `e.preventDefault()` are required — without them, scroll and tap conflict on mobile. This applies to: start buttons, answer option buttons, play-again buttons, difficulty selectors, speaker buttons, and any other tappable element.

### Rule 2 — Audio on Mobile (iOS Safari)

iOS Safari blocks audio until a user gesture. The Web Speech API also loads voices asynchronously. **Both must be handled.** Copy this pattern exactly from `game-template/main.js`:

```javascript
// AudioContext — created lazily, resumed inside user gesture
let audioContext = null;
function initAudioContext() {
    if (audioContext) return audioContext;
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    return audioContext;
}

// Voices — must wait for onvoiceschanged on mobile
function waitForVoices() {
    return new Promise((resolve) => {
        const voices = speechSynthesis.getVoices();
        if (voices.length > 0) { resolve(); return; }
        speechSynthesis.onvoiceschanged = resolve;
    });
}

// Audio unlock — MUST be called inside the start button handler
async function unlockAudio() {
    initAudioContext();
    if (audioContext.state === 'suspended') await audioContext.resume();
    await waitForVoices();
    // Warmup utterance — required for Safari to not hang on first speech
    const warmup = new SpeechSynthesisUtterance('.');
    warmup.volume = 0.01; warmup.rate = 2; warmup.lang = 'he-IL';
    speechSynthesis.speak(warmup);
}

// Always cancel before speaking — iOS Safari stacks utterances otherwise
function speakWord(text) {
    speechSynthesis.cancel();
    setTimeout(() => {
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'he-IL'; u.rate = 0.8; u.voice = hebrewVoice;
        speechSynthesis.speak(u);
    }, 50);
}
```

Never call `unlockAudio()` on page load — only inside a button handler.

### Rule 3 — Screen Layout (Viewport & Sizing)

These four CSS rules prevent the most common layout bugs on mobile:

```css
/* NEVER use 100vh alone — iOS Safari URL bar breaks it */
/* ALWAYS pair with 100svh */
min-height: 100vh;
min-height: 100svh;  /* overrides on browsers that support it */

/* NEVER use width: 100vw — causes horizontal scrollbar */
/* Use width: 100% instead */

/* Font sizes must scale with screen — never fixed px on headings */
font-size: clamp(1.2rem, 5vw, 2rem);

/* All tappable elements: minimum 44×44px touch target */
min-width: 44px;
min-height: 44px;
```

Also required in `html, body`:
```css
html, body { height: 100%; overflow: hidden; }
```

### Pre-Launch Checklist

Before opening a PR for any new game, verify all of these:

**Touch**
- [ ] Start button has `click` + `touchstart` with `{ passive: false }`
- [ ] Every answer/option button has both handlers
- [ ] Every secondary button (play again, difficulty, speaker) has both handlers

**Audio**
- [ ] `AudioContext` is created lazily (not on page load)
- [ ] `unlockAudio()` is called inside the start button handler
- [ ] `waitForVoices()` handles async voice loading via `onvoiceschanged`
- [ ] Warmup utterance fires on first user interaction
- [ ] `speechSynthesis.cancel()` is called before every `speak()`
- [ ] Game works silently when Hebrew voice is unavailable (graceful degradation)

**Layout**
- [ ] `min-height: 100svh` used (not just `100vh`)
- [ ] No `width: 100vw` — uses `width: 100%`
- [ ] Welcome screen fits iPhone SE (375×667) without scrolling
- [ ] Game screen fits landscape mobile without overflow
- [ ] All buttons ≥ 44px tall

**Structure**
- [ ] `viewport-fit=cover` in meta viewport tag
- [ ] `../../platform/responsive.css` is the first stylesheet
- [ ] `dir="rtl" lang="he"` on `<html>`
- [ ] Home button at `top: 15px; left: 15px` fixed

### Language

Most games are Hebrew (RTL). Use `dir="rtl"` and `lang="he"` attributes. Google Fonts Rubik and Fredoka are used for Hebrew/English text.

## Specs Are Source of Truth

When specs and implementation disagree, **specs are authoritative**. Key specs:
- `specs/constitution.md` — Core principles, non-goals, architectural boundaries
- `specs/responsive-layout.md` — Responsive design requirements
- `specs/game-contract.spec.md` — Engine/game interface contract
- `specs/folder-structure.md` — Directory organization rules

## Constraints

- No backend dependencies, no server-side logic
- No build tools or transpilation
- Games must not depend on each other
- Adding a game must not require engine changes
- All content runs without accounts, tracking, or analytics
- Asset versioning via query strings (e.g., `platform.js?v=1.1`)
