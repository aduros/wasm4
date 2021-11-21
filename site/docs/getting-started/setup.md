import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

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

Let's go over creating a new project called `hello-world` for your chosen language.

<Tabs
    groupId="code-language"
    defaultValue="language-typescript"
    values={[
        {label: 'AssemblyScript', value: 'language-typescript'},
        {label: 'C / C++', value: 'language-cpp'},
        {label: 'D', value: 'language-d'},
        {label: 'Go', value: 'language-go'},
        {label: 'Nim', value: 'language-nim'},
        {label: 'Rust', value: 'language-rust'},
    ]}>

<TabItem value="language-typescript">

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

</TabItem>

<TabItem value="language-cpp">

To compile C/C++ projects you will need to download the [WASI SDK](https://github.com/WebAssembly/wasi-sdk) and set the `$WASI_SDK_PATH` environment variable.

```shell
w4 new --c hello-world
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

</TabItem>

<TabItem value="language-d">

To compile D projects you will need `ldc` installed. To use libc, you also need to download the [WASI SDK](https://github.com/WebAssembly/wasi-sdk) and set the `$WASI_SDK_PATH` environment variable.

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

</TabItem>

<TabItem value="language-go">

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

</TabItem>

<TabItem value="language-nim">

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

</TabItem>

<TabItem value="language-rust">

To compile Rust projects you will need `cargo` installed. You will also need the wasm32 target,
which can be installed with `rustup target add wasm32-unknown-unknown`.

```shell
w4 new --rust hello-world
cd hello-world
```

Compile the .wasm cartridge:

```shell
cargo build --release
```

Run it in WASM-4 with:

```shell
w4 run target/wasm32-unknown-unknown/release/cart.wasm
```

</TabItem>

</Tabs>

:::tip
You can also use `w4 watch` to automatically watch for changes in source files and rebuild in real-time.
:::

## Next Steps

Next let's take a look at some source code for [Hello World](/docs/getting-started/hello-world).
