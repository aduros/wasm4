const fs = require("fs");
const path = require("path");
const pngjs = require("pngjs");

function run (sourceFile) {
    const png = pngjs.PNG.sync.read(fs.readFileSync(sourceFile), {
        colorType: 1,
        inputColorType: 1,
    });

    if (!png.palette) {
        throw new Error("Does not have indexed color palette");
    }

    const palette = new Map();
    for (let ii = 0; ii < png.palette.length; ++ii) {
        const rgba = png.palette[ii];
        const packed = (rgba[0] << 24) | (rgba[1] << 16) | (rgba[2] << 8) | rgba[3];
        palette.set(packed, ii);
    }

    function pixel (x, y) {
        const idx = 4*(png.width*y + x);
        const r = png.data[idx];
        const g = png.data[idx+1];
        const b = png.data[idx+2];
        const a = png.data[idx+3];
        const packed = (r << 24) | (g << 16) | (b << 8) | a;
        return palette.get(packed);
    }

    const bytes = [];

    let flags;
    let bpp;
    let minWidth;
    if (palette.size <= 2) {
        bpp = 1;
        minWidth = 8;
        flags = "DRAW_1BPP";
    } else if (palette.size <= 4) {
        bpp = 2;
        minWidth = 4;
        flags = "DRAW_2BPP";
    } else if (palette.size <= 16) {
        bpp = 4;
        minWidth = 2;
        flags = "DRAW_4BPP";
    } else {
        throw new Error("Palette is larger than 16 colors");
    }

    const factor = 8 / bpp;
    if (png.width % factor != 0) {
        throw new Error(`${bpp}BPP sprites must have a width divisible by ${factor}`);
    }

    for (let y = 0; y < png.height; ++y) {
        let byte = 0;
        let bitCount = 0;
        for (let x = 0; x < png.width; ++x) {
            const p = pixel(x, y);
            // process.stdout.write(p.toString(16).replace("0", "."));
            byte |= p;
            bitCount += bpp;
            // console.log("Wrote: "+byte);
            if (bitCount == 8) {
                // console.log("Flush : "+byte.toString(2).padStart(8, "0"));
                // console.log("--> Flush : "+byte);
                bytes.push(byte);
                byte = 0;
                bitCount = 0;
            } else {
                byte <<= bpp;
            }
        }
        // console.log(byte.toString(2));
        // process.stdout.write("\n");
    }

    // var zlib = require("zlib");
    // var output = zlib.createGzip();
    // fs.writeFileSync("out.dat", Buffer.from(bytes));

    const varName = path.basename(sourceFile, ".png").replace(/[^0-9A-Za-z]+/g, "_").replace(/^([0-9])/, "_$1");
    console.log(`#define ${varName}_WIDTH ${png.width}`);
    console.log(`#define ${varName}_HEIGHT ${png.height}`);
    console.log(`#define ${varName}_FLAGS ${flags}`);
    process.stdout.write(`const char ${varName}[${bytes.length}] = { `);
    for (let ii = 0; ii < bytes.length; ++ii) {
        const byte = bytes[ii];
        if (ii > 0) {
            process.stdout.write(",");
        }
        process.stdout.write("0x"+byte.toString(16).padStart(2, "0"));
    }
    console.log(" };");
}
exports.run = run;

function runAll (files) {
    for (let ii = 0; ii < files.length; ++ii) {
        const file = files[ii];
        try {
            if (ii > 0) {
                console.log();
            }
            run(file);
        } catch (error) {
            console.error("Error processing "+file+": "+error.message);
            break;
        }
    }
}
exports.runAll = runAll;
