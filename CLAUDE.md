# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Kolberg's Games is a static, browser-based game platform for child-friendly games. Pure HTML/CSS/JavaScript — no frameworks, no build tools, no Node.js. Deployed on GitHub Pages.

## Running Locally

```bash
python3 -m http.server 8000
# Open http://localhost:8000
```

Opening `index.html` directly from the filesystem will not work — asset loading relies on HTTP requests.

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

1. Create `games/<game-id>/` with index.html, styles.css, main.js
2. Follow the template in `.agent/workflows/create-new-game.md`
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
