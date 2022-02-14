const express = require("express");
const fs = require("fs");
const os = require("os");
const path = require("path");
const qrcode = require("qrcode");
const { Server: WebSocketServer } = require("ws");
const open = require("open");
const { exit } = require("process");

var attempts = 0;
var PORT = 0;
var FIRST_PORT = 0;

function start (cartFile, opts) {
    const app = express();
    app.get("/cart.wasm", (req, res) => {
        fs.createReadStream(cartFile).pipe(res);
    });
    app.get("/cart.wasm.map", (req, res) => {
        fs.createReadStream(cartFile+".map").pipe(res);
    });
    app.use(express.static(path.resolve(__dirname, "../assets/runtime/developer-build")));

    if (PORT == 0) {
        PORT = opts.port;
        FIRST_PORT = opts.port;
    }

    const server = app.listen(PORT, async () => {
        if (opts.qr) {
            const qr = await qrcode.toString(`http://${getIP()}:${PORT}`, {type: "terminal", small: true});
            console.log("\n  " + qr.replace(/\n/g, "\n  "));
        }
        if (FIRST_PORT != PORT) {
            console.log(`Unable to bind on port ${FIRST_PORT}, using ${PORT} instead.`);
        }
        console.log(`Open http://localhost:${PORT}${opts.qr ? ", or scan this QR code on your mobile device." : "."} Press ctrl-C to exit.`);

        if (opts.open) {
            open(`http://localhost:${PORT}`);
        }
    })
    .on("error", () => {
        if (++attempts > 1000) {
            console.log(`Unable to bind on port ${FIRST_PORT}.`);
            console.log(`Error: Unable to find available port.`);
            console.log(`Please specify a different port using the --port <port> option.\n`)
            console.log(`Use\n`)
            console.log(`\tw4 help watch\n`)
            console.log('or\n')
            console.log(`\tw4 help run\n`)
            console.log('for more information.')
            exit(1);
        } else {
            PORT++;
            start(cartFile, opts);
        }
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
                    client.send("reload");
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
