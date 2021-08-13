---
slug: /
---

# Introduction

WASM-4 is a low-level fantasy game console for building small games with
[WebAssembly](https://webassembly.org/). Game cartridges (ROMs) are small, self-contained `.wasm`
files that can be built with any programming language that compiles to WebAssembly.

## Why WASM-4?

Fantasy consoles force developers to work within tech and design limitations. The idea is that by
removing excess and focusing on the essential, it becomes easier to start *and finish* developing a
game. This is in contrast to large game engines like Unity, which can be daunting and distracting.

WASM-4 is designed to be portable, with the goal of running on any device that can execute
WebAssembly, even outside of the web. The main implementation runs on web browsers, but a native
implementation that can run on cheap microcontrollers is planned.

Finally, WASM-4 is a fun and easy way to experiment with new programming languages. Ever wanted to
learn Rust, Go, or AssemblyScript? As long as it compiles to WebAssembly, you can build games with
it.

## Hardware Specs

- Display: 160x160 pixels, 4 customizable colors, updated at 60 Hz.
- Memory: 64 KB linear RAM, memory-mapped I/O, save states.
- Cartridge Size Limit: 128 KB.
- Input: Keyboard, mouse, touchscreen, up to 4 gamepads.
- Audio: 2 pulse wave channels, 1 triangle wave channel, 1 noise channel.
- Disk Storage: 1024 bytes.

Don't worry if you don't understand what some of this means yet! The rest of this documentation will
go into depth on how the system works.

Let's get started by [setting up WASM-4](/docs/getting-started/setup).
