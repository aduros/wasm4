import * as constants from "./constants";
import { APU } from "./apu";
import { Framebuffer } from "./framebuffer";
import { WebGLCompositor, Canvas2DCompositor } from "./compositor";
import { websocket } from "./websocket";

export class Runtime {
    constructor () {
        const canvas = document.createElement("canvas");
        canvas.width = constants.WIDTH;
        canvas.height = constants.HEIGHT;
        this.canvas = canvas;

        const gl = canvas.getContext("webgl", {
            alpha: false,
            depth: false,
            antialias: false,
        });
        this.compositor = new WebGLCompositor(gl); // TODO(2021-08-01): Fallback to CanvasCompositor

        this.apu = new APU();

        this.memory = new WebAssembly.Memory({initial: 1, maximum: 1});
        this.data = new DataView(this.memory.buffer);

        this.framebuffer = new Framebuffer(this.memory.buffer);

        this.reset();

        this.paused = false;
    }

    setMouse (x, y, buttons) {
        this.data.setUint8(constants.ADDR_MOUSE_X, x);
        this.data.setUint8(constants.ADDR_MOUSE_Y, y);
        this.data.setUint8(constants.ADDR_MOUSE_BUTTONS, buttons);
    }

    setGamepad (idx, buttons) {
        this.data.setUint8(constants.ADDR_GAMEPAD1 + idx, buttons);
    }

    getGamepad (idx) {
        return this.data.getUint8(constants.ADDR_GAMEPAD1 + idx);
    }

    maskGamepad (idx, mask, down) {
        const addr = constants.ADDR_GAMEPAD1 + idx;
        let buttons = this.data.getUint8(addr);
        if (down) {
            // if (mask & constants.BUTTON_LEFT) {
            //     buttons &= ~constants.BUTTON_RIGHT;
            // }
            // if (mask & constants.BUTTON_RIGHT) {
            //     buttons &= ~constants.BUTTON_LEFT;
            // }
            // if (mask & constants.BUTTON_DOWN) {
            //     buttons &= ~constants.BUTTON_UP;
            // }
            // if (mask & constants.BUTTON_UP) {
            //     buttons &= ~constants.BUTTON_DOWN;
            // }
            buttons |= mask;
        } else {
            buttons &= ~mask;
        }
        this.data.setUint8(addr, buttons);
    }

    unlockAudio () {
        const ctx = this.apu.ctx;
        if (ctx.state == "suspended") {
            ctx.resume();
        }
    }

    reset (zeroMemory) {
        // Initialize default color table and palette
        const mem8 = new Uint8Array(this.memory.buffer);
        if (zeroMemory) {
            mem8.fill(0);
        }
        mem8.set(constants.COLORS, constants.ADDR_PALETTE);
        this.data.setUint16(constants.ADDR_DRAW_COLORS, 0x1203, true);
    }

    async boot (wasmBuffer) {
        const module = await WebAssembly.instantiate(wasmBuffer, {
            env: {
                memory: this.memory,

                drawRect: this.drawRect.bind(this),
                drawText: this.drawText.bind(this),
                blit: this.blit.bind(this),
                blitSub: this.blitSub.bind(this),

                tone: this.apu.tone.bind(this.apu),

                printf: (fmt, ptr) => {
                    if (websocket == null || websocket.readyState != 1) {
                        return 0;
                    }
                    var output = "";
                    let ch;
                    while (ch = this.data.getUint8(fmt++)) {
                        if (ch == 37) {
                            switch (ch = this.data.getUint8(fmt++)) {
                            case 37: // %
                                output += "%";
                                break;
                            case 99: // c
                                output += String.fromCharCode(this.data.getInt32(ptr, true));
                                ptr += 4;
                                break;
                            case 115: // s
                                throw new Error("TODO(2021-07-16): Implement printf %s");
                                break;
                            case 100: // d
                            case 120: // x
                                output += this.data.getInt32(ptr, true).toString(ch == 100 ? 10 : 16);
                                ptr += 4;
                                break;
                            }
                        } else {
                            output += String.fromCharCode(ch);
                        }
                    }
                    const length = output.length;
                    if (length > 0) {
                        console.log(output);
                        websocket.send(output);
                    }
                    return length;
                },

                memset: (destPtr, fillByte, length) => {
                    const dest = new Uint8Array(this.memory.buffer, destPtr, length);
                    dest.fill(fillByte);
                    return destPtr;
                },

                memcpy: (destPtr, srcPtr, length) => {
                    const dest = new Uint8Array(this.memory.buffer, destPtr);
                    const src = new Uint8Array(this.memory.buffer, srcPtr, length);
                    dest.set(src);
                    return destPtr;
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
        this.framebuffer.drawRect(x, y, width, height);
    }

    drawText (textPtr, x, y) {
        const text = new Uint8Array(this.memory.buffer, textPtr);
        this.framebuffer.drawText(text, x, y);
    }

    blit (spritePtr, x, y, width, height, flags) {
        this.blitSub(spritePtr, x, y, width, height, 0, 0, width, flags);
    }

    blitSub (spritePtr, x, y, width, height, srcX, srcY, stride, flags) {
        const sprite = new Uint8Array(this.memory.buffer, spritePtr);

        const flipX = (flags & 8);
        const flipY = (flags & 16);
        const rotate = (flags & 32);
        const bpp2 = (flags & 2);

        this.framebuffer.blit(sprite, x, y, width, height, srcX, srcY, stride, bpp2, flipX, flipY, rotate);
    }

    update () {
        if (this.paused) {
            return;
        }

        this.framebuffer.clear();
        if (this.wasm.exports.update != null) {
            this.wasm.exports.update();
        }

        this.composite();
    }

    composite () {
        const palette = new Uint8Array(this.memory.buffer, constants.ADDR_PALETTE, 3*4);
        this.compositor.composite(palette, this.framebuffer);
    }
}
