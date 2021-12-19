const copy = require("recursive-copy");
const path = require("path");
const fs = require("fs");

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
    nelua: {
        name: "Nelua",
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
      build: 'zig build -Drelease-small=true',
      cart: 'zig-out/lib/cart.wasm',
    },
}

const ALIASES = {
    rs: "rust",
    as: "assemblyscript",
};

async function run (destDir, opts) {
    let lang = opts.lang;
    if (ALIASES[lang]) {
        lang = ALIASES[lang];
    }
    if (opts.assemblyscript) {
        lang = "assemblyscript";
    } else if (opts.c) {
        lang = "c";
    } else if (opts.d) {
        lang = "d";
    } else if (opts.go) {
        lang = "go";
    } else if (opts.nelua) {
        lang = "nelua";
    } else if (opts.nim) {
        lang = "nim";
    } else if (opts.odin) {
        lang = "odin";
    } else if (opts.rust) {
        lang = "rust";
    } else if (opts.zig) {
        lang = "zig";
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
        case "assemblyscript":
            const projectName = path.basename(path.resolve(destDir));
            const file = destDir + "/package.json";
            const json = JSON.parse(fs.readFileSync(file));
            json.name = projectName;
            fs.writeFileSync(file, JSON.stringify(json, null, '  '));
            break;
    }
}

exports.run = run;
