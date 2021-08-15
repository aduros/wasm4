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

* **Minimalist**: Fantasy consoles force developers to work within tech and design limitations. This is in
  contrast to large game engines like Unity, which can be daunting and distracting.

* **Language Agnostic**: Use any programming language, as long as it can compile to WebAssembly. Out of
  the box we currently support: AssemblyScript, C/C++, Rust, Go.

* **Portable**: WASM-4 is designed to run on any device that can execute WebAssembly, even outside of
  the web. We're planning a lightweight implementation written in C that will run even on a potato.

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
