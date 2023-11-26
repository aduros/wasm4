const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const watch = require("node-watch");

const server = require("./server");

function start (opts) {
    let buildCommand, buildParams, buildOutput;

    if (fs.existsSync("Cargo.toml")) {
        buildCommand = "cargo";
        buildParams = ["build", "--quiet"];
        buildOutput = "target/wasm32-unknown-unknown/debug/cart.wasm";

    } else if (fs.existsSync("package.json")) {
        buildCommand = "npm";
        buildParams = ["--silent", "run", "build:debug"];
        buildOutput = "build/cart.wasm";

    } else if (fs.existsSync("build.zig")) {
        buildCommand = "zig";
        buildParams = ["build"];
        buildOutput = "zig-out/bin/cart.wasm";

    } else if (fs.existsSync("cart.nimble")) {
        buildCommand = "nimble";
        buildParams = ["dbg"];
        buildOutput = "build/cart.wasm";
    } else if (fs.existsSync("cart.rol")) {
        buildCommand = "rolandc";
        buildParams = ["cart.rol", "--wasm4"];
        buildOutput = "cart.wasm";

    } else if (fs.existsSync("Makefile")) {
        buildCommand = "make";
        buildParams = ["--silent", "DEBUG=1"];
        if (fs.existsSync("dub.json")) {
            buildOutput = "cart.wasm"; // Special case for D
        } else {
            buildOutput = "build/cart.wasm";
        }

    } else {
        console.error("This directory doesn't look like a WASM-4 project.");
        process.exit(1);
    }

    let currentlyBuilding = false, rebuildAfterBuild = false, serveAfterBuild = true;
    function build () {
        currentlyBuilding = true;

        // console.log("Calling "+buildCommand);
        const child = spawn(buildCommand, buildParams, {stdio: "inherit", shell: true});
        child.on("exit", () => {
            currentlyBuilding = false;
            if (rebuildAfterBuild) {
                rebuildAfterBuild = false;
                build();
            }
            if (serveAfterBuild) {
                serveAfterBuild = false;
                server.start(buildOutput, opts);
            }
        });
    }

    console.log("Building with: "+buildCommand+" "+buildParams.join(" "));
    build();

    let buildTimeoutId = 0;
    function watchFilter (file, skip) {
        const directories = path.dirname(file).split(path.sep);

        // Don't bother descending into certain dirs
        if (['.git', 'node_modules', 'build', 'target', 'zig-cache', 'zig-out'].some(dir => directories.includes(dir))) {
            return skip
        } else {
            // Only trigger on source file changes
            return /\.(c|cpp|d|go|h|nelua|nim|odin|pn|porth|rol|rs|ts|wat|zig)$/.test(file);
        }
    }
    watch("./", {recursive: true, filter: watchFilter}, (event, file) => {
        if (!currentlyBuilding) {
            clearTimeout(buildTimeoutId);
            buildTimeoutId = setTimeout(build, 50);
        } else {
            rebuildAfterBuild = true;
        }
    });
}
exports.start = start;
