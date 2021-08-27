import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Setup

Download WASM-4:

<p>
<a href="pathname:///download/wasm4-windows.zip" className="button button--primary button--outline button--lg margin--md">📥 Windows</a>
<a href="pathname:///download/wasm4-macos.zip" className="button button--primary button--outline button--lg margin--md">📥 macOS</a>
<a href="pathname:///download/wasm4-linux.zip" className="button button--primary button--outline button--lg margin--md">📥 Linux</a>
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
        {label: 'Rust', value: 'language-rust'},
        {label: 'Go', value: 'language-go'},
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

To compile C/C++ projects you will need `clang` installed.

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

<TabItem value="language-rust">

To compile Rust projects you will need `cargo` installed.

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

<TabItem value="language-go">

To compile C/C++ projects you will need `go` and `tinygo` installed.

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

</Tabs>

:::tip
You can also use `w4 watch` to automatically watch for changes in source files and rebuild in real-time.
:::

## Next Steps

Next let's take a look at some source code for [Hello World](/docs/getting-started/hello-world).
