# Platform Behavior Specification

## Overview
The platform is a static entry point that presents all available games and allows users to select and play them. It does not implement game logic and does not depend on the internal implementation of any game.

## Platform Page

- The platform page lists all available games.
- Each listed game includes:
  - A title
  - An optional description
  - A way to start the game

- The platform page must be accessible without loading any game code.

## Game Navigation

- Selecting a game navigates the user to that game’s own entry page.
- Each game is responsible for providing a way to return to the platform page.
- Navigation between games always goes through the platform page.

## Game Discovery

- Games are discovered via a known directory structure under `/games`.
- The platform may use a static data file or hardcoded list to define available games.
- The platform must not require inspecting or executing game code to list games.

## Isolation Guarantees

- The platform must not load game JavaScript until a game is selected.
- A failure in one game must not affect the platform or other games.
- The platform must not assume any shared runtime state between games.

## Hosting Constraints

- The platform must function on static hosting environments.
- No server-side logic is allowed for core platform behavior.

## Non-Goals

- The platform does not manage game state.
- The platform does not enforce visual consistency across games.
- The platform does not provide authentication or user accounts.
