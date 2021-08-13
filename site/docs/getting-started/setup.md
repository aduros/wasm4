# Setup

You'll need to have [Node.js](https://nodejs.org) on your system. Install WASM-4 by running:

```shell
npm install -g wasm4
```

This will install the `w4` command that will be used to create new projects and run games locally.

## Quickstart

Let's use AssemblyScript to quickly create, build, and run a starter project.

Create a new directory called `hello-world` containing an AssemblyScript project:

```shell
w4 new --assemblyscript hello-world
```

First we'll setup AssemblyScript (this only needs to be done once):

```shell
cd hello-world
npm install
```

Now we can compile the .wasm cartridge:

```shell
npm run build
```

Then run it in WASM-4 with:

```shell
w4 run build/cart.wasm
```

:::tip
You can also use `w4 watch` to automatically watch for changes in source files and rebuild in real-time.
:::

## Other Languages

Building games requires a compiler of the programming language of your choice. Here
are a few options that should work with WASM-4 out of the box:

- [AssemblyScript](https://www.assemblyscript.org/): Easiest to setup and use.
- [C/C++](https://github.com/WebAssembly/wasi-sdk): Any recent version of clang should work.
- [Rust](https://www.rust-lang.org/learn/get-started)
- [Go](https://tinygo.org/getting-started/install/)

If you get WASM-4 working with [other WebAssembly languages](https://github.com/appcypher/awesome-wasm-langs), we'd love to hear about it!

Next let's take a look at some source code for [Hello World](/docs/getting-started/hello-world).
