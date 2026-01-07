# Yuval Birthday Adventure Game

## Overview
This is a serverless, browser-based game designed for a 5-year-old child.
The game is a birthday adventure where the child chooses superheroes and birthday activities using images and videos only.
The child cannot read, so the UI must be fully visual, colorful, and simple.

The game runs fully in the browser with no backend.
All state is stored in browser localStorage.

## Core Flow
1. Welcome screen
2. Yuval selects his hero (Flash or Batman)
3. Yuval selects his team in order:
   - Brother (Or): Superman or Thor
   - Mother: Wonder Woman or Kate Bishop
   - Father: Hulk or Captain America
4. After each selection, show a team-up image or video of Yuval + selected character
5. After all selections, show the full team image or video
6. The game continues into birthday choices presented as levels:
   - Restaurant
   - Attraction
   - Dessert
7. Each category is a visual “enemy” with selectable options
8. After choosing an option, show a victory animation
9. End with a final celebration screen summarizing the day

## Target Audience
- 5-year-old child
- No reading required
- Large buttons
- Bright colors
- Simple animations
- No complex controls

## Asset Status (IMPORTANT)

This project already contains real assets on disk.
The code must adapt to existing files and never assume completeness.

Some assets exist as:
- .png only
- .mp4 only
- both .png and .mp4

Some filenames contain:
- casing inconsistencies
- known typos (e.g. falsh_thor)

The AssetLoader already handles these cases.
All screen logic must rely on AssetLoader and never assume a file exists.

## Technical Constraints
- No backend
- No database
- No login
- HTML, CSS, JavaScript only
- State stored in localStorage
- Mobile and tablet friendly

## Character Options

Yuval:
- flash
- batman

Or:
- superman
- thor

Mama:
- wonder
- bishop

Papa:
- hulk
- capitan

## Asset Loading Rules

### Base characters
Directory: /characters

Files:
- yuval_flash.png
- yuval_batman.png
- or_superman.png
- or_thor.png
- mama_wonder.png
- mama_bishop.png
- papa_hulk.png
- papa_capitan.png

### Team-up directories

Yuval + Or:
Directory: /yuval_or
- flash_superman.png
- flash_thor.png
- batman_superman.png
- batman_thor.png

Yuval + Mama:
Directory: /yuval_mama
- flash_wonder.png
- flash_bishop.png
- batman_wonder.png
- batman_bishop.png

Yuval + Papa:
Directory: /yuval_papa
- flash_hulk.png
- flash_capitan.png
- batman_hulk.png
- batman_capitan.png

### Full team assets

Directories:
- /flash_all_team
- /batman_all_team

Naming pattern:
{yuval}_{or}_{mama}_{papa}.mp4
Fallback to .png if video not found

Always try to load .mp4 first, then fallback to .png.

## Birthday Categories – Asset Directories

Each birthday category is represented by a directory of images.
All options are visual only (no text for the child).

### Restaurant
Directory: ./restaurant

Current assets:
- pizza.png
- hamburger.png
- steak.png
- wok.png

More assets may be added later.

### Attraction
Directory: ./Attraction

Current assets:
- theater.png
- video_games.png
- obstacle_game.png
- safari.png

### Dessert
Directory: ./Dessert
- ice_cream
- candies
- bakery
- strawberries

## Enemies System

Each birthday category has an associated enemy.
Enemies are visual story elements and must feel consistent with the heroes.

### Enemy Directories
Directory: ./enemies

Current enemies:
- Dragon.png (alive enemy)
- dragon_defeated.png (defeated state)

Enemy assets may exist as:
- image only
- image + video
- video only (in the future)

### Enemy Rules
- Enemies are illustrated, not photorealistic
- Enemies may be intimidating but not gory
- Defeated enemies must be clearly defeated (dead or gone)
- No blood, no wounds, no horror

### Enemy Usage
For each category:
1. Show enemy (alive)
2. User selects an option
3. Play defeat animation or show defeated enemy
4. Proceed to next category

## UX Rules
- One decision per screen
- Immediate visual feedback after each choice
- No reading required
- Friendly, game-like transitions
- Never block progress with errors

## Media Priority Rule

Whenever both a video (.mp4) and image (.png) exist:
- Always prefer the video
- Fallback to image if video is missing

## Video Handling
- If a video exists, play it
- If not, show the image
- Video duration should be short (3–5 seconds)

## Animation & Magic Philosophy

This game must feel magical, alive, and playful.
Animations are a core part of the experience, not optional polish.

Every screen should have motion, even if subtle.

The child cannot read, so animations help communicate:
- Progress
- Success
- Excitement
- Cause and effect

## Global Animation Rules

- Prefer many small animations over a few big ones
- Animations must be smooth, colorful, and friendly
- No violent or scary motion
- No fast flashing
- All animations should be understandable to a 5-year-old

## Required Animation Types

### 1. Screen Transitions
- Fade in / fade out
- Slide left / right between screens
- Zoom-in for important moments

Every screen change must be animated.

### 2. Idle Animations
- Characters gently breathing
- Capes or clothing subtly moving
- Background particles floating
- Light rays slowly shifting

Idle animations should loop calmly.

### 3. Selection Feedback
When a choice is selected:
- Button slightly scales up
- Brief glow or sparkle
- Short celebratory animation
- Non-selected options fade slightly

The child must immediately feel “I chose something”.

### 4. Team Formation Animations
After each team selection:
- Team-up image or video plays
- Additional overlay animation such as:
  - Energy pulse
  - Light burst
  - Magical particles
- Transition into next screen smoothly

### 5. Full Team Reveal
This is a major magical moment:
- Slow zoom-in
- Light burst or glow
- Confetti, stars, or sparkles
- Optional sound effect later

### 6. Category Levels (Enemies)
- Enemy appears with animation (pop-in, shake, roar without fear)
- Enemy reacts when option is selected
- Victory animation plays (enemy fades, sparkles, disappears)

### 7. Celebration Animations
- Confetti
- Fireworks
- Stars
- Floating balloons
- Colorful particle effects

The end screen should feel like a reward.

## Animation Technology Constraints

- Use CSS animations and transitions where possible
- Use JavaScript for timing and coordination
- Avoid heavy libraries or game engines
- Animations must run smoothly on tablets and phones
- Prefer looping animations with low CPU usage

## Animation Technology Choice

The project uses:
- Vanilla HTML, CSS, and JavaScript
- No UI frameworks
- No React, Vue, or similar
- No animation engines like GSAP

Optional:
- A very lightweight particle or confetti effect library
- Used only for major magical moments (team reveal, victory, celebration)

Particles must be:
- Short-lived
- Non-blocking
- Not distracting


## Animation Priority Order

If time is limited, prioritize animations in this order:
1. Selection feedback
2. Team formation
3. Full team reveal
4. Enemy defeat
5. Screen transitions
6. Idle background motion

## Important Rule

The game should never feel static.
If something is on screen, it should feel alive.
