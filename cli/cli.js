#!/usr/bin/env node

const { program } = require("commander");

program.command("new <directory>")
    .option("--c", "Create C/C++ project")
    .option("--as, --assemblyscript", "Create AssemblyScript project")
    .option("--rs, --rust", "Create Rust project")
    .option("--go", "Create Go project")
    .action(async (dir, opts) => {
        const newCmd = require("./lib/new");
        newCmd.run(dir, opts);
    });

program.command("watch")
    .action(() => {
        const watch = require("./lib/watch");
        watch.start();
    });

program.command("run <cart>")
    .action(cart => {
        const server = require("./lib/server");
        server.start(cart);
    });

// program.command("export <cart>")
//     .action(cart => {
//         console.log("TODO(2021-07-21): Export "+cart);
//     });

program.command("png2src <images...>")
    .option("--c", "Generate C/C++ source")
    .option("--as, --assemblyscript", "Generate AssemblyScript source")
    .option("--rs, --rust", "Generate Rust source")
    .option("--go", "Generate Go source")
    .action((images, opts) => {
        const png2src = require("./lib/png2src");
        png2src.runAll(images, opts);
    });

program.parse();
