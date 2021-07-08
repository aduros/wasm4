import * as constants from "./constants";
import { WebGLCompositor, Canvas2DCompositor } from "./compositor";
import { Printer } from "./printer";
import { Framebuffer } from "./framebuffer";

export class Runtime {
    constructor () {
        const canvas = document.createElement("canvas");
        canvas.width = constants.WIDTH;
        canvas.height = constants.HEIGHT;
        this.canvas = canvas;

        const gl = canvas.getContext("webgl2", {
            alpha: false,
            depth: false,
            antialias: false,
        });
        this.compositor = (gl != null) ? new WebGLCompositor(gl) : new Canvas2DCompositor(canvas);

        this.memory = new WebAssembly.Memory({initial: 1, maximum: 1});
        this.data = new DataView(this.memory.buffer);

        this.background = new Framebuffer(this.memory.buffer, constants.ADDR_FRAMEBUFFER_BACKGROUND,
            constants.BACKGROUND_WIDTH, constants.BACKGROUND_HEIGHT);
        this.foreground = new Framebuffer(this.memory.buffer, constants.ADDR_FRAMEBUFFER_FOREGROUND,
            constants.WIDTH, constants.HEIGHT);

        // Initialize default color table and palette
        new Uint8Array(this.memory.buffer).set(constants.COLORS, constants.ADDR_PALETTE_BACKGROUND);
        new Uint8Array(this.memory.buffer).set(constants.COLORS, constants.ADDR_PALETTE_FOREGROUND);
        this.data.setUint16(constants.ADDR_DRAW_COLORS, 0x4321);

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
            const x = constants.WIDTH * (event.clientX - bounds.left) / bounds.width;
            const y = constants.HEIGHT * (event.clientY - bounds.top) / bounds.height;
            const buttons = event.buttons;

            this.data.setUint8(constants.ADDR_MOUSE_X, Math.fround(x));
            this.data.setUint8(constants.ADDR_MOUSE_Y, Math.fround(y));
            this.data.setUint8(constants.ADDR_MOUSE_BUTTONS, buttons);
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
                    this.snapshot = new Uint32Array(this.memory.buffer.slice());
                    return;
                case 52: // 4
                    // Load state
                    if (this.snapshot != null) {
                        new Uint32Array(this.memory.buffer).set(this.snapshot);
                    }
                    return;
                case 82: // R
                    // Hot reload
                    if (constants.DEBUG) {
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

            let buttons = this.data.getUint8(constants.ADDR_GAMEPAD0);
            if (event.type == "keydown") {
                buttons |= mask;
            } else {
                buttons &= ~mask;
            }
            this.data.setUint8(constants.ADDR_GAMEPAD0, buttons);
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

                __memset: (ptr, byte, length) => {
                    new Uint8Array(this.memory.buffer, ptr, length).fill(byte);
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
        const colors = this.data.getUint16(constants.ADDR_DRAW_COLORS, true);

        const framebuffer = isForeground ? this.foreground : this.background;
        framebuffer.drawRect(colors & 0x0f, x, y, width, height);
    }

    drawSprite (spritePtr, x, y, flags) {
        const sprite = new Uint8Array(this.memory.buffer, spritePtr);
        const colors = this.data.getUint16(constants.ADDR_DRAW_COLORS, true);
        const bpp2 = (flags & 1);
        const isForeground = (flags & 2);
        const flipX = (flags & 4);
        const flipY = (flags & 8);

        const framebuffer = isForeground ? this.foreground : this.background;
        if (bpp2) {
            framebuffer.drawSprite2BPP(sprite, colors, x, y, flipX, flipY);
        } else {
            framebuffer.drawSprite1BPP(sprite, colors, x, y, flipX, flipY);
        }
    }

    update () {
        this.foreground.clear();
        if (this.wasm.exports.update != null) {
            this.wasm.exports.update();
        }

        const palettes = new Uint8Array(this.memory.buffer, constants.ADDR_PALETTE_BACKGROUND, 2*3*16);
        const scrollX = this.data.getInt32(constants.ADDR_SCROLL_X, true);
        const scrollY = this.data.getInt32(constants.ADDR_SCROLL_Y, true);
        this.compositor.composite(palettes, this.background, this.foreground, scrollX, scrollY);
    }
}
