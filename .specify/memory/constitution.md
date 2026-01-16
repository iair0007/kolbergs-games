Purpose

The purpose of this project is to create a reusable, child friendly game platform that enables the creation of multiple personalized games using shared infrastructure and assets, while keeping development simple, maintainable, and joyful.

The system must allow new games to be added with minimal code changes and maximum reuse of existing logic and resources.

Core Principles

Data Driven Games

Each game must be defined primarily through data, not custom code.

Game behavior, assets, and flow should be configurable via structured files such as JSON.

Adding a new game should not require modifying the core engine.

Shared Engine, Isolated Games

A single shared engine must power all games.

Games must not depend on each other.

The engine must not contain game specific assets or logic.

Static First Architecture

The system must work entirely on static hosting.

GitHub Pages compatibility is a hard requirement.

No runtime server dependency is allowed by default.

Optional Backend, Never Required

Backend services or databases may be added later.

The core architecture must not assume their existence.

Switching from static data to a backend must not require rewriting the engine.

Asset Reuse and Composition

Assets may be shared across games.

Games must be able to reference shared assets explicitly.

Asset loading must be centralized and consistent.

Simplicity Over Abstraction

Prefer simple, explicit structures over clever abstractions.

Readability and ease of understanding matter more than flexibility.

The project should be approachable by future contributors or by the author returning after time away.

Child Safety and Privacy

No personal data is collected or stored by default.

Games must run without accounts or tracking.

All content is explicitly provided and controlled by the project.

Incremental Growth

The architecture must support small beginnings.

Features should be added only when needed.

The system should scale by composition, not complexity.

Non Goals

Multiplayer functionality

Real time server communication

User authentication or accounts

Monetization or ads

Analytics or tracking by default

Architectural Boundaries

The engine may load game definitions but must not embed them.

Game definitions may reference assets but must not manipulate engine internals.

Rendering, input handling, and asset loading are engine responsibilities.

Story, characters, levels, and visuals are game responsibilities.

Evolution Policy

Any new feature must respect static hosting compatibility unless explicitly marked as optional.

Backend features must be additive and replaceable.

Breaking changes to game definitions should be avoided or versioned.