Game Definition Specification
Purpose

This document defines the minimum structural contract that every game on the platform must follow.

The goal is to ensure all games can be loaded, executed, and maintained by the shared platform engine, while allowing flexibility in game content, assets, and internal organization.

This spec defines boundaries, not implementation details.

Core Principles

Games are self contained

Games are data driven where possible

Games share a common entry contract

Games may differ in content and structure internally

The platform must not require game specific logic

Required Game Structure

Each game must live in its own directory under /games.

/games/<game-id>/


Where <game-id> matches the id defined in the game registry.

Required Entry Point

Each game must expose a static HTML entry point.

/games/<game-id>/index.html


Rules:

Must be loadable via static hosting

Must not assume a backend

Must bootstrap the shared platform engine

The platform navigates to this entry point when the game is selected.

Required Behavior

When loaded, a game must:

Initialize using the shared engine

Load any required assets

Start the game without manual user configuration

The game must not depend on other games.

Optional Game Configuration

Games may include a configuration file.

Example:

/games/<game-id>/game.json


This file may describe:

Scenes or levels

Asset references

Text or narration

Game specific parameters

Rules:

Configuration must be static JSON

No executable code is allowed

The engine must tolerate missing optional fields

The presence of a configuration file is optional unless required by the engine.

Assets

Games may include assets in any internal structure.

Example:

/games/<game-id>/assets/


Rules:

Assets are scoped to the game

Games may reference shared assets under /shared

Asset paths must be relative and static

The internal asset folder structure is flexible.

Allowed Flexibility

Games may differ in:

Number of files

Internal folder structure

Scene models

Content types

Asset organization

As long as:

The entry point contract is respected

Static hosting compatibility is preserved

The game remains self contained

Disallowed Patterns

Games must not:

Import or modify other games

Modify platform engine internals

Require runtime server communication

Include game specific JavaScript logic in the platform layer

Evolution Guidelines

New optional conventions may be introduced

Existing games must continue to work

If stricter structure becomes necessary, it must be documented in this spec

Summary

A game is defined by:

A unique directory

A static entry point

Optional configuration and assets

Compatibility with the shared engine

This spec exists to enable creative freedom without architectural drift.