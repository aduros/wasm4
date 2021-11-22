#!/usr/bin/env node

const { program, Option } = require("commander");
const pkg = require('./package.json');
const { supportedIconExtensions } = require('./lib/utils/icon');

let blankProject = (cmd) =>
    cmd
        .option("--as, --assemblyscript", "Create AssemblyScript project (Shorthand for --lang as/--lang assemblyscript)")
        .option("--c", "Create C/C++ project (Shorthand for --lang c)")
        .option("--d", "Create D project (Shorthand for --lang d)")
        .option("--go", "Create Go project (Shorthand for --lang go)")
        .option("--odin", "Create Odin project (Shorthand for --lang odin)")
        .option("--rs, --rust", "Create Rust project (Shorthand for --lang rs/--lang rust)")
        .option("--zig", "Create Zig project (Shorthand for --lang zig)")
        .addOption(
            new Option("--lang <lang>", "Use the given language")
                .env("W4_LANG")
                .choices(["as", "assemblyscript", "c", "d", "go", "odin", "rs", "rust", "zig"])
                .default("as")
        )


blankProject(
    program.command("new <directory>")
        .alias("create")
        .description("Create a new blank project")
)
    .action(async (dir, opts) => {
        const newCmd = require("./lib/new");
        newCmd.run(dir, opts);
    });

blankProject(
    program.command("init")
        .description("Create a new blank project in current folder")
)
    .action(async (opts) => {
        const newCmd = require("./lib/new");
        newCmd.run(".", opts);
    });

program.command("watch")
    .description("Rebuild and refresh when source code changes")
    .addOption(
        new Option("-n, --no-open", "Doesn't open the browser")
            .env("W4_NO_OPEN")
            .default(false)
    )
    .action(opts => {
        const watch = require("./lib/watch");
        watch.start(opts);
    });

program.command("run <cart>")
    .description("Open a cartridge in the web runtime")
    .addOption(
        new Option("-n, --no-open", "Doesn't open the browser")
            .env("W4_NO_OPEN")
            .default(false)
    )
    .action((cart, opts) => {
        const server = require("./lib/server");
        server.start(cart, opts);
    });

program.command("run-native <cart>")
    .description("Open a cartridge in the native desktop runtime")
    .action((cart, opts) => {
        const runNative = require("./lib/run-native");
        runNative.run(cart, opts);
    });

program.command("png2src <images...>")
    .description("Convert images to source code")
    .option("--as, --assemblyscript", "Generate AssemblyScript source (Shorthand for --lang as/--lang assemblyscript)")
    .option("--c", "Generate C/C++ source (Shorthand for --lang c)")
    .option("--d", "Generate D source (Shorthand for --lang d)")
    .option("--go", "Generate Go source (Shorthand for --lang go)")
    .option("--odin", "Generate Odin source (Shorthand for --lang odin)")
    .option("--rs, --rust", "Generate Rust source (Shorthand for --lang rs/--lang rust)")
    .option("--zig", "Generate Zig source (Shorthand for --lang zig)")
    .option("--t, --template <file>", "Template file with a custom output format")
    .addOption(
        new Option("--lang <lang>", "Use the given language")
            .env("W4_LANG")
            .choices(["as", "assemblyscript", "c", "d", "go", "odin", "rs", "rust"])
            .default("as")
    )
    .action((images, opts) => {
        const png2src = require("./lib/png2src");
        png2src.runAll(images, opts);
    });

program.command("bundle <cart>")
    .description("Bundle a cartridge for final distribution")
    .option("--html <output>", "Bundle standalone HTML")
    .option("--windows <output>", "Bundle a native Windows executable")
    .option("--mac <output>", "Bundle a native Mac executable")
    .option("--linux <output>", "Bundle a native Linux executable")
    .option("--title <title>", "Game title", "WASM-4 Game")
    .option("--description <description>", "Game description")
    .option("--icon-file <file>", `Game icon image. Supported types: ${supportedIconExtensions().join(', ')}.\nTakes precedence over --icon-url`)
    .option("--icon-url <url>", 'Favicon icon url')
    .option("--timestamp", 'Adds build timestamp to output', false)
    .action((cart, opts) => {
        const bundle = require("./lib/bundle");
        bundle.run(cart, opts);
    });

program
    .name("w4")
    .description("WASM-4: Build retro games using WebAssembly for a fantasy console.\n\nLearn more: https://wasm4.org")
    .version(pkg.version)
    .parse();

// Manages unhandled rejections:
// conforms behaviour between node versions:
// node 15+ throw on `unhandledRejection`.
// @see https://nodejs.org/api/process.html#process_event_unhandledrejection
process.on('unhandledRejection', unhandledRejectionError => {
    console.log('[w4] error:\n');

    throw unhandledRejectionError;
});
