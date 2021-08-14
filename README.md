<h1 align="center">
  <br>
  <a href="https://wasm4.org" target="_blank"><img src="https://wasm4.org/img/logo.svg" alt="WASM-4 Logo" width="200"></a>
  <br>
  WASM-4
  <br>
</h1>

<h3 align="center">Build retro games using WebAssembly for a fantasy console</h3>

<h4 align="center">
  <a href="https://wasm4.org" target="_blank">Website</a> •
  <a href="https://wasm4.org/play" target="_blank">Showcase</a> •
  <a href="https://wasm4.org/docs" target="_blank">Docs</a> •
  <a href="https://github.com/aduros/wasm4/discussions">Discussions</a>
</h4>

## About

WASM-4 is a low-level fantasy game console for building small games with WebAssembly. Game
cartridges (ROMs) are small, self-contained .wasm files that can be built with any programming
language that compiles to WebAssembly.

## Key Features

* Minimal: Fantasy consoles force developers to work within tech and design limitations. This is in
  contrast to large game engines like Unity, which can be daunting and distracting.

* Language Agnostic: Use any programming language, as long as it can compile to WebAssembly. Out of
  the box we currently support: AssemblyScript, C/C++, Rust, Go.

* Run Anywhere: WASM-4 is designed to be portable, with the goal of running on any device that can
  execute WebAssembly, even outside of the web. We're planning a SDL implementation written in C
  that will run even on a potato.

## 60 Second Quickstart

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

## Hardware Specs

- Display: 160x160 pixels, 4 customizable colors, updated at 60 Hz.
- Memory: 64 KB linear RAM, memory-mapped I/O, save states.
- Cartridge Size Limit: 128 KB.
- Input: Keyboard, mouse, touchscreen, up to 4 gamepads.
- Audio: 2 pulse wave channels, 1 triangle wave channel, 1 noise channel.
- Disk Storage: 1024 bytes.

## Contributing

There are many ways to contribute, here are just a few ideas:

- **Build a game or experiment, we'll feature it on wasm4.org!**
- Improve our documentation or write a tutorial.
- Submit a bug report or feature request on Github.
- Answer questions on the discussions forum.
- Implement support for a new tool or language.

## Roadmap

Here are WASM-4's goals for the future:

- Grow and support a friendly open source community.
- Build a lightweight native runtime in C + SDL.
- Support bundling of native Windows/Mac/Linux/Android/iOS applications.
- Add a pause button and options menu to the emulator.
- First-class support for new languages: [Swift](https://swiftwasm.org/),
  [Zig](https://ziglang.org/).
- Support importing and playing music from [Beepbox](https://www.beepbox.co).
- Improve responsiveness of the virtual gamepad on mobile.
