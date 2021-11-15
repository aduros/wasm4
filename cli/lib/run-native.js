const path = require("path");
const { spawn } = require("child_process");

/** Opens a cart in the native runtime. */
function run (cart, opts) {
    let cmd;
    switch (process.platform) {
    case "win32":
        cmd = path.resolve(__dirname, "../assets/natives/wasm4-windows.exe");
        break;
    case "darwin":
        cmd = path.resolve(__dirname, "../assets/natives/wasm4-mac");
        break;
    case "linux":
        cmd = path.resolve(__dirname, "../assets/natives/wasm4-linux");
        break;
    default:
        throw new Error(`Unsupported platform: ${process.platform}`);
    }
    spawn(cmd, [cart], {stdio: "inherit"});
}
exports.run = run;
