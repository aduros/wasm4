#!/usr/bin/env node

const { program } = require("commander");
const fs = require("fs");

program.command("new <directory>")
    .description("Create a new blank project")
    .option("--as, --assemblyscript", "Create AssemblyScript project")
    .option("--c", "Create C/C++ project")
    .option("--rs, --rust", "Create Rust project")
    .option("--go", "Create Go project")
    .action(async (dir, opts) => {
        const newCmd = require("./lib/new");
        newCmd.run(dir, opts);
    });

program.command("watch")
    .description("Rebuild and refresh when source code changes")
    .action(() => {
        const watch = require("./lib/watch");
        watch.start();
    });

program.command("run <cart>")
    .description("Open a cartridge in the emulator")
    .action(cart => {
        const server = require("./lib/server");
        server.start(cart);
    });

program.command("png2src <images...>")
    .description("Convert images to source code")
    .option("--as, --assemblyscript", "Generate AssemblyScript source")
    .option("--c", "Generate C/C++ source")
    .option("--rs, --rust", "Generate Rust source")
    .option("--go", "Generate Go source")
    .option("--t, --template <file>", "Template file with a custom output format")
    .action((images, opts) => {
        const png2src = require("./lib/png2src");
        png2src.runAll(images, opts);
    });

program.command("bundle <cart>")
    .description("Bundle a cartridge for final distribution")
    .option("--html <output>", "Bundle standalone HTML")
    .action((cart, opts) => {
        const bundle = require("./lib/bundle");
        bundle.run(cart, opts);
    });

program
    .name("w4")
    .description("WASM-4: Build retro games using WebAssembly for a fantasy console.\n\nLearn more: https://wasm4.org")
    .version(JSON.parse(fs.readFileSync(__dirname+"/package.json")).version)
    .parse();

// Manages unhandled rejections:
// conforms behaviour between node versions:
// node 15+ throw on `unhandledRejection`.
// @see https://nodejs.org/api/process.html#process_event_unhandledrejection
process.on('unhandledRejection', unhandledRejectionError => {
    console.log('[w4] error:\n');
    
    throw unhandledRejectionError;
});
