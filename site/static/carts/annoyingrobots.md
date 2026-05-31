---
author: Shimon Ulewicz <sulewicz>
date: 2026-05-30
---

# Annoying Robots

A compact WASM-4 adaptation of an old board game.

## How to play

Lead your team of robots across the board and try to reach the opposite side before your opponent does.

Robots come in different sizes: **larger robots can climb onto smaller ones**, but only the top robot in a stack can move.

On your turn, select a robot and either move it one space, jump over other robots, or jump onto smaller robots. **Jumps can be chained**, like in checkers.

## Modes

1. Play against the AI on Easy, Medium, or Hard
2. **2P LOCAL** — two players on one device (hot-seat, pass the keyboard each turn)
3. **2P NETPLAY** — two players online via WASM-4 netplay (shown automatically when a netplay session is active)

## Online multiplayer (netplay)

1. Host: start the cart and press **Enter** → **Copy Netplay URL** in the WASM-4 menu, and send the link to your opponent.
2. Guest: open the link — you join as Player 2 (circles).
3. Host: once the other player joins select **2P NETPLAY**.
4. Play proceeds turn by turn, each player can only act on their own turn.

**Roles:** Player 1 (host) = squares, top side. Player 2 (guest) = circles, bottom side.

## Controls

* **Arrow keys / D-pad:** Move cursor
* **Z:** Select / move / act
* **X:** Help, end turn, or return to menu

The in-game help screen explains the rules as well.

Have fun!
