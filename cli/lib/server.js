const path = require("path");
const fs = require("fs");
const express = require("express");
const { Server: WebSocketServer } = require("ws");

function start (cartFile) {
    const app = express();
    app.get("/cart.wasm", (req, res) => {
        fs.createReadStream(cartFile).pipe(res);
    });
    app.use(express.static(__dirname+"/../../runtimes/web/dist"));

    const server = app.listen(4444, () => {
        console.log("Listening on http://localhost:4444");
    });

    const wsServer = new WebSocketServer({ noServer: true });
    wsServer.on("connection", socket => {
        socket.on("message", message => {
            process.stdout.write(message);
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
