This directory contains the native runtime.

## Building

First grab the vendor dependencies:

```shell
git submodule update --init
```

Linux only: You'll need to install dependencies for X11 development. On Ubuntu these can be
installed with: `sudo apt install libxrandr-dev libxinerama-dev libxcursor-dev libxi-dev
libxext-dev libxkbcommon-dev libasound2-dev libpulse-dev`

Building:

```shell
cmake -B build
cmake --build build
```

By default, it uses [wasm3] as a WebAssembly runtime.
Alternatively, you can use [toywasm] instead by setting
the `WASM_BACKEND` cmake option:

```shell
cmake -B build -DWASM_BACKEND=toywasm
cmake --build build
```

[wasm3]: https://github.com/wasm3/wasm3
[toywasm]: https://github.com/yamt/toywasm

Also, you can select the window backend by setting
the `WINDOW_BACKEND` cmake option:

```shell
cmake -B build -DWINDOW_BACKEND=minifb
cmake --build build
```

```shell
cmake -B build -DWINDOW_BACKEND=glfw
cmake --build build
```

On macOS, the default is [glfw].
On the other platforms, the default is [minifb].

[minifb]: https://github.com/emoon/minifb
[glfw]: https://www.glfw.org/

Running:

```shell
./build/wasm4
```

For release builds, pass `-DCMAKE_BUILD_TYPE=Release` to cmake.

If you want to build only one target:

``` shell
cmake --build build --target wasm4_libretro
cmake --build build --target wasm4
```
