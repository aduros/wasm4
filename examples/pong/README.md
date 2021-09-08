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


#### Reduce bundle size after compilation

Use [wasm-opt](https://github.com/WebAssembly/binaryen) to reduce cartridge size after `rustc` compilation:

```bash
wasm-opt -Oz -o output.wasm input.wasm
```

More info are available [here](https://rustwasm.github.io/book/reference/code-size.html#use-the-wasm-opt-tool).

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
