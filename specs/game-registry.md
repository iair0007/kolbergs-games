Game Registry Specification
Purpose

The game registry defines which games are available on the platform and how they are discovered and loaded.

The registry is used by the platform entry point to:

List available games

Display basic game metadata

Navigate to a selected game

The registry is static and is loaded at runtime by the browser.

Registry Location

The game registry is stored as a JSON file at the project root.

The file contains an array of game entries.

Registry Structure

The registry file must contain a JSON array.

Each element in the array represents a single game.

Example:

[
  {
    "id": "yuval-birthday",
    "title": "Yuval's Birthday Adventure",
    "description": "A superhero birthday adventure",
    "path": "/games/yuval-birthday/index.html"
  }
]

Game Entry Fields
id

Type: string

Required: yes

A unique identifier for the game.

Rules:

Must be unique across the registry

Must be URL safe

Must match the game folder name under /games

title

Type: string

Required: yes

The human readable name of the game.

This value is displayed in the platform UI.

description

Type: string

Required: no

A short description of the game.

This value may be displayed in the platform UI.

path

Type: string

Required: yes

The static path used to load the game.

Rules:

Must be a valid relative path

Must point to a static HTML entry point

Must be compatible with static hosting

Behavior Rules

The registry is loaded at runtime

Games are listed in the order they appear in the array

Removing an entry removes the game from the platform

Adding an entry makes a game available without engine changes

Constraints

The registry must be static JSON

No executable code is allowed

No backend dependency is required

The registry must work on GitHub Pages

Evolution Guidelines

New fields may be added only if optional

Existing fields must remain backward compatible

Changes to registry structure require updating this spec