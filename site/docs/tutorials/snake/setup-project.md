---
sidebar_label: Setup your project
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


# Setup your project

Before you can begin, you need a project to work with. The CLI-Tool of WASM-4 includes templates for several programing languages like AssemblyScript, C, Go and Rust. More languages are sure to come in the future.

## The Terminal ...

Work is often easier on a terminal. For this step, open your terminal/powershell and navigate to your projects folder.

For the sake of having the same base, I assume the projects-folder is here: `~/Projects/`.  
On Linux and macOS this is usually `/home/[YOUR USERNAME]/Projects`.  
On Windwos this is usually `C:\Users\[YOUR USERNAME]\Projects\`.

Below you'll find instructions for your language.

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
w4 run build/cart.wasm
```

</TabItem>

<TabItem value="language-cpp">

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
w4 run build/cart.wasm
```

</TabItem>

<TabItem value="language-rust">

To compile Rust projects you will need `cargo` installed. You will also need the wasm32 target,
which can be installed with `rustup target add wasm32-unknown-unknown`.

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
w4 run target/wasm32-unknown-unknown/release/cart.wasm
```

</TabItem>

<TabItem value="language-go">

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
w4 run build/cart.wasm
```

</TabItem>

</Tabs>
