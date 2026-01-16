Folder Structure Specification
Purpose

This document defines the canonical folder structure for the Kolberg’s Games platform.

The structure is designed to:

Support multiple independent games

Enable shared assets and logic

Work with static hosting

Scale without introducing unnecessary complexity

This structure is considered authoritative. New code and games must conform to it.

Root Level Structure
/
├─ platform/
├─ games/
├─ shared/
├─ specs/
├─ index.html
├─ README.md

/platform
Responsibility

The platform directory contains the core game engine.

This code is shared by all games and must not include game specific logic or assets.

Contents

Typical contents include:

Rendering logic

Input handling

Asset loading

Scene or state management

Platform level utilities

Rules

No references to specific games

No hardcoded asset paths pointing into /games

Public APIs should be documented in specs

/games
Responsibility

The games directory contains all playable games.

Each game is fully self contained and defined by configuration and assets.

Structure
/games
  /<game-id>/
    game.json
    assets/

Rules

Each game lives in its own folder

<game-id> must be unique and URL safe

Games must not depend on each other

Games must not import platform internals directly

/games/<game-id>/game.json
Responsibility

Defines the game configuration.

This file describes:

Game metadata

Scenes or levels

Asset references

Text and narration

The engine loads this file to run the game.

Rules

Must be static JSON

No executable code

Must conform to the game definition spec

/games/<game-id>/assets
Responsibility

Contains game specific assets.

Examples:

Images

Audio files

Fonts specific to the game

Rules

Assets are private to the game

File names must not conflict with shared assets

Paths are relative to the game folder

/shared
Responsibility

The shared directory contains reusable assets and utilities used by multiple games.

Structure
/shared
  /assets
    /images
    /audio
    /fonts
  /utils

Rules

Shared assets must not reference specific games

Shared utilities must be generic

Shared assets should be stable and backward compatible

/specs
Responsibility

Contains all specification documents for the platform.

These documents define behavior, structure, and contracts.

Examples

Folder structure specification

Game definition schema

Engine API specification

Future extension specs

Rules

Specs guide implementation

Specs are updated before major architectural changes

Specs are not runtime dependencies

/index.html
Responsibility

The main entry point for the platform.

Responsibilities include:

Listing available games

Routing to a selected game

Bootstrapping the engine

Evolution Guidelines

New folders must have a clear, documented responsibility

Breaking structural changes require spec updates

Backends or build outputs must live outside the core structure or be clearly isolated

Summary

This structure enables:

Static hosting compatibility

Clear separation of concerns

Easy addition of new games

Safe reuse of shared logic and assets

All contributors and future changes must follow this structure unless the specification is updated.