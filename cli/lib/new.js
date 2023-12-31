const copy = require("recursive-copy");
const path = require("path");
const fs = require("fs").promises;
const Mustache = require('mustache');

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
    c3: {
        name: "C3",
        build: "build",
        cart: "cart.wasm",
    },
    cpp: {
        name: "C++",
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
    penne: {
        name: "Penne",
        build: "make",
        cart: "build/cart.wasm",
    },
    porth: {
      name: 'Porth',
      build: 'make',
      cart: 'build/cart.wasm',
    },
    roland: {
        name: 'Roland',
        build: 'rolandc cart.rol --wasm4',
        cart: 'cart.wasm',
    },
    rust: {
        name: "Rust",
        build: "cargo build --release",
        cart: "target/wasm32-unknown-unknown/release/cart.wasm",
    },
    wat: {
      name: 'WebAssembly Text',
      build: 'make',
      cart: 'build/cart.wasm',
    },
    zig: {
      name: 'Zig',
      build: 'zig build -Doptimize=ReleaseSmall',
      cart: 'zig-out/bin/cart.wasm',
    }
};

/**
 * @param {string} destDir
 * @param {string} lang
 * @returns {ReturnType<import('fs/promises').writeFile>}
 */
 async function addReadme(destDir, lang) {
    if(!Object.prototype.hasOwnProperty.call(HELP, lang)) {
        throw new Error(`w4 run: invalid code lang received: ${lang}`);
    }

    if(typeof destDir !== 'string' || !destDir) {
        throw new Error(`w4 run invalid destination directory received`);
    }

    const readmeTemplate = await fs.readFile(
        path.resolve(__dirname, '../assets/templates/readme-template.md'), { encoding: 'utf-8' }
    );

    const readmeRender =  Mustache.render(readmeTemplate, {
        name: path.basename(path.resolve(destDir)),
        lang: HELP[lang],
        'code-lang': lang,
    });

    return fs.writeFile(path.join(destDir, 'README.md'), readmeRender, { encoding: 'utf-8', flag: 'w+' })
}

async function run (destDir, opts) {
    const lang = opts.lang;
    const srcDir = path.resolve(`${__dirname}/../assets/templates/${lang == "cpp" ? "c" : lang}`);
    await copy(srcDir, destDir, { dot: true });
    await init(destDir, lang);
    await addReadme(destDir, lang);

    // The C++ is exactly the same as the C template, just with .cpp instead of .c
    if (lang == "cpp") {
        await fs.rename(destDir+"/src/main.c", destDir+"/src/main.cpp");
    }

    const help = HELP[lang];
    console.log(`✔ Created ${help.name} project at ${path.resolve(destDir)}`);
    console.log();
    if (help.setup) {
        console.log(`First setup the project by running:`);
        console.log();
        console.log(`    ${help.setup}`);
        console.log();
    }
    console.log("Build the cart by running:");
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
            const json = JSON.parse(await fs.readFile(file, { encoding: 'utf-8' }));
            json.name = projectName;
            await fs.writeFile(file, JSON.stringify(json, null, '  '), { encoding: 'utf-8' });
            break;
    }
}

exports.run = run;
