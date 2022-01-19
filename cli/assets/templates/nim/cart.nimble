import std/[os, strformat]
# Package

version       = "0.1.0"
author        = "Danil Yarantsev (Yardanico)"
description   = "A WASM-4 cartridge example in Nim"
license       = "ISC"
srcDir        = "src"

# Dependencies

let outFile = "build" / "cart.wasm"
requires "nim >= 1.4.0"

task dbg, "Build the cartridge in debug mode":
  exec &"nim c -d:nimNoQuit -o:{outFile} src/cart.nim"

task rel, "Build the cartridge with all optimizations":
  exec &"nim c -d:nimNoQuit -d:danger -o:{outFile} src/cart.nim"

after rel:
  let exe = findExe("wasm-opt")
  if exe != "":
    exec(&"wasm-opt -Oz --zero-filled-memory --strip-producers {outFile} -o {outFile}")
  else:
    echo "Tip: wasm-opt was not found. Install it from binaryen for smaller builds!"