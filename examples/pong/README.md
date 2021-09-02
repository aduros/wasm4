# Pong W4

## Description

A [pong](https://en.wikipedia.org/wiki/Pong) game cartridge written in [rust].

## Develop

## Requirements

- [rust toolchain](https://www.rust-lang.org/tools/install)
- [wasm4](https://wasm4.org/docs/getting-started/setup).

#### Release build

```bash
cargo build --release
```

#### Build with dev_tools feature

An optional feature, `dev_tools`, can be enabled to provide
additional development tools:

```bash
cargo build --release --features dev_tools
```

### Run locally

```bash
w4 run target/wasm32-unknown-unknown/release/pong_w4.wasm
```
