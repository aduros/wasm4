import { WIDTH, HEIGHT, BACKGROUND_WIDTH, BACKGROUND_HEIGHT } from "./graphics";
import * as graphics from "./graphics";
import { WebGLCompositor, Canvas2DCompositor } from "./compositor";
import { Printer } from "./printer";

const DEBUG = (process.env.NODE_ENV != "production");

const ADDR_GAMEPAD0 = 0x01;
const ADDR_GAMEPAD1 = 0x02;
const ADDR_GAMEPAD2 = 0x03;
const ADDR_GAMEPAD3 = 0x04;
const ADDR_MOUSE_X = 0x05;
const ADDR_MOUSE_Y = 0x07;
const ADDR_MOUSE_BUTTONS = 0x09;
// const ADDR_MOUSE_WHEEL = 0x07;

const ADDR_PALETTE = 0x10;
const ADDR_SCROLL_X = 0x20;
const ADDR_SCROLL_Y = 0x24;

export class Runtime {
    constructor () {
        const canvas = document.createElement("canvas");
        canvas.width = WIDTH;
        canvas.height = HEIGHT;
        this.canvas = canvas;

        const gl = canvas.getContext("webgl2", {
            alpha: false,
            depth: false,
        });
        this.compositor = (gl != null) ? new WebGLCompositor(gl) : new Canvas2DCompositor(canvas);

        this.background = new Uint8Array(BACKGROUND_WIDTH*BACKGROUND_HEIGHT);
        this.foreground = new Uint8Array(WIDTH*HEIGHT);

        this.memory = new WebAssembly.Memory({initial: 1, maximum: 1});
        this.data = new DataView(this.memory.buffer);

        // TODO(2021-07-03): Initialize to the CGA palette?
        this.data.setUint32(ADDR_PALETTE, 0xcafebabe);

        this.printer = new Printer();

        const onPointerEvent = event => {
            event.preventDefault();

            // Do certain things that require a user gesture
            if (event.type == "pointerdown") {
                if (document.fullscreenElement == null && event.pointerType == "touch") {
                    // Go fullscreen on mobile
                    canvas.requestFullscreen({navigationUI: "hide"});
                }
                // if (audioCtx.state == "suspended") {
                //     // Try to resume audio
                //     audioCtx.resume();
                // }
            }

            const bounds = canvas.getBoundingClientRect();
            const x = WIDTH * (event.clientX - bounds.left) / bounds.width;
            const y = HEIGHT * (event.clientY - bounds.top) / bounds.height;
            const buttons = event.buttons;

            this.data.setUint16(ADDR_MOUSE_X, Math.fround(x), true);
            this.data.setUint16(ADDR_MOUSE_Y, Math.fround(y), true);
            this.data.setUint8(ADDR_MOUSE_BUTTONS, buttons);
        };
        canvas.addEventListener("pointerdown", onPointerEvent);
        canvas.addEventListener("pointerup", onPointerEvent);
        canvas.addEventListener("pointermove", onPointerEvent);

        canvas.addEventListener("contextmenu", event => {
            event.preventDefault();
        });

        const onKeyboardEvent = async event => {
            if (event.type == "keydown") {
                switch (event.keyCode) {
                case 50: // 2
                    // Save state
                    this.snapshot = {
                        memory: new Uint32Array(this.memory.buffer.slice()),
                        background: this.background.slice(),
                    };
                    return;
                case 52: // 4
                    // Load state
                    if (this.snapshot != null) {
                        new Uint32Array(this.memory.buffer).set(this.snapshot.memory);
                        this.background.set(this.snapshot.background);
                    }
                    return;
                case 82: // R
                    // Hot reload
                    if (DEBUG) {
                        const res = await fetch("cart.wasm");
                        const wasmBuffer = await res.arrayBuffer();
                        this.boot(wasmBuffer);
                    }
                    return;
                }
            }

            let mask = 0;
            switch (event.keyCode) {
            case 32: // Space
                mask = 1;
                break;
            // case 13: // Enter
            //     mask = 2;
            //     break;
            case 38: // Up
                mask = 64;
                break;
            case 40: // Down
                mask = 128;
                break;
            case 37: // Left
                mask = 16;
                break;
            case 39: // Right
                mask = 32;
                break;
            default:
                return;
            }
            event.preventDefault();

            let buttons = this.data.getUint8(ADDR_GAMEPAD0);
            if (event.type == "keydown") {
                buttons |= mask;
            } else {
                buttons &= ~mask;
            }
            this.data.setUint8(ADDR_GAMEPAD0, buttons);
        };
        window.addEventListener("keydown", onKeyboardEvent);
        window.addEventListener("keyup", onKeyboardEvent);
    }

    async boot (wasmBuffer) {
        const module = await WebAssembly.instantiate(wasmBuffer, {
            env: {
                memory: this.memory,

                drawRect: this.drawRect.bind(this),
                drawSprite: this.drawSprite.bind(this),

                // Printing functions
                print: ptr => {
                    const cstr = new Uint8Array(this.memory.buffer, ptr);
                    this.printer.printCStr(cstr);
                },
                printc: c => {
                    this.printer.printChar(c);
                },
                printn: number => {
                    this.printer.printRaw(number);
                },
                printd: decimal => {
                    this.printer.printRaw(decimal);
                },
                printx: hex => {
                    this.printer.printHex(hex);
                },

                // Temporary(?) for assemblyscript
                abort: function () {},
            },
        });
        this.wasm = module.instance;

        if (this.wasm.exports.start != null) {
            this.wasm.exports.start();
        }
    }

    drawRect (x, y, width, height, flags) {
        const isForeground = (flags & 2);

        const layer = isForeground ? this.foreground : this.background;
        const layerWidth = isForeground ? WIDTH : BACKGROUND_WIDTH;
        const colorIdx = this.data.getUint8(ADDR_PALETTE);

        graphics.drawRect(layer, layerWidth, colorIdx, x, y, width, height);
    }

    drawSprite (spritePtr, x, y, flags) {
        const sprite = new Uint8Array(this.memory.buffer, spritePtr);
        const palette = new Uint8Array(this.memory.buffer, ADDR_PALETTE);

        const bpp2 = (flags & 1);
        const isForeground = (flags & 2);
        const flipX = (flags & 4);
        const flipY = (flags & 8);

        const layer = isForeground ? this.foreground : this.background;
        const layerWidth = isForeground ? WIDTH : BACKGROUND_WIDTH;

        this.compositor.dirty(isForeground);

        if (bpp2) {
            graphics.drawSprite2BPP(layer, layerWidth, sprite, x, y, palette, flipX, flipY);
        } else {
            graphics.drawSprite1BPP(layer, layerWidth, sprite, x, y, palette, flipX, flipY);
        }
    }

    update () {
        if (this.wasm.exports.update != null) {
            this.foreground.fill(0);
            this.wasm.exports.update();
        }

        const scrollX = this.data.getInt16(ADDR_SCROLL_X, true);
        const scrollY = this.data.getInt16(ADDR_SCROLL_Y, true);
        this.compositor.composite(this.background, this.foreground, scrollX, scrollY);
    }
}
