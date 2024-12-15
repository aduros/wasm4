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

    c3:
        `{{#sprites}}
// {{name}}
const uint {{rustName}}_WIDTH = {{width}};
const uint {{rustName}}_HEIGHT = {{height}};
const uint {{rustName}}}_FLAGS = {{flag}}; // {{flagsHumanReadable}}
const char[{{length}}] {{rustName}} = { {{bytes}} };

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

grain:
`{{#sprites}}
// {{name}}
let {{name}}Width = {{width}}us
let {{name}}Height = {{height}}us
let {{name}}Flags = {{flags}}us // {{flagsHumanReadable}}
let {{name}} = b"{{charBytes}}"

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
var {{name}}: array[{{length}}, uint8] = [{{firstByte}}'u8,{{restBytes}}]

{{/sprites}}`,

    odin:
        `{{#sprites}}
// {{name}}
{{odinName}}_width : u32 : {{width}}
{{odinName}}_height : u32 : {{height}}
{{odinName}}_flags : w4.Blit_Flags : {{odinFlags}} // {{flagsHumanReadable}}
{{odinName}} := [{{length}}]u8{ {{bytes}} }

{{/sprites}}`,

    penne:
        `{{#sprites}}
// {{name}}
const {{rustName}}_WIDTH: u32 = {{width}};
const {{rustName}}_HEIGHT: u32 = {{height}};
const {{rustName}}_FLAGS: u32 = {{flags}}; // {{flagsHumanReadable}}
const {{rustName}}: [{{length}}]u8 = [ {{bytes}} ];

{{/sprites}}`,

    porth:
        `{{#sprites}}
// {{name}} sprite
const {{name}}-sprite \"{{porthBytes}}\"c end
const {{name}}-flags  {{flags}} end // {{flagsHumanReadable}}
const {{name}}-height {{height}} end
const {{name}}-width  {{width}} end

{{/sprites}}`,

    roc:
        `{{#sprites}}
# {{name}} sprite
{{name}}Sprite = Sprite.new {
    data: [ {{bytes}} ],
    bpp: BPP{{bpp}},
    width: {{width}},
    height: {{height}},
}

{{/sprites}}`,

    roland:
        `{{#sprites}}
// {{name}}
const {{rustName}}_WIDTH: u32 = {{width}};
const {{rustName}}_HEIGHT: u32 = {{height}};
const {{rustName}}_FLAGS: u32 = {{flags}}; // {{flagsHumanReadable}}
static {{rustName}}: [u8; {{length}}] = [ {{bytes}} ];

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
pub const {{name}}_width = {{width}};
pub const {{name}}_height = {{height}};
pub const {{name}}_flags = {{flags}}; // {{flagsHumanReadable}}
pub const {{name}} = [{{length}}]u8{ {{bytes}} };

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

    const palette = new Map();
    let colorCount = 0;
    for (let y = 0; y < png.height; ++y) {
        for (let x = 0; x < png.width; ++x) {
            const idx = 4 * (png.width * y + x);
            const r = png.data[idx];
            const g = png.data[idx + 1];
            const b = png.data[idx + 2];
            const a = png.data[idx + 3];
            const packed = (r << 24) | (g << 16) | (b << 8) | a;
            if (!palette.has(packed)) {
                if (colorCount >= 4) {
                    const rgbHistory = [...palette.values()].map(
                        c => `- (R: ${c.r}, G: ${c.g}, B: ${c.b}, A: ${c.a}); first seen at (${c.x}, ${c.y})`);
                    throw new Error(`
Too many colors: maximum is 4. The previous colors were:
${rgbHistory.join("\n")}
The first occurrence of another color is at (${x}, ${y}) and has the value of (R: ${r}, G: ${g}, B: ${b}, A: ${a})`);
                }
                palette.set(packed, {
                    r, g, b, a, x, y,
                    i: colorCount++,
                    brightness: (0.2126*r + 0.7152*g + 0.0722*b) * a,
                });
            }
        }
    }

    if (png.palette) {
        // If the png has a palette, use that order.
        // In the special case that the png palette contains 4 colors but we
        // only use 3 of them, don't shift colors over.
        const forceOrder = png.palette.length === 4 && colorCount === 3;
        colorCount = 0;
        for (let rgba of png.palette) {
            const r = rgba[0];
            const g = rgba[1];
            const b = rgba[2];
            const a = rgba[3];
            const packed = (r << 24) | (g << 16) | (b << 8) | a;
            if (palette.has(packed)) {
                palette.set(packed, {i: colorCount++});
            } else if (forceOrder) {
                colorCount++;
            }
        }
    } else {
        // Sort palette by brightness value
        const paletteKeys = [...palette.keys()];
        paletteKeys.sort((packedA, packedB) =>
            palette.get(packedB).brightness - palette.get(packedA).brightness);
        paletteKeys.forEach((k, i) => palette.set(k, {i}));
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

    const bytes = new Uint8Array((png.width * png.height * bpp + 7 ) / 8);

    // Read a color (palette index) from the source png
    function readColor(x, y) {
        const idx = 4 * (png.width * y + x);
        const r = png.data[idx];
        const g = png.data[idx + 1];
        const b = png.data[idx + 2];
        const a = png.data[idx + 3];
        const packed = (r << 24) | (g << 16) | (b << 8) | a;
        return palette.get(packed).i;
    }

    // Write a color (palette index) to the output buffer
    function writeColor(color, x, y) {
        if(bpp != 1 && bpp != 2){
            throw new Error("Unexpected bpp");
        }

        const color_idx = (y * png.width + x);
        const idx = Math.floor(color_idx / ( 8 / bpp ));
        const shift = ((8 / bpp - 1)-color_idx % ( 8 / bpp )) * bpp;

        bytes[idx] = (color << shift) | (bytes[idx]);
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

    const charBytes = [...bytes]
        .map((b) => "\\x" + b.toString(16).padStart(2, "0"))

    const wasmBytes = [...bytes]
        .map((b) => "\\" + b.toString(16).padStart(2, "0"))

    const porthBytes = [...bytes]
        .map((b) => "\\\\" + b.toString(16).padStart(2, "0"))

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
        "bpp": bpp,
        "charBytes": charBytes.join(''),
        "firstByte": dataBytes[0],
        "restBytes": dataBytes.slice(1).join(','),
        "wasmBytes": wasmBytes.join(''),
        "porthBytes": porthBytes.join(''),
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
        const lang = opts.lang;
        template = TEMPLATES[lang == "cpp" ? "c" : lang];
    }

    let output = { "sprites": [] };
    for (let ii = 0; ii < files.length; ++ii) {
        const filePath = files[ii];
        try {
            const filePaths = !fs.statSync(filePath).isDirectory() ? [filePath] : 
                               fs.readdirSync(filePath)
                                 .filter(file => path.extname(file).toLowerCase() === '.png')
                                 .map(file => path.join(filePath, file));

            for (let iii = 0; iii < filePaths.length; ++iii) {
                const pngFile = filePaths[iii];
                if (ii | iii > 0) {
                    console.log();
                }
                output.sprites.push(run(pngFile));
            }
        } catch (error) {
            throw new Error("Error processing " + filePath + ": " + error.message);
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
