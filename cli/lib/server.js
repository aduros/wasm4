const express = require("express");
const fs = require('node:fs/promises');
const os = require("os");
const path = require("path");
const qrcode = require("qrcode");
const { Server: WebSocketServer } = require("ws");
const open = require("open");
const process = require("process");
const { buffer } = require('node:stream/consumers');


async function start (cartFile, opts) {
    const app = express();

    let shouldWatch = false;
    if (cartFile === "-") {
        // Filename "-" means read from standard in.
        // This can only be read once, so must be cached.
        let cart_data = await buffer(process.stdin);

        app.get("/cart.wasm", (req, res) => {
            res.send(cart_data);
        });
    } else if (!(await fs.stat(cartFile)).isFile()) {
        // If the file is not a regular file, such as a fifo, input stream etc.
        // we must also cache the data.
        let cart_data = await fs.readFile(cartFile);

        app.get("/cart.wasm", (req, res) => {
            res.send(cart_data);
        });
    } else {
        // otherwise it's a regular file, and can be read from disk every time.
        app.get("/cart.wasm", (req, res) => {
            res.sendFile(path.resolve(cartFile));
        });
        app.get("/cart.wasm.map", (req, res) => {
            res.sendFile(path.resolve(cartFile+".map"));
        });
        shouldWatch = true;
    }

    // Serve the WASM-4 developer runtime.
    app.use(express.static(path.resolve(__dirname, "../assets/runtime/developer-build")));


    const first_port = opts.port;
    let port = first_port;

    const webServer = app.listen(port, successfulListen);

    async function successfulListen() {
        if (opts.qr) {
            const qr = await qrcode.toString(`http://${getIP()}:${port}`, {type: "terminal", small: true});
            console.log("\n  " + qr.replace(/\n/g, "\n  "));
        }
        if (port != first_port) {
            console.log(`Unable to bind on port ${first_port}, using ${port} instead.`);
        }
        console.log(`Open http://localhost:${port}${opts.qr ? ", or scan this QR code on your mobile device." : "."} Press ctrl-C to exit.`);

        if (opts.open) {   
            open(`http://localhost:${port}`);
        }
    }

    let attempts = 0;
    webServer.on("error", (e) => {
        if (e.code === "EADDRINUSE") {
            if (++attempts <= 1000) {
                port++;
                webServer.listen(port, successfulListen);
            } else {
                console.log(`Error: Unable to find an available port between ${first_port}-${port}`);
                console.log(`Please specify a different port using the --port <port> option.\n`)
                console.log(`Use\n`)
                console.log(`\tw4 help watch\n`)
                console.log('or\n')
                console.log(`\tw4 help run\n`)
                console.log('for more information.')
                process.exit(1);
            }
        } else  {
            throw e;
        }
    });

    const wSocketServer = new WebSocketServer({ noServer: true });
    wSocketServer.on("connection", socket => {
        socket.on("message", message => {
            console.log(message);
        });
    });
    webServer.on("upgrade", (request, socket, head) => {
        wSocketServer.handleUpgrade(request, socket, head, socket => {
            wSocketServer.emit("connection", socket, request);
        });
    });

    const hot = opts.hot;

    if (shouldWatch) {
        watchPath(cartFile, opts.settleTime, () => {
            let sentReload = false;
            for (let client of wSocketServer.clients) {
                client.send(hot ? "hotswap" : "reload");
                sentReload = true;
            }
            if (sentReload) {
                const cart = path.basename(cartFile);
                let now = new Date();
                let time_string = `${now.getHours()}:${now.getMinutes()}`;
                if (hot) {
                    console.log(`${time_string} 🔄🔥 Hot swapped ${cart} (press R for full reload)`);
                } else {
                    console.log(`${time_string} 🔄 Reloaded ${cart}`);
                }
            }
        });
    }
}
exports.start = start;

async function wait (ms) {
    return new Promise((resolve, reject) => setTimeout(resolve, ms));
}

// Watches a file-path, and calls handleFreshFile when the file is replaced or modified,
// once all changes have settled down.
async function watchPath(path, pollTime, handleFreshFile) {
    let prev_modified_time = await getModifiedTime(path);
    while (true) {

        // file is settled loop
        while (true) {
            await wait(pollTime);

            let curr_modified_time = await getModifiedTime(path);
            if (curr_modified_time !== prev_modified_time) {
                // The file has become unsettled
                prev_modified_time = curr_modified_time;
                break;
            } else {
                // The file is still settled
                prev_modified_time = curr_modified_time;
            }
        }
        
        // file has disappeared or is being modified (i.e. unsettled) loop
        while (true) {
            await wait(pollTime);

            let curr_modified_time = await getModifiedTime(path);
            let file_is_not_missing = curr_modified_time !== null;
            let file_was_not_modified = curr_modified_time === prev_modified_time;
            if (file_is_not_missing && file_was_not_modified) {
                // If the file has not changed between two polls, assume the file has become settled.
                handleFreshFile();
                prev_modified_time = curr_modified_time;
                break;
            } else {
                // The file is still unsettled.
                prev_modified_time = curr_modified_time;
            }
        }
    }
}

// Returns the last time the file was modified, or null if the file doesn't exist.
async function getModifiedTime (path) {
    try {
        return (await fs.stat(path)).mtimeMs;
    } catch (error) {
        // "ENOENT" means "Error, no such entry in the directory"
        // i.e. the file doesn't exist.
        if (error.code === "ENOENT") {
            return null;
        } else {
            throw error;
        }
    }
}

function getIP () {
    var ip = null;
    var ifaces = os.networkInterfaces();
    for (var device in ifaces) {
        ifaces[device].forEach(function (iface) {
            if (!iface.internal && iface.family == "IPv4") {
                ip = iface.address;
            }
        });
    }
    return ip;
}
