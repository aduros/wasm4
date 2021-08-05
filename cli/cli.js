#!/usr/bin/env node

const { program } = require("commander");

program.command("dev")
    .action(() => {
        const dev = require("./lib/dev");
        dev.start();
    });

program.command("run <cart>")
    .action(cart => {
        const server = require("./lib/server");
        server.start(cart);
    });

program.command("publish <cart>")
    .action(cart => {
        console.log("TODO(2021-07-21): Export "+cart);
    });

program.command("png2code <images...>")
    .option("--c", "Generate C/C++ source")
    .option("--rs, --rust", "Generate Rust source")
    .option("--as, --assemblyscript", "Generate AssemblyScript source")
    .action((images, opts) => {
        const png2code = require("./lib/png2code");
        console.log(opts);
        let lang = "c";
        if (opts.rust) {
            lang = "rust";
        } else if (opts.assemblyscript) {
            lang = "assemblyscript";
        }
        png2code.runAll(images, { lang });
    });

program.parse();
