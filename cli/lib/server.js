const { Readable } = require('stream');
const wasmmap = require('wasm-sourcemap');
const express = require("express");
const fs = require("fs");
const os = require("os");
const path = require("path");
const qrcode = require("qrcode");
const { Server: WebSocketServer } = require("ws");
const open = require("open");

const PORT = 4444;

function bufferToStream(buffer) { 
    var stream = new Readable();
    stream.push(buffer);
    stream.push(null);
  
    return stream;
  }

function start (cartFile) {
    const url = `http://localhost:${PORT}`;
    const app = express();

    app.get("/cart.wasm", (req, res) => {
        if (fs.existsSync(cartFile + '.map')) {
            console.log('Source map exist, patch wasm!');

            const patchedWasm = wasmmap.SetSourceMapURL(fs.readFileSync(cartFile), `${url}/cart.wasm.map`);
            bufferToStream(patchedWasm).pipe(res);
            return;
        }

        fs.createReadStream(cartFile).pipe(res);
    });

    app.get("/cart.wasm.map", (req, res) => {
        fs.createReadStream(cartFile + '.map').pipe(res);
    });
    
    app.use(express.static(__dirname+"/../assets/runtime"));

    const server = app.listen(PORT, async () => {
        const qr = await qrcode.toString(`http://${getIP()}:${PORT}`, {type: "terminal"});
        console.log("\n  " + qr.replace(/\n/g, "\n  "));
        console.log(`Open http://localhost:${PORT}, or scan this QR code on your mobile device. Press ctrl-C to exit.`);

        open(url);
    });

    const wsServer = new WebSocketServer({ noServer: true });
    wsServer.on("connection", socket => {
        socket.on("message", message => {
            console.log(message);
        });
    });
    server.on("upgrade", (request, socket, head) => {
        wsServer.handleUpgrade(request, socket, head, socket => {
            wsServer.emit("connection", socket, request);
        });
    });

    let reloadTimeoutId = 0;
    fs.watch(path.dirname(cartFile), (event, file) => {
        if (file == path.basename(cartFile)) {
            clearTimeout(reloadTimeoutId);
            reloadTimeoutId = setTimeout(() => {
                let sentReload = false;
                for (let client of wsServer.clients) {
                    client.send("hotswap");
                    sentReload = true;
                }
                if (sentReload) {
                    console.log("✔ Reloaded "+path.basename(cartFile));
                }
            }, 50);
        }
    });
}
exports.start = start;

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
