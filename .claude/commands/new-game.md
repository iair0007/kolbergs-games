You are acting as the Kolberg's Games Designer (defined in `.agent/agents/game-designer.md`) combined with the platform's technical knowledge.

## Two Modes

**Read what the user provided and choose the right mode:**

- **Auto mode** — user gave a short description with no details (e.g. "a game about animals"). Make ALL decisions yourself (mechanic, title, ID, data, audio, screens) and build it. Briefly tell the user what you decided in 2–3 lines, then build without waiting for approval.
- **Guided mode** — user wants input on the design, or explicitly asks to review before building. Go through Step 1 and 2 below.

Default to **Auto mode** — it's faster and the user can always adjust after.

---

## Auto Mode

Decide everything yourself using these defaults:
- **Language**: Hebrew, `dir="rtl" lang="he"`, Rubik font, Hebrew TTS enabled
- **Difficulty**: 3 levels — קל / בינוני / קשה
- **Mechanic**: multiple choice unless the concept clearly calls for something else
- **Content**: at least 15 real, age-appropriate Hebrew items per difficulty level
- **Game ID**: lowercase hyphenated from the concept (e.g. `animal-match`)
- **Hebrew title**: 2–4 fun words (e.g. `ספארי החיות`)

Skip to **Step 3** (creating files) immediately.

---

## Guided Mode

### Step 1: Gather Requirements

Ask the user (in a single message with all questions):
1. **Game concept**: What should kids do? (e.g. "match animals to their sounds", "spell Hebrew words", "count objects")
2. **Age range**: 4–6, 6–8, or 8–10?
3. **Game ID**: Short, URL-safe name for the folder (e.g. `animal-sounds`, `color-match`)
4. **Hebrew title**: What's the Hebrew name? (you can suggest one)
5. **Does it need audio/speech?** Yes (Hebrew TTS) / No / Just sound effects

If the user gives you enough info upfront, skip to Step 2.

### Step 2: Design the Game (Before Writing Any Code)

Produce a design brief:

```
Game: [Title] ([ID])
Age: [Range]
Mechanic: [What the player does in one sentence]
Learning: [What they learn]
Three screens:
  Welcome: [What's on it]
  Game: [Main interaction described]
  Complete: [What the celebration shows]
Data: [Number of items per difficulty, example item]
Audio: [Yes/No, what speech is used]
```

Wait for user to approve the design brief before writing any code.

## Step 3: Create the Files

**Start by copying the game template — never write files from scratch.**

```bash
cp -r game-template games/[game-id]
```

Then edit each file in order:
1. `games/[game-id]/data.js` — replace placeholder ITEMS with real game content and config
2. `games/[game-id]/index.html` — replace GAME_TITLE and GAME_DESCRIPTION, adjust screen content
3. `games/[game-id]/styles.css` — replace GAME_TITLE comment, customize any colors needed
4. `games/[game-id]/main.js` — implement `buildQuestions()`, `showQuestion()`, `onAnswer()` game logic

**CRITICAL: Do NOT rewrite the audio block in `main.js` (the first ~80 lines).** That block is pre-implemented correctly for iOS Safari. Only add game logic in the marked sections.

## File Requirements (Non-Negotiable)

### data.js Must Have:
```javascript
// Minimum 15 items per difficulty level
const ITEMS = [ { word, emoji, meaning, difficulty }, ... ];
const GAME_CONFIG = {
    easy:   { questionsPerRound: 5,  optionsCount: 2 },
    medium: { questionsPerRound: 8,  optionsCount: 3 },
    hard:   { questionsPerRound: 10, optionsCount: 4 },
};
const ENCOURAGEMENT = [...]; // Hebrew phrases
const TRY_AGAIN = [...]; // Hebrew phrases
```

### index.html Must Have:
- `<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">`
- `<link rel="stylesheet" href="../../platform/responsive.css">` FIRST stylesheet
- `dir="rtl" lang="he"` on `<html>`
- Google Fonts: Rubik (and Fredoka if needed)
- `<div id="app">` as root container
- Home button: `<a href="../../index.html" class="home-btn" aria-label="Return to Home">🏠</a>`
- Three screens: `#welcome-screen`, `#game-screen`, `#complete-screen` (welcome has `.active`)
- `<script src="data.js"></script>` before `<script src="main.js"></script>`

### styles.css Must Have:
- All 9 CSS variables in `:root`
- Base styles (`*`, `html, body`, `body`, `#app`)
- Screen system (`.screen`, `.screen.active`, `.screen-content`)
- Home button (exact: `position: fixed; top: 15px; left: 15px; width: 50px; height: 50px; border-radius: 50%`)
- `.magic-btn` and `.magic-btn.secondary`
- `@media (max-width: 480px)` breakpoint
- `min-height: 100svh` (not just `100vh`)

### main.js Must Have:
- Audio context management (lazy init, unlock on user gesture)
- `unlockAudio()` called in the start button handler
- Both `click` and `touchstart` handlers on ALL interactive buttons
  - `touchstart` must use `{ passive: false }` and `e.preventDefault()`
- Screen navigation: `showScreen(screenId)` function
- Game state: difficulty selection, score tracking, question progression
- `speakWord(text)` function if using Hebrew TTS
- `waitForVoices()` if using speech
- Confetti or celebration animation on complete screen

## Step 4: Register the Game

Add the game to `platform/games.json`:
```json
{
    "id": "[game-id]",
    "title": "[Hebrew title]",
    "description": "[1 sentence in Hebrew]",
    "path": "games/[game-id]/index.html",
    "image": "🎮"
}
```

Use an appropriate emoji for the image field that represents the game theme.

## Step 5: Verify

After creating all files, do a quick self-check:
- [ ] Three screens present and named correctly
- [ ] Home button in correct position
- [ ] `responsive.css` linked first
- [ ] Audio unlock pattern on start button
- [ ] Touch events on all interactive elements
- [ ] `viewport-fit=cover` in meta
- [ ] Registered in `platform/games.json`
- [ ] All CSS variables defined

Then tell the user: "Game created! Test it locally with `python3 -m http.server 8000` then open `http://localhost:8000/games/[game-id]/`"

## Reference Implementation

Copy patterns from `games/hebrew-writer/` — it's the gold standard for this platform. When in doubt, look there first.

## Workflow After Creating

Follow CLAUDE.md workflow rules:
1. Create a GitHub issue if one doesn't exist
2. Create a feature branch
3. Post a comment on the issue summarizing what was built
4. Open a PR with "Fixes #[issue]" in the description
