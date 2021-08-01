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

program.command("png2c <images...>")
    .action(images => {
        const png2c = require("./lib/png2c");
        png2c.runAll(images);
    });

program.parse();
