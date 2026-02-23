# Game Template

**Always start new games from this template — never from scratch.**

This template has all mobile bugs pre-solved:
- ✅ Touch events (`click` + `touchstart` with `passive: false`) on every button
- ✅ Audio unlock inside user gesture (iOS Safari compatible)
- ✅ `onvoiceschanged` for async voice loading on mobile
- ✅ Safari warmup utterance to prevent speech hang
- ✅ `speechSynthesis.cancel()` before every `speak()`
- ✅ `100svh` viewport units (not just `100vh`)
- ✅ No `width: 100vw` (prevents horizontal scrollbar)
- ✅ All tappable elements ≥ 44px

## How to Start a New Game

```bash
cp -r game-template games/<your-game-id>
```

Then in the new folder:
1. **`index.html`** — replace `GAME_TITLE` and `GAME_DESCRIPTION`
2. **`data.js`** — replace `ITEMS` with your game content (min 15 per difficulty)
3. **`styles.css`** — replace `GAME_TITLE` comment, customize colors if needed
4. **`main.js`** — implement `buildQuestions()`, `showQuestion()`, `onAnswer()` game logic
5. Register in `platform/games.json`

## What NOT to Change

- The audio block in `main.js` (lines 1–80) — copy as-is
- The `addBtn()` helper pattern — every button must go through this
- The `home-btn` CSS — must match exactly across all games
- The three screen IDs: `welcome-screen`, `game-screen`, `complete-screen`
- The viewport meta tag and `responsive.css` link in `index.html`
