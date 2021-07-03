import { WIDTH, HEIGHT, BACKGROUND_WIDTH, BACKGROUND_HEIGHT } from "./graphics";
import * as graphics from "./graphics";
import { WebGLCompositor, Canvas2DCompositor } from "./compositor";
import { Printer } from "./printer";

const DEBUG = (process.env.NODE_ENV != "production");

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

        this.printer = new Printer();

        // Devices
        this.palette = null;
        this.gamepads = null;
        this.mouse = null;
        this.scroll = null;

        const onPointerEvent = event => {
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

            if (this.mouse == null) {
                return;
            }
            event.preventDefault();

            const bounds = canvas.getBoundingClientRect();
            const x = WIDTH * (event.clientX - bounds.left) / bounds.width;
            const y = HEIGHT * (event.clientY - bounds.top) / bounds.height;
            const buttons = event.buttons;
            this.mouse[0] = x;
            this.mouse[1] = y;
            this.mouse[2] = buttons;
        };
        canvas.addEventListener("pointerdown", onPointerEvent);
        canvas.addEventListener("pointerup", onPointerEvent);
        canvas.addEventListener("pointermove", onPointerEvent);

        canvas.addEventListener("contextmenu", event => {
            if (this.mouse != null) {
                event.preventDefault();
            }
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

            if (this.gamepads == null) {
                return;
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

            let buttons = this.gamepads[0];
            if (event.type == "keydown") {
                buttons |= mask;
            } else {
                buttons &= ~mask;
            }
            this.gamepads[0] = buttons;
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
                mapDevice: this.mapDevice.bind(this),

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

    mapDevice (deviceId, ptr) {
        const memory = this.memory.buffer;
        switch (deviceId) {
        case 0: // DEVICE_PALETTE
            this.palette = ptr ? new Uint8Array(memory, ptr, 4) : null;
            break;
        case 1: // DEVICE_MOUSE
            this.mouse = ptr ? new Uint32Array(memory, ptr, 3) : null;
            break;
        case 2: // DEVICE_GAMEPADS
            this.gamepads = ptr ? new Uint8Array(memory, ptr, 4) : null;
            break;
        case 3: // DEVICE_SCROLL
            this.scroll = ptr ? new Int32Array(memory, ptr, 2) : null;
            break;
        }
    }

    drawRect (colorIdx, x, y, width, height, flags) {
        const isForeground = (flags & 2);

        const layer = isForeground ? this.foreground : this.background;
        const layerWidth = isForeground ? WIDTH : BACKGROUND_WIDTH;

        graphics.drawRect(layer, layerWidth, colorIdx, x, y, width, height);
    }

    drawSprite (spritePtr, x, y, flags) {
        const sprite = new Uint8Array(this.memory.buffer, spritePtr);

        const bpp2 = (flags & 1);
        const isForeground = (flags & 2);
        const flipX = (flags & 4);
        const flipY = (flags & 8);

        const layer = isForeground ? this.foreground : this.background;
        const layerWidth = isForeground ? WIDTH : BACKGROUND_WIDTH;
        const palette = this.palette;
        if (palette == null) {
            return;
        }

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

        let scrollX = 0, scrollY = 0;
        if (this.scroll != null) {
            scrollX = this.scroll[0];
            scrollY = this.scroll[1];
        }
        this.compositor.composite(this.background, this.foreground, scrollX, scrollY);
    }
}
