const copy = require("recursive-copy");
const path = require("path");

const HELP = {
    "c": {
        name: "C",
        build: "make",
        cart: "build/cart.wasm",
    },
    "assemblyscript": {
        name: "AssemblyScript",
        setup: "npm install",
        build: "npm run build",
        cart: "build/cart.wasm",
    },
    "rust": {
        name: "Rust",
        build: "cargo build --release",
        cart: "target/wasm32-unknown-unknown/release/cart.wasm",
    },
    "go": {
        name: "Go",
        build: "make",
        cart: "build/cart.wasm",
    },
}

async function run (destDir, opts) {
    let lang = "c";
    if (opts.assemblyscript) {
        lang = "assemblyscript";
    } else if (opts.rust) {
        lang = "rust";
    } else if (opts.go) {
        lang = "go";
    }

    const srcDir = path.resolve(__dirname+"/../templates/"+lang);
    await copy(srcDir, destDir);

    const help = HELP[lang];
    console.log(`Created ${help.name} project at ${path.resolve(destDir)}`);
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
exports.run = run;
