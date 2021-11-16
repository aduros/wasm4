const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawn } = require("child_process");

/** Opens a cart in the native runtime. */
function run (cart, opts) {
    let executable;
    switch (process.platform) {
    case "win32":
        executable = path.resolve(__dirname, "../assets/natives/wasm4-windows.exe");
        break;
    case "darwin":
        executable = path.resolve(__dirname, "../assets/natives/wasm4-mac");
        break;
    case "linux":
        executable = path.resolve(__dirname, "../assets/natives/wasm4-linux");
        break;
    default:
        throw new Error(`Unsupported platform: ${process.platform}`);
    }

    // If running under the pkg bundle, we need to copy it out to the filesystem
    if (process.pkg) {
        const tmp = path.join(os.tmpdir(), path.basename(executable));
        fs.writeFileSync(tmp, fs.readFileSync(executable));
        fs.chmodSync(tmp, "775");
        executable = tmp;
    }

    spawn(executable, [cart], {stdio: "inherit"});
}
exports.run = run;
