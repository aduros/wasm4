const fs = require("fs");
const path = require("path");
const pngjs = require("pngjs");
const mustache = require("mustache");

const TEMPLATES = {
    assemblyscript:
        `{{#sprites}}
// {{name}}
const {{name}}Width = {{width}};
const {{name}}Height = {{height}};
const {{name}}Flags = {{flags}}; // {{flagsHumanReadable}}
const {{name}} = memory.data<u8>([ {{bytes}} ]);

{{/sprites}}`,

    c:
        `{{#sprites}}
// {{name}}
#define {{name}}Width {{width}}
#define {{name}}Height {{height}}
#define {{name}}Flags {{flagsHumanReadable}}
const uint8_t {{name}}[{{length}}] = { {{bytes}} };

{{/sprites}}`,

    d:
        `{{#sprites}}
// {{name}}
enum {{name}}Width = {{width}};
enum {{name}}Height = {{height}};
enum {{name}}Flags = {{flag}}; // {{flagsHumanReadable}}
immutable ubyte[] {{name}} = [ {{bytes}} ];

{{/sprites}}`,

    go:
        `{{#sprites}}
// {{name}}
const {{name}}Width = {{width}}
const {{name}}Height = {{height}}
const {{name}}Flags = {{flags}} // {{flagsHumanReadable}}
var {{name}} = [{{length}}]byte { {{bytes}} }

{{/sprites}}`,

    nelua:
        `{{#sprites}}
-- {{name}}
local {{name}}_width <comptime> = {{width}}
local {{name}}_height <comptime> = {{height}}
local {{name}}_flags <comptime> = {{flags}} -- {{flagsHumanReadable}}
local {{name}}: [{{length}}]uint8 <const> = { {{bytes}} }

{{/sprites}}`,

    nim:
        `{{#sprites}}
# {{name}}
const {{name}}Width = {{width}}
const {{name}}Height = {{height}}
const {{name}}Flags = {{flagsHumanReadable}}
var {{name}}: array[uint8, {{length}}] = [{{firstByte}}'u8,{{restBytes}}]

{{/sprites}}`,

    odin:
        `{{#sprites}}
// {{name}}
{{odinName}}_width : u32 : {{width}}
{{odinName}}_height : u32 : {{height}}
{{odinName}}_flags : w4.Blit_Flags : {{odinFlags}} // {{flagsHumanReadable}}
{{odinName}} := [{{length}}]u8{ {{bytes}} }

{{/sprites}}`,

    rust:
        `{{#sprites}}
// {{name}}
const {{rustName}}_WIDTH: u32 = {{width}};
const {{rustName}}_HEIGHT: u32 = {{height}};
const {{rustName}}_FLAGS: u32 = {{flags}}; // {{flagsHumanReadable}}
const {{rustName}}: [u8; {{length}}] = [ {{bytes}} ];

{{/sprites}}`,

    wat:
        `{{#sprites}}
;; {{name}}
;; {{name}}_width: u32 = {{width}};
;; {{name}}_height: u32 = {{height}};
;; {{name}}_flags: u32 = {{flags}}; // {{flagsHumanReadable}}
(data
  (i32.const ???)
  "{{wasmBytes}}"
)

{{/sprites}}`,

    zig:
        `{{#sprites}}
// {{name}}
const {{name}}_width = {{width}};
const {{name}}_height = {{height}};
const {{name}}_flags = {{flags}}; // {{flagsHumanReadable}}
const {{name}} = [{{length}}]u8{ {{bytes}} };

{{/sprites}}`,
};

const ALIASES = {
    rs: "rust",
    as: "assemblyscript",
    cpp: "c",
};

function run(sourceFile) {
    const png = pngjs.PNG.sync.read(fs.readFileSync(sourceFile), {
        colorType: 1,
        inputColorType: 1,
    });

    const palette = {};
    let colorCount = 0;
    for (let y = 0; y < png.height; ++y) {
        for (let x = 0; x < png.width; ++x) {
            const idx = 4 * (png.width * y + x);
            const r = png.data[idx];
            const g = png.data[idx + 1];
            const b = png.data[idx + 2];
            const a = png.data[idx + 3];
            const packed = (r << 24) | (g << 16) | (b << 8) | a;
            let s = palette[packed]
            if (!s) {
                if (colorCount >= 4) {
                    let RGBs = [];
                    for (let key in palette) {
                        RGBs.push(`- (R: ${palette[key].r}, G: ${palette[key].g}, B: ${palette[key].b}, A: ${palette[key].a}); first seen at (${palette[key].x}, ${palette[key].y})`)
                    }
                    throw new Error(`
Too many colors: maximum is 4. The previous colors were:
${RGBs.join("\n")}
The first occurrence of another color is at (${x}, ${y}) and has the value of (R: ${r}, G: ${g}, B: ${b}, A: ${a})`);
                }
                palette[packed] = {
                    r: r,
                    g: g,
                    b: b,
                    a: a,
                    i: colorCount++,
                    x: x,
                    y: y,
                };
            }
        }
    }

    let flags, flagsHumanReadable, odinFlags;
    let bpp;
    if (colorCount <= 2) {
        bpp = 1;
        flags = 0;
        flagsHumanReadable = "BLIT_1BPP";
        odinFlags = "nil"
    } else if (colorCount <= 4) {
        bpp = 2;
        flags = 1;
        flagsHumanReadable = "BLIT_2BPP";
        odinFlags = "{ .USE_2BPP }"
    }

    const factor = 8 / bpp;
    if (png.width % factor != 0) {
        throw new Error(`${bpp}BPP sprites must have a width divisible by ${factor}`);
    }

    const bytes = new Uint8Array(png.width * png.height * bpp / 8);

    // Read a color (palette index) from the source png
    function readColor(x, y) {
        const idx = 4 * (png.width * y + x);
        const r = png.data[idx];
        const g = png.data[idx + 1];
        const b = png.data[idx + 2];
        const a = png.data[idx + 3];
        const packed = (r << 24) | (g << 16) | (b << 8) | a;
        return palette[packed].i;
    }

    // Write a color (palette index) to the output buffer
    function writeColor(color, x, y) {
        let idx, shift, mask;
        switch (bpp) {
            case 1:
                idx = (y * png.width + x) >> 3;
                shift = 7 - (x & 0x07);
                mask = 0x1 << shift;
                break;

            case 2:
                idx = (y * png.width + x) >> 2;
                shift = 6 - ((x & 0x3) << 1);
                mask = 0x3 << shift;
                break;

            default:
                throw new Error("assert");
        }

        bytes[idx] = (color << shift) | (bytes[idx] & (~mask));
    }

    for (let y = 0; y < png.height; ++y) {
        for (let x = 0; x < png.width; ++x) {
            const color = readColor(x, y);
            writeColor(color, x, y);
        }
    }

    const varName = path
        .basename(sourceFile, ".png")
        .replace(/[^0-9A-Za-z]+/g, "_")
        .replace(/^([0-9])/, "_$1");

    const rustVarName = (varName.substr(0, 1) + varName.substr(1)
        .replace(/[A-Z]/g, l => '_' + l))
        .toLocaleUpperCase()

    const dataBytes = [...bytes]
        .map((b) => "0x" + b.toString(16).padStart(2, "0"))

    const data = dataBytes.join(',')

    const wasmBytes = [...bytes]
        .map((b) => "\\" + b.toString(16).padStart(2, "0"))

    const odinVarName = (varName.substr(0, 1) + varName.substr(1)
        .replace(/[A-Z]/g, l => '_' + l))
        .toLocaleLowerCase()

    return {
        "name": varName,
        "height": png.height,
        "width": png.width,
        "length": bytes.length,
        "flags": flags,
        "flagsHumanReadable": flagsHumanReadable,
        "bytes": data,
        "firstByte": dataBytes[0],
        "restBytes": dataBytes.slice(1).join(','),
        "wasmBytes": wasmBytes.join(''),
        "rustName": rustVarName,
        "odinName": odinVarName,
        "odinFlags": odinFlags,
    };
}

exports.run = run;

function runAll(files, opts) {
    if (opts.template) {
        template = fs.readFileSync(opts.template, { encoding: 'utf8' });

    } else {
        // TODO(2021-12-20): Refactor into a common file and remove duplication with new.js
        let lang = opts.lang;
        if (ALIASES[lang]) {
            lang = ALIASES[lang];
        }
        if (opts.assemblyscript) {
            lang = "assemblyscript";
        } else if (opts.c || opts.cpp) {
            lang = "c";
        } else if (opts.d) {
            lang = "d";
        } else if (opts.go) {
            lang = "go";
        } else if (opts.nelua) {
            lang = "nelua";
        } else if (opts.nim) {
            lang = "nim";
        } else if (opts.odin) {
            lang = "odin";
        } else if (opts.rust) {
            lang = "rust";
        } else if (opts.wat) {
            lang = "wat";
        } else if (opts.zig) {
            lang = "zig";
        }
        template = TEMPLATES[lang];
    }

    let output = { "sprites": [] };
    for (let ii = 0; ii < files.length; ++ii) {
        const file = files[ii];

        try {
            if (ii > 0) {
                console.log();
            }

            output.sprites.push(run(file));
        } catch (error) {
            console.error("Error processing " + file + ": " + error.message);
            break;
        }
    }

    const parsed = mustache.render(template, output);
    if (opts.output == "-") {
        console.log(parsed);
    } else {
        fs.writeFileSync(opts.output, parsed);
    }
}

exports.runAll = runAll;
