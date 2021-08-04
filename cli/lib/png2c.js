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

    // Map rgba to palette index
    const palette = new Map();
    for (let ii = 0; ii < png.palette.length; ++ii) {
        const rgba = png.palette[ii];
        const packed = (rgba[0] << 24) | (rgba[1] << 16) | (rgba[2] << 8) | rgba[3];
        palette.set(packed, ii);
    }

    let flags;
    let bpp;
    if (palette.size <= 2) {
        bpp = 1;
        flags = "DRAW_1BPP";
    } else if (palette.size <= 4) {
        bpp = 2;
        flags = "DRAW_2BPP";
    } else {
        throw new Error("Palette is larger than 4 colors");
    }

    const factor = 8 / bpp;
    if (png.width % factor != 0) {
        throw new Error(`${bpp}BPP sprites must have a width divisible by ${factor}`);
    }

    const bytes = Buffer.alloc(png.width*png.height*bpp/8);

    // Read a color (palette index) from the source png
    function readColor (x, y) {
        const idx = 4*(png.width*y + x);
        const r = png.data[idx];
        const g = png.data[idx+1];
        const b = png.data[idx+2];
        const a = png.data[idx+3];
        const packed = (r << 24) | (g << 16) | (b << 8) | a;
        return palette.get(packed);
    }

    // Write a color (palette index) to the output buffer
    function writeColor (color, x, y) {
        switch (bpp) {
        case 1:
            var idx = (y*png.width + x) >> 3;
            var offset = 7 - (x & 0x07);
            bytes[idx] = (bytes[idx] & ~(0x01 << offset)) | (color << offset);
        case 2:
            var idx = (y*png.width + x) >> 2;
            var shift = 6 - ((x & 0x3) << 1);
            const mask = 0x3 << shift;
            bytes[idx] = (color << shift) | (bytes[idx] & (~mask));
            return;
        }
    }

    for (let y = 0; y < png.height; ++y) {
        for (let x = 0; x < png.width; ++x) {
            const color = readColor(x, y);
            writeColor(color, x, y);
        }
    }

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
