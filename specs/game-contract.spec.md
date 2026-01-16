# Game Contract Specification

## Overview
A game is a self-contained static application that can be launched from the platform and exited back to the platform without affecting other games.

## Required Structure

Each game must live under a unique directory inside `/games`.

Minimum required files:
- `index.html`  
  Entry point for the game.

Optional files:
- `game.js`  
- `style.css`
- `assets/`

## Entry and Exit

- The game must start when its `index.html` is loaded.
- The game must provide a visible and accessible way to return to the platform page.
- The game must not assume it is the only content hosted on the site.

## Isolation Rules

- A game must not modify global state outside its own page.
- A game must not rely on side effects from other games.
- A game must not depend on shared JavaScript unless explicitly imported.

## Shared Resources

- Games may import shared utilities from `/shared/js`.
- Games may reference shared assets from `/shared/assets`.
- Use of shared resources must be optional.

## Hosting Constraints

- Games must work in static hosting environments.
- Games must not require server-side code to function.

## Non-Goals

- Games are not required to share UI styles.
- Games are not required to use any specific framework.
- Games are not required to use shared utilities.
