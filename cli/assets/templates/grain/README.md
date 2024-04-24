# Grain bindings for WASM-4

Requires grain 0.6 or higher. Tested with Grain 0.6.3. For fast compiling, be sure to [build Grain from source](https://grain-lang.org/docs/getting_grain#Building-Grain-from-Source).

For original template source, see:

- https://github.com/ospencer/wasm4-gr

Tips and source here are copied from there.

## Tips to fit within 64k

This limitation is part of the fun. Grain's extensive `Number` type brings in quite a bit of support code, so avoiding it (and standard libraries that depend on it) is the best way to keep the cartridge size small. This includes the math operations provided by `Pervasives`, like `+` and `==`, but conveniently, the WASM-4 API uses the `Uint8` and `Uint16` types. The `hello-world.gr` example is only 7k, and even with a number of sprites and a good chunk of music data, the `music.gr` example is 21k.

Good luck and have fun!
