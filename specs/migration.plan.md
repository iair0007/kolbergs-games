# Existing Game Migration Plan

## Goal
Migrate the existing birthday game into the new platform structure as an independent game, without changing its behavior or user experience.

## Source
The existing birthday game currently exists as a standalone local project at:

/Users/iairprivate/Yuval_Birthday 2

This path is provided for migration reference only and is not part of the platform structure.

## Target Location
The game will live under:

/games/yuval-birthday/

## Migration Principles

1. Behavior preservation  
   The game must behave exactly the same after migration.

2. Minimal changes  
   Only changes required for relocation and navigation are allowed.

3. Isolation  
   The migrated game must not depend on the platform or other games.

4. Incremental steps  
   The migration should be done in small, verifiable steps.

## Migration Steps

1. Create the game directory under `/games/yuval-birthday`.
2. Copy existing game files into that directory.
3. Update asset paths to work from the new location.
4. Ensure the game can be opened directly via its `index.html`.
5. Add a clear navigation option back to the platform page.
6. Verify the game works when deployed via GitHub Pages.

## Validation

- The game loads without errors.
- All images and sounds work correctly.
- Gameplay is unchanged.
- Navigation back to the platform works.

## Non-Goals

- Refactoring game logic.
- Converting the game to shared utilities.
- Changing visuals or gameplay.
