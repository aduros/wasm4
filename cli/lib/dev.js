const fs = require("fs");
const { spawn } = require("child_process");
const watch = require("node-watch");

const server = require("./server");

function start () {
    let buildCommand, buildParams, buildOutput;

    if (fs.existsSync("Makefile")) {
        buildCommand = "make";
        buildParams = ["--silent", "DEBUG=1"];
        buildOutput = "build/cart.wasm";

    } else if (fs.existsSync("Cargo.toml")) {
        buildCommand = "cargo";
        buildParams = ["build", "--quiet"];
        buildOutput = "target/wasm32-unknown-unknown/debug/cart.wasm";

    } else if (fs.existsSync("package.json")) {
        buildCommand = "npm";
        buildParams = ["--silent", "run", "build"];
        buildOutput = "build/cart.wasm";

    } else {
        throw new Error("Don't know how to build this project");
    }

    let currentlyBuilding = false, rebuildAfterBuild = false, serveAfterBuild = true;
    function build () {
        currentlyBuilding = true;

        // console.log("Calling "+buildCommand);
        const child = spawn(buildCommand, buildParams, {stdio: "inherit"});
        child.on("exit", () => {
            currentlyBuilding = false;
            if (rebuildAfterBuild) {
                rebuildAfterBuild = false;
                build();
            }
            if (serveAfterBuild) {
                serveAfterBuild = false;
                server.start(buildOutput);
            }
        });
    }

    console.log("Building with: "+buildCommand+" "+buildParams.join(" "));
    build();

    let buildTimeoutId = 0;
    watch("src", {recursive: true}, (event, file) => {
        if (!currentlyBuilding) {
            clearTimeout(buildTimeoutId);
            buildTimeoutId = setTimeout(build, 50);
        } else {
            rebuildAfterBuild = true;
        }
    });
}
exports.start = start;
