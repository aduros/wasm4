#!/usr/bin/env node

const { program, Option } = require("commander");
const pkg = require('./package.json');
const { supportedIconExtensions } = require('./lib/utils/icon');

const LANGS = ["assemblyscript", "c", "c3", "cpp", "d", "go", "nelua", "nim", "odin", "penne", "porth", "roc", "roland", "rust", "wat", "zig"];
const langOption = new Option("--lang <lang>", "Use the given language")
    .env("W4_LANG")
    .choices(LANGS);

function requireLang (opts) {
    if (opts.lang) {
        return opts.lang;
    }
    if (opts.surpriseMe) {
        return LANGS[(Math.random()*LANGS.length) >>> 0];
    }

    if (opts.assemblyscript) {
        return "assemblyscript";
    } else if (opts.c) {
        return "c";
    } else if (opts.c3) {
        return "c3";
    } else if (opts.cpp) {
        return "cpp";
    } else if (opts.d) {
        return "d";
    } else if (opts.go) {
        return "go";
    } else if (opts.nelua) {
        return "nelua";
    } else if (opts.nim) {
        return "nim";
    } else if (opts.odin) {
        return "odin";
    } else if (opts.penne) {
        return "penne";
    } else if (opts.porth) {
        return "porth";
    } else if (opts.roc) {
        return "roc";
    } else if (opts.roland) {
        return "roland";
    } else if (opts.rust) {
        return "rust";
    } else if (opts.wat) {
        return "wat";
    } else if (opts.zig) {
        return "zig";
    }

    console.error("You must specify a programming language, for example by passing --c or --rust.");
    process.exit(1);
}

const blankProject = (cmd) =>
    cmd
        .option("--as, --assemblyscript", "Create AssemblyScript project (Shorthand for --lang assemblyscript)")
        .option("--c", "Create C project (Shorthand for --lang c)")
        .option("--c3", "Create C3 project (Shorthand for --lang c3)")
        .option("--cpp", "Create C++ project (Shorthand for --lang cpp)")
        .option("--d", "Create D project (Shorthand for --lang d)")
        .option("--go", "Create Go project (Shorthand for --lang go)")
        .option("--nelua", "Create Nelua project (Shorthand for --lang nelua)")
        .option("--nim", "Create Nim project (Shorthand for --lang nim)")
        .option("--odin", "Create Odin project (Shorthand for --lang odin)")
        .option("--penne", "Create Penne project (Shorthand for --lang penne)")
        .option("--porth", "Create Porth project (Shorthand for --lang porth)")
        .option("--roland", "Create Roland project (Shorthand for --lang roland)")
        .option("--rs, --rust", "Create Rust project (Shorthand for --lang rust)")
        .option("--wat", "Create WebAssembly Text project (Shorthand for --lang wat)")
        .option("--zig", "Create Zig project (Shorthand for --lang zig)")
        .addOption(langOption)
        .option("--surprise-me", "Create a project in a random language");


blankProject(
    program.command("new <directory>")
        .alias("create")
        .description("Create a new blank project")
)
    .action((dir, opts) => {
        const newCmd = require("./lib/new");
        opts.lang = requireLang(opts);
        newCmd.run(dir, opts);
    });

blankProject(
    program.command("init")
        .description("Create a new blank project in current folder")
)
    .action(opts => {
        const newCmd = require("./lib/new");
        opts.lang = requireLang(opts);
        newCmd.run(".", opts);
    });

function withCommonRunOptions (cmd) {
    return cmd.option("--open", "Open the browser", true)
        .addOption(
            new Option("--port <port>", "Binds the runtime to a specific port")
                .env("W4_PORT")
                .default("4444")
        )
        .addOption(
            new Option("-n, --no-open", "Don't open the browser")
                .env("W4_NO_OPEN")
                .default(false)
        )
        .option("--qr", "Displays a QR code", true)
        .addOption(
            new Option("--no-qr", "Don't display a QR code")
                .env("W4_NO_QR")
                .default(false)
        )
        .option("--hot", "Enable hot swapping. When the cart is reloaded, the console memory will be preserved, allowing code changes to the cart without resetting.", false);
}

withCommonRunOptions(program.command("watch"))
    .description("Rebuild and refresh when source code changes")
    .action(opts => {
        const watch = require("./lib/watch");
        watch.start(opts);
    });

withCommonRunOptions(program.command("run <cart>"))
    .description("Open a cartridge in the web runtime")
    .addOption(
        new Option("--settle-time <time>", "Changes to the cart must have stopped for at least this long before a reload happens. Increase this if you're getting erroneous double-reloads and cart corruption, decrease it if you want snappier reloads.  In milliseconds.")
        .env("W4_SETTLE_TIME")
        .default(300)
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
    .option("--as, --assemblyscript", "Generate AssemblyScript source (Shorthand for --lang assemblyscript)")
    .option("--c, --cpp", "Generate C/C++ source (Shorthand for --lang c)")
    .option("--c3", "Generate C3 source (Shorthand for --lang c3)")
    .option("--d", "Generate D source (Shorthand for --lang d)")
    .option("--go", "Generate Go source (Shorthand for --lang go)")
    .option("--nelua", "Generate Nelua source (Shorthand for --lang nelua)")
    .option("--nim", "Generate Nim source (Shorthand for --lang nim)")
    .option("--odin", "Generate Odin source (Shorthand for --lang odin)")
    .option("--penne", "Generate Penne source (Shorthand for --lang penne)")
    .option("--porth", "Generate Porth source (Shorthand for --lang porth)")
    .option("--roc", "Generate Roc source (Shorthand for --lang roc)")
    .option("--roland", "Generate Roland source (Shorthand for --lang roland)")
    .option("--rs, --rust", "Generate Rust source (Shorthand for --lang rust)")
    .option("--wat", "Generate WebAssembly Text source (Shorthand for --lang wat)")
    .option("--zig", "Generate Zig source (Shorthand for --lang zig)")
    .option("-t, --template <file>", "Template file with a custom output format")
    .option("-o, --output <file>", "File to write the result to", "-")
    .addOption(langOption)
    .action((images, opts) => {
        const png2src = require("./lib/png2src");
        if (!opts.template) {
            opts.lang = requireLang(opts);
        }
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
    .option("--html-disk-prefix <prefix>", "Specify a prefix for the disk localStorage key. Defaults to game title")
    .option("--html-template <file>", "Mustache HTML template file for standalone HTML. Defaults to a built-in template.")
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
// conforms behavior between node versions:
// node 15+ throw on `unhandledRejection`.
// @see https://nodejs.org/api/process.html#process_event_unhandledrejection
process.on('unhandledRejection', unhandledRejectionError => {
    console.error(unhandledRejectionError.message);
    process.exit(1);
    // throw unhandledRejectionError;
});
