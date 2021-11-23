const copy = require("recursive-copy");
const path = require("path");
const fs = require("fs");

const LANGS = {
    as: "assemblyscript",
    assemblyscript: "assemblyscript",
    c: "c",
    d: "d",
    go: "go",
    nim: "nim",
    odin: "odin",
    rs: "rust",
    rust: "rust",
    zig: 'zig',
}

const HELP = {
    assemblyscript: {
        name: "AssemblyScript",
        setup: "npm install",
        build: "npm run build",
        cart: "build/cart.wasm",
    },
    c: {
        name: "C",
        build: "make",
        cart: "build/cart.wasm",
    },
    d: {
        name: "D",
        build: "make",
        cart: "cart.wasm",
    },
    go: {
        name: "Go",
        build: "make",
        cart: "build/cart.wasm",
    },
    nim: {
        name: "Nim",
        build: "nimble rel",
        cart: "build/cart.wasm",
    },
    odin: {
        name: "Odin",
        build: "make",
        cart: "build/cart.wasm",
    },
    rust: {
        name: "Rust",
        build: "cargo build --release",
        cart: "target/wasm32-unknown-unknown/release/cart.wasm",
    },
    zig: {
      name: 'Zig',
      build: 'zig build',
      cart: 'zig-out/lib/cart.wasm',
    },
}

async function run (destDir, opts) {
    let lang = LANGS[opts.lang];
    if (opts.assemblyscript) {
        lang = LANGS.assemblyscript;
    } else if (opts.c) {
        lang = LANGS.c;
    } else if (opts.d) {
        lang = LANGS.d;
    } else if (opts.go) {
        lang = LANGS.go;
    } else if (opts.nim) {
        lang = LANGS.nim;
    } else if (opts.odin) {
        lang = LANGS.odin;
    } else if (opts.rust) {
        lang = LANGS.rust;
    } else if (opts.zig) {
        lang = LANGS.zig;
    }

    const srcDir = path.resolve(__dirname+"/../assets/templates/"+lang);
    await copy(srcDir, destDir, { dot: true });
    await init(destDir, lang);

    const help = HELP[lang];
    console.log(`OK! Created ${help.name} project at ${path.resolve(destDir)}`);
    console.log();
    if (help.setup) {
        console.log(`First setup the project by running:`);
        console.log();
        console.log(`    ${help.setup}`);
        console.log();
    }
    console.log("Build it by running:");
    console.log();
    console.log(`    ${help.build}`);
    console.log();
    console.log("Then run it with:");
    console.log();
    console.log(`    w4 run ${help.cart}`);
    console.log();
}

async function init (destDir, lang) {
    switch (lang) {
        case LANGS.assemblyscript:
            const projectName = path.basename(path.resolve(destDir));
            const file = destDir + "/package.json";
            const json = JSON.parse(fs.readFileSync(file));
            json.name = projectName;
            fs.writeFileSync(file, JSON.stringify(json, null, '  '));
            break;
    }
}

exports.run = run;
