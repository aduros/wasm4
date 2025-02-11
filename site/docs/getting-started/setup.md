import MultiLanguage, {Page} from '@site/src/components/MultiLanguage';

# Setup

Download WASM-4:

<p>
<a href="https://github.com/aduros/wasm4/releases/latest/download/w4-windows.zip" className="button button--primary button--outline button--lg margin--md">📥 Windows</a>
<a href="https://github.com/aduros/wasm4/releases/latest/download/w4-mac.zip" className="button button--primary button--outline button--lg margin--md">📥 macOS</a>
<a href="https://github.com/aduros/wasm4/releases/latest/download/w4-linux.zip" className="button button--primary button--outline button--lg margin--md">📥 Linux</a>
</p>

<Button/>

This contains the `w4` command that will be used to create new projects and run games locally.

:::info
You can also install `w4` with NPM by running `npm install -g wasm4`
:::

## Quickstart

Let's go over creating a new project called `hello-world` for your chosen language. Use the dropdown
menu to select a different language.

<MultiLanguage>

<Page value="assemblyscript">

To compile AssemblyScript projects you will need `npm` installed.

```shell
w4 new --assemblyscript hello-world
cd hello-world
```

First we'll setup AssemblyScript (this only needs to be done once):

```shell
npm install
```

Compile the .wasm cartridge:

```shell
npm run build
```

Run it in WASM-4 with:

```shell
w4 run build/cart.wasm
```

</Page>

<Page value="c">

To compile C/C++ projects you will need to download the [WASI SDK](https://github.com/WebAssembly/wasi-sdk) and set the `$WASI_SDK_PATH` environment variable.

```shell
w4 new --c hello-world
```

For a C++ project pass `--cpp` instead of `--c` like this:

```shell
w4 new --cpp hello-world
```

Compile the .wasm cartridge:

```shell
cd hello-world
make
```

Run it in WASM-4 with:

```shell
w4 run build/cart.wasm
```

</Page>

<Page value="C3">

To compile WASM-4 cartridges written in C3 you will need the [C3 compiler](https://github.com/c3lang/c3c/releases/tag/latest). 
The sample project uses freestanding WASM, so some libc-dependent features are unavailable.

```shell
w4 new --c3 hello-world
cd hello-world
```

Compile the .wasm cartridge from within the project directory:

```shell
c3c build
```

Run it in WASM-4 with:

```shell
w4 run cart.wasm
```

</Page>

<Page value="d">

To compile D projects you will need `ldc` and `dub` installed. To use libc, you also need to download the [WASI SDK](https://github.com/WebAssembly/wasi-sdk) and set the `$WASI_SDK_PATH` environment variable.

```shell
w4 new --d hello-world
cd hello-world
```

Compile the .wasm cartridge:

```shell
make
```

Run it in WASM-4 with:

```shell
w4 run cart.wasm
```

</Page>

<Page value="go">

To compile Go projects you will need `go` and `tinygo` installed.

```shell
w4 new --go hello-world
cd hello-world
```

Compile the .wasm cartridge:

```shell
make
```

Run it in WASM-4 with:

```shell
w4 run build/cart.wasm
```

</Page>

<Page value="nelua">

To compile nelua projects you will need `nelua` installed. You will also need to download the [WASI SDK](https://github.com/WebAssembly/wasi-sdk) and set the `$WASI_SDK_PATH` environment variable.

```shell
w4 new --nelua hello-world
cd hello-world
```

Compile the .wasm cartridge:

```shell
make
```

Run it in WASM-4 with:

```shell
w4 run build/cart.wasm
```

</Page>

<Page value="nim">

To compile Nim projects you will need `nimble` installed. You will also need to download the [WASI SDK](https://github.com/WebAssembly/wasi-sdk) and set the `$WASI_SDK_PATH` environment variable.

```shell
w4 new --nim hello-world
cd hello-world
```

Compile the .wasm cartridge:

```shell
nimble rel
```

Run it in WASM-4 with:

```shell
w4 run build/cart.wasm
```

</Page>

<Page value="odin">

To compile Odin projects you will need to download the [WASI SDK](https://github.com/WebAssembly/wasi-sdk) and set the `$WASI_SDK_PATH` environment variable. You'll also need the latest version of [Odin](https://github.com/odin-lang/Odin).

```shell
w4 new --odin hello-world
cd hello-world
```

Compile the .wasm cartridge:

```shell
make
```

Run it in WASM-4 with:

```shell
w4 run build/cart.wasm
```

</Page>

<Page value="penne">

:::note
[Penne](https://github.com/SLiV9/penne) is a work-in-progress esoteric language, so there are no stability guarantees. Your feedback is highly appreciated.
:::

To compile WASM-4 cartridges written in Penne you will need a [Penne compiler](https://github.com/SLiV9/penne/releases/latest) and a wasm-compatible version of clang. The easiest way is to download the [WASI SDK](https://github.com/WebAssembly/wasi-sdk) and set the `$WASI_SDK_PATH` environment variable.

```shell
w4 new --penne hello-world
cd hello-world
```

Compile the .wasm cartridge:

```shell
make
```

Run it in WASM-4 with:

```shell
w4 run build/cart.wasm
```

</Page>

<Page value="porth">

:::note
[Porth](https://gitlab.com/tsoding/porth#porth) is currently a work in progress language. Anything can change at any moment without notice.
:::

To compile Porth projects you will need to download [4orth](https://github.com/LunaAmora/4orth#4orth) and add it to `$PATH`.

```shell
w4 new --porth hello-world
cd hello-world
```

Compile the .wasm cartridge:

```shell
make
```

Run it in WASM-4 with:

```shell
w4 run build/cart.wasm
```

</Page>

<Page value="roland">

:::note
[Roland](https://github.com/DenialAdams/roland) is still under development. There are no stability guarantees, but your feedback will be highly influential!
:::

To compile Roland projects you will need to download [rolandc](https://github.com/DenialAdams/roland#getting-the-compiler) binary and put it on your path.

```shell
w4 new --roland hello-world
cd hello-world
```

Compile the .wasm cartridge:

```shell
rolandc cart.rol --wasm4
```

Run it in WASM-4 with:

```shell
w4 run cart.wasm
```

</Page>

<Page value="rust">

To compile Rust projects you will need `cargo` installed. You will also need the wasm32 target,
which can be installed with `rustup target add wasm32-unknown-unknown`.

```shell
w4 new --rust hello-world
cd hello-world
```

Compile the .wasm cartridge:

```shell
cargo xtask build
```

Run it in WASM-4 with:

```shell
w4 run target/wasm32-unknown-unknown/release/cart.wasm
```

</Page>

<Page value="wat">

To compile WebAssembly Text projects you will need to download [WABT](https://github.com/WebAssembly/wabt) and set the `$WABT_PATH` environment variable.

```shell
w4 new --wat hello-world
cd hello-world
```

Compile the .wasm cartridge:

```shell
make
```

Run it in WASM-4 with:

```shell
w4 run build/cart.wasm
```

</Page>

<Page value="zig">

To compile Zig projects you will need a recent build of `zig` installed.

```shell
w4 new --zig hello-world
cd hello-world
```

Compile the .wasm cartridge:

```shell
zig build -Doptimize=ReleaseSmall
```

Run it in WASM-4 with:

```shell
w4 run zig-out/bin/cart.wasm
```

</Page>

</MultiLanguage>

:::tip
You can also use `w4 watch` to automatically watch for changes in source files and rebuild in real-time.
:::

## Next Steps

Next let's take a look at some source code for [Hello World](/docs/getting-started/hello-world).
