<h1 align="center">
  <br>
  <a href="https://wasm4.org"><img src="https://wasm4.org/img/logo.svg" alt="WASM-4 Logo" width="200"></a>
  <br>
  WASM-4
  <br>
</h1>

<h3 align="center">Build retro games using WebAssembly for a fantasy console</h3>

<h4 align="center">
  <a href="https://wasm4.org">Website</a> •
  <a href="https://wasm4.org/play">Showcase</a> •
  <a href="https://wasm4.org/docs">Docs</a> •
  <a href="https://github.com/aduros/wasm4/discussions">Discussions</a>
</h4>

## About

**WASM-4** is a low-level fantasy game console for building small games with WebAssembly. Game
cartridges (ROMs) are small, self-contained `.wasm` files that can be built with any programming
language that compiles to WebAssembly.

## Key Features

* **No Glue Code**: If you've ever tried to write even a simple "Hello World"
  with WebAssembly before, you'll know it usually involves writing a bunch of
  JS and HTML glue. WASM-4 removes all of that, games interface directly with
  the system through a small API.

* **Minimalist**: Fantasy consoles force developers to work with limited resources.
  This makes them simple to learn, and easier to focus on finishing your game.

* **Language Agnostic**: Use any programming language, as long as it can compile to WebAssembly. Out
  of the box we currently support: AssemblyScript, C/C++, D, Go, Nelua, Nim, Odin, Rust, WAT, and
  Zig.

* **Portable**: WASM-4 is designed to run on any device that can execute WebAssembly, even outside
  of the web! It includes a lightweight runtime written in C that runs even [low-powered microcontrollers](https://twitter.com/alvaroviebrantz/status/1518343016011943939)
  and [obsolete hardware](https://twitter.com/wasm4_org/status/1483140582943956992).

* **Netplay**: Instant online multiplayer, featuring rollback netcode. All games that support local
  multiplayer automatically support netplay. WASM-4 handles syncing controller inputs over the
  Internet.

## 🚀 60 Second Quickstart

```shell
# Install the w4 command
npm install -g wasm4

# Create a project
w4 new --assemblyscript hello-world

# Setup toolchain
cd hello-world
npm install

# Build and run your game!
npm run build
w4 run build/cart.wasm
```

For more info and guides, check the [full documentation](https://wasm4.org/docs).

## 🎮 Hardware Specs

- Display: 160x160 pixels, 4 customizable colors, updated at 60 Hz.
- Memory: 64 KB linear RAM, memory-mapped I/O, save states.
- Cartridge Size Limit: 64 KB.
- Input: Keyboard, mouse, touchscreen, up to 4 gamepads.
- Audio: 2 pulse wave channels, 1 triangle wave channel, 1 noise channel.
- Disk Storage: 1024 bytes.

## 🙏 Contributing

Contributions are welcome! Here are just a few ways to help:

- **Build a game or experiment, we'll feature it on wasm4.org!**
- Improve our documentation or write a tutorial.
- Submit a bug report or feature request on Github.
- Answer questions on the discussions forum.
- Implement support for a new tool or language.
- Give the project a star on Github for visibility.
