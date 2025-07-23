---
author: Thiago Calvi
github: thiagocalvi
date: 2025-07-23
---

# UEM Mini Game

A mini-game developed in Go for the [WASM-4](https://wasm4.org) fantasy console.

The game features a 3D depth effect obstacle system where the player must dodge obstacles approaching down the road. Includes jump physics, collision detection, scoring system, and pause menu.

## Features

- **Player movement**: Use arrow keys to move and up arrow to jump
- **Dynamic obstacles**: Obstacles that grow and approach with 3D effect
- **Scoring system**: Score increases automatically during gameplay
- **Interactive menu**: Start menu and pause menu with navigation
- **Collision detection**: Game restarts when colliding with obstacles

## Controls

- **Left/Right arrows**: Horizontal movement
- **Up arrow**: Jump
- **X**: Confirm selection in menu / Start game
- **Z**: Pause game
- **Up/Down arrows**: Navigate pause menu

## How to play

1. In the start menu, press X to begin
2. Use arrow keys to move the square
3. Press up arrow to jump over obstacles
4. Avoid colliding with the red obstacles approaching you
5. Your score increases automatically as you survive
6. Press Z to pause at any time

## Building

Build the cart by running:

```shell
make
```

Then run it with:

```shell
w4 run build/cart.wasm
```

For more info about setting up WASM-4, see the [quickstart guide](https://wasm4.org/docs/getting-started/setup?code-lang=go#quickstart).

## Architecture

The game was developed using an Entity Component System (ECS) architecture with the following components:

- **Position**: X and Y coordinates
- **Drawable**: Rendering information (size and color)
- **Physics**: Velocity, gravity and jump physics
- **Depth**: 3D depth system for obstacles
- **PlayerInput**: Player input control

## Links

- [WASM-4 Documentation](https://wasm4.org/docs): Learn more about WASM-4
- [WASM-4 GitHub](https://github.com/aduros/wasm4): Official WASM-4 repository
