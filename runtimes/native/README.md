This directory contains the native runtime.

> Development status: 🚧 Under construction, not yet usable!

## Building

First grab the vendor dependencies:

```shell
git submodule update --init
```

Building:

```shell
cmake -B build
cmake --build build
```

Running:

```shell
./build/wasm4
```

For release builds, pass `-DCMAKE_BUILD_TYPE=Release` to cmake.
