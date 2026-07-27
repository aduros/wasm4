# Runtimes

WASM-4 has been implemented into several runtimes, which take a WebAssembly interpreter and add support for WASM-4's functions and memory layout.

## Official

| Name     | WebAssembly Interpreter | Description                                |
| -------- | ----------------------- | ------------------------------------------ |
| [Web]    | Browser-dependent       | Browser target with netplay support        |
| [Native] | [wasm3] / [toywasm]     | Native executable target and LibRetro core |

## Community

| Name                       | WebAssembly Interpreter | Description                                                                                       |
| -------------------------- | ----------------------- | ------------------------------------------------------------------------------------------------- |
| [Console Box][console-box] | [wasmtime]              | Play in Minecraft without installing client mods; uses the [Plasmid] library for [Fabric] servers |

[Web]: https://github.com/aduros/wasm4/tree/main/runtimes/web
[Native]: https://github.com/aduros/wasm4/tree/main/runtimes/native
[wasm3]: https://github.com/wasm3/wasm3
[toywasm]: https://github.com/yamt/toywasm
[console-box]: https://github.com/NucleoidMC/Console-Box
[wasmtime]: https://github.com/bytecodealliance/wasmtime
[Plasmid]: https://github.com/NucleoidMC/plasmid
[Fabric]: https://fabricmc.net
