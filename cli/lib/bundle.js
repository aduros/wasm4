const fs = require("fs").promises;
const path = require("path");

function z85 (src) {
    const ENCODER = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.-:+=^!/*?&<>()[]{}@%$#".split("");

    const size = src.length;
    const extra = (size % 4);
    const paddedSize = extra ? size + 4-extra : size;
    
    let str = "",
        byte_nbr = 0,
        value = 0;
    while (byte_nbr < paddedSize) {
        const b = (byte_nbr < size) ? src[byte_nbr] : 0;
        ++byte_nbr;
        value = (value * 256) + b;
        if ((byte_nbr % 4) == 0) {
            let divisor = 85 * 85 * 85 * 85;
            while (divisor >= 1) {
                const idx = Math.floor(value / divisor) % 85;
                str += ENCODER[idx];
                divisor /= 85;
            }
            value = 0;
        }
    }
    
    return str;
}

async function run (cartFile, opts) {
    const runtimeDir = path.resolve(__dirname+"/../assets/runtime");

    const outFile = opts.html;
    if (outFile == null) {
        throw new Error("You must specify one or more bundle outputs.");
    }

    let [cart, html, css, js] = await Promise.all([
        fs.readFile(cartFile),
        fs.readFile(runtimeDir+"/index.html", "utf8"),
        fs.readFile(runtimeDir+"/wasm4.css", "utf8"),
        fs.readFile(runtimeDir+"/wasm4.js", "utf8"),
    ]);

    js = `const WASM4_CART="${z85(cart)}",WASM4_CART_SIZE=${cart.length};${js}`;
    js = js.replace(/<\//g, "<\\/");

    // It would be safer to use an HTML parser, but this is good enough for now
    html = html.replace('<link rel="stylesheet" href="wasm4.css">', `<style>${css}</style>`);
    html = html.replace('<script src="wasm4.js"></script>', `<script>${js}</script>`);

    await fs.writeFile(outFile, html);
    console.log(`OK! Bundled ${outFile}.`);
}
exports.run = run;
