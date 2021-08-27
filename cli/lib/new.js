const copy = require("recursive-copy");
const path = require("path");
const fs = require("fs");

const LANGS = {
    C: "c",
    ASSEMBLYSCRIPT: "assemblyscript",
    RUST: "rust",
    GO: "go",
}

const HELP = {
    [LANGS.C]: {
        name: "C",
        build: "make",
        cart: "build/cart.wasm",
    },
    [LANGS.ASSEMBLYSCRIPT]: {
        name: "AssemblyScript",
        setup: "npm install",
        build: "npm run build",
        cart: "build/cart.wasm",
    },
    [LANGS.RUST]: {
        name: "Rust",
        build: "cargo build --release",
        cart: "target/wasm32-unknown-unknown/release/cart.wasm",
    },
    [LANGS.GO]: {
        name: "Go",
        build: "make",
        cart: "build/cart.wasm",
    },
}

async function run (destDir, opts) {
    let lang;
    if (opts.assemblyscript) {
        lang = LANGS.ASSEMBLYSCRIPT;
    } else if (opts.c) {
        lang = LANGS.C;
    } else if (opts.rust) {
        lang = LANGS.RUST;
    } else if (opts.go) {
        lang = LANGS.GO;
    } else {
        lang = LANGS.ASSEMBLYSCRIPT;
    }

    const srcDir = path.resolve(__dirname+"/../assets/templates/"+lang);
    await copy(srcDir, destDir);
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
        case LANGS.ASSEMBLYSCRIPT:
            const projectName = path.basename(destDir);
            const file = destDir + "/package.json";
            const json = JSON.parse(fs.readFileSync(file));
            json.name = projectName;
            fs.writeFileSync(file, JSON.stringify(json, null, '  '));
            break;
    }    
}

exports.run = run;
