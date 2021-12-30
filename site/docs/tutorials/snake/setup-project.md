import MultiLanguage, {Page} from '@site/src/components/MultiLanguage';


# Setup Your Project

Before you can begin, you need a project to work with. The CLI-Tool of WASM-4 includes templates for several programming languages like AssemblyScript, C, Go and Rust. More languages are sure to come in the future.

## The Terminal

Work is often easier on a terminal. For this step, open your terminal/powershell and navigate to your projects folder.

For the sake of having the same base, I assume the projects-folder is here: `~/Projects/`.  
On Linux and macOS this is usually `/home/[YOUR USERNAME]/Projects`.  
On Windows this is usually `C:\Users\[YOUR USERNAME]\Projects\`.

Below you'll find instructions for your language.

<MultiLanguage>

<Page value="assemblyscript">

To compile AssemblyScript projects you will need `npm` installed.

```shell
w4 new --assemblyscript snake
cd snake
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
w4 watch
```
</Page>

<Page value="c">

:::note Work in Progress
The tutorial for C/C++ is currently a Work-in-Progress. Most of the language specific instructions are currently missing.
:::

To compile C/C++ projects you will need to download the [WASI SDK](https://github.com/WebAssembly/wasi-sdk) and set the `$WASI_SDK_PATH` environment variable.

```shell
w4 new --c snake
cd snake
```

Compile the .wasm cartridge:

```shell
make
```

Run it in WASM-4 with:

```shell
w4 watch
```

</Page>

<Page value="d">

:::note Work in Progress
The tutorial for D is currently a Work-in-Progress. Most of the language specific instructions are currently missing.
:::

To compile D projects you will need to download the [WASI SDK](https://github.com/WebAssembly/wasi-sdk) and set the `$WASI_SDK_PATH` environment variable.

```shell
w4 new --d snake
cd snake
```

Compile the .wasm cartridge:

```shell
make
```

Run it in WASM-4 with:

```shell
w4 watch
```

</Page>

<Page value="go">

To compile Go projects you will need `go` and `tinygo` installed.

```shell
w4 new --go snake
cd snake
```

Compile the .wasm cartridge:

```shell
make
```

Run it in WASM-4 with:

```shell
w4 watch
```

</Page>

<Page value="nelua">

To compile Nelua projects you will need `nelua` installed.

```shell
w4 new --nelua snake
cd snake
```

Compile the .wasm cartridge:

```shell
make
```

Run it in WASM-4 with:

```shell
w4 watch
```

</Page>

<Page value="nim">

:::note Work in Progress
The tutorial for Nim is currently a Work-in-Progress. Most of the language specific instructions are currently missing.
:::

To compile Nim projects you will need to download the [WASI SDK](https://github.com/WebAssembly/wasi-sdk) and set the `$WASI_SDK_PATH` environment variable.

```shell
w4 new --nim snake
cd snake
```

Compile the .wasm cartridge:

```shell
nimble rel
```

Run it in WASM-4 with:

```shell
w4 watch
```

</Page>

<Page value="odin">

:::note Work in Progress
The tutorial for Odin is currently a Work-in-Progress. Most of the language specific instructions are currently missing.
:::

To compile Odin projects you will need to download the [WASI SDK](https://github.com/WebAssembly/wasi-sdk) and set the `$WASI_SDK_PATH` environment variable. You'll also need the latest version of [Odin](https://https://github.com/odin-lang/Odin).

```shell
w4 new --nim snake
cd snake
```

Compile the .wasm cartridge:

```shell
nimble rel
```

Run it in WASM-4 with:

```shell
w4 watch
```

</Page>

<Page value="rust">

### Requirements

To compile Rust projects you will need to install the [rust toolchain using rustup](https://www.rust-lang.org/tools/install) then add `wasm32-unknown-unknown` target:

```bash
rustup target add wasm32-unknown-unknown
```

:::note Binaryen

It is not required but is **strongly recommended** that you download [binaryen](https://github.com/WebAssembly/binaryen) executables for your OS:

- mac: via [brew](https://brew.sh/) or [github](https://github.com/WebAssembly/binaryen/releases).
- linux: via distro package manager or [github](https://github.com/WebAssembly/binaryen/releases).
- windows: [github](https://github.com/WebAssembly/binaryen/releases)

**Note:** If you have previously used [`wasm-pack`](https://github.com/rustwasm/wasm-pack) you should already have it installed.

We'll use [`wasm-opt`](https://github.com/WebAssembly/binaryen#wasm-opt) to significantly shrink the cartridge size.
:::

Create a new project 

```shell
w4 new --rust snake
cd snake
```

Compile the .wasm cartridge:

```shell
cargo build --release
```

Run it in WASM-4 with:

```shell
w4 watch
```

</Page>

<Page value="zig">

To compile zig projects you will need `zig` installed.

```shell
w4 new --zig snake
cd snake
```

Compile the .wasm cartridge:

```shell
zig build -Drelease-small=true
```

Run it in WASM-4 with:

```shell
w4 watch
```

</Page>

</MultiLanguage>

:::note Prevent Browser from opening
If you don't want the browser to open a new tab for you, you can prevent this by using the `-n` or `--no-open` option. You can also set an environment variable called `W4_NO_OPEN`.

Examples:
```shell
w4 watch --no-open
```
or
```shell
W4_NO_OPEN=1 w4 watch
```
:::

:::note Setting a default language
You can set a default language by setting the environment variable `W4_LANG` to one of the supported languages.
It's possible to override it with the CLI parameter later on.
:::

## Current State

For now, your game should look this:

![Hello World](images/helloworld.webp)

The color changes if you press `Button 1` (X or Space).
