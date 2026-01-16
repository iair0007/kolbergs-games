Project Overview

This repository contains Kolberg’s Games, a static, browser based game platform designed for creating multiple child friendly games using shared infrastructure.

Games are defined through configuration and assets and executed by a shared JavaScript engine.
The platform is deployed using static hosting, currently GitHub Pages.

The primary goals are simplicity, reuse, and easy creation of new games without modifying the engine.

Architecture Principles

Games are data driven

A single shared engine powers all games

Static hosting compatibility is mandatory

No backend or database is required by default

Shared assets are reused across games

Game specific logic lives in configuration, not custom code

Authoritative design decisions are documented under specs/ and .specify/.

Repository Structure
/
├─ platform/        Shared game engine code
├─ games/           Individual game folders
├─ shared/          Shared assets and utilities
├─ specs/           Architecture and behavior specifications
├─ .specify/        Spec-kit artifacts
├─ index.html       Platform entry point

platform/

Contains engine code only.

Must not reference specific games

Must not embed game specific assets

Public APIs should be documented in specs

games/

Contains all playable games.

Each game lives in its own folder and is fully self contained.

/games/<game-id>/
  game.json
  assets/


Rules:

<game-id> must be unique and URL safe

Games must not depend on each other

Adding a new game must not require engine changes

No per game JavaScript logic

shared/

Contains shared assets and utilities.

Assets may be reused by multiple games

Must not reference specific games

Paths must remain stable

specs/

Contains authoritative specifications.

Folder structure

Game definition schema

Engine API contracts

Future extension plans

Specs guide implementation and evolution.

Game Definitions

Each game is defined by a static JSON file

Game behavior, scenes, and assets are declared, not coded

The engine loads game definitions dynamically

JSON schemas and expectations are documented in specs/

Deployment

The project must run entirely on static hosting

GitHub Pages compatibility is required

No build step is assumed

All paths must be relative and browser safe

How to Run Locally

This project is a static HTML, JavaScript, and CSS application.

To run it locally, serve the repository root using a simple HTTP server.

Recommended command:

python3 -m http.server 8000


Then open a browser at:

http://localhost:8000


Opening index.html directly from the filesystem is not recommended, as asset loading relies on HTTP requests.

Responsive Design

All games MUST follow the responsive layout specification to ensure correct rendering on desktop, tablet, and mobile devices.

See specs/responsive-layout.md for:

Required viewport meta tag

Required platform responsive CSS inclusion

Canvas resize utility usage (for canvas-based games)

Testing checklist for device compatibility

Common responsive issues and solutions


Key requirements:

Include platform/responsive.css in every game

Use proper viewport meta tag with viewport-fit=cover

Test on mobile devices (or browser DevTools device emulation)

Avoid fixed pixel sizes that exceed viewport



AI Agent Guidelines

When modifying or generating code:

Follow specs before implementation

Update specs first if behavior changes

Do not introduce backend dependencies unless explicitly requested

Do not add per game JavaScript logic

Prefer simple, readable solutions over abstractions

Keep changes scoped and explain assumptions

Preserve compatibility with existing games

When specs and implementation disagree, specs are the source of truth.

Out of Scope

User accounts

Analytics and tracking

Monetization

Multiplayer

Server side logic

Notes for Future Evolution

Backend services must be optional and replaceable

Save progress and preferences may be added later

New features should not break existing games

Static first principles must be preserved