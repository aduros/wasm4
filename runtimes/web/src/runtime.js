import * as constants from "./constants";
import * as z85 from "./z85";
import { APU } from "./apu";
import { Framebuffer } from "./framebuffer";
import { WebGLCompositor, Canvas2DCompositor } from "./compositor";
import { websocket } from "./devkit";

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
        this.data.setInt16(constants.ADDR_MOUSE_X, x, true);
        this.data.setInt16(constants.ADDR_MOUSE_Y, y, true);
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
        const mem32 = new Uint32Array(this.memory.buffer);
        if (zeroMemory) {
            mem32.fill(0);
        }
        mem32.set(constants.COLORS, constants.ADDR_PALETTE >> 2);
        this.data.setUint16(constants.ADDR_DRAW_COLORS, 0x1203, true);

        // Initialize the mouse off screen
        this.data.setInt16(constants.ADDR_MOUSE_X, 0x7fff, true);
        this.data.setInt16(constants.ADDR_MOUSE_Y, 0x7fff, true);
    }

    async load (wasmBuffer) {
        const module = await WebAssembly.instantiate(wasmBuffer, {
            env: {
                memory: this.memory,

                rect: this.framebuffer.drawRect.bind(this.framebuffer),
                oval: this.framebuffer.drawOval.bind(this.framebuffer),
                line: this.framebuffer.drawLine.bind(this.framebuffer),

                text: this.text.bind(this),
                textUtf8: this.textUtf8.bind(this),
                textUtf16: this.textUtf16.bind(this),

                blit: this.blit.bind(this),
                blitSub: this.blitSub.bind(this),

                tone: this.apu.tone.bind(this.apu),

                storageRead: this.storageRead.bind(this),
                storageWrite: this.storageWrite.bind(this),

                // print: this.print.bind(this),
                printUtf8: this.printUtf8.bind(this),
                printUtf16: this.printUtf16.bind(this),

                printf: (fmt, ptr) => {
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
                            case 100: // d
                            case 120: // x
                                output += this.data.getInt32(ptr, true).toString(ch == 100 ? 10 : 16);
                                ptr += 4;
                                break;
                            case 115: // s
                                throw new Error("TODO(2021-07-16): Implement printf %s");
                                break;
                            case 102: // f
                                throw new Error("TODO(2021-07-16): Implement printf %f");
                                break;
                            }
                        } else {
                            output += String.fromCharCode(ch);
                        }
                    }
                    this.print(output);
                    return output.length;
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
    }

    text (textPtr, x, y) {
        const text = new Uint8Array(this.memory.buffer, textPtr);
        this.framebuffer.drawText(text, x, y);
    }

    textUtf8 (textPtr, byteLength, x, y) {
        const text = new Uint8Array(this.memory.buffer, textPtr, byteLength);
        this.framebuffer.drawTextLength(text, x, y);
    }

    textUtf16 (textPtr, byteLength, x, y) {
        const text = new Uint16Array(this.memory.buffer, textPtr, byteLength >> 1);
        this.framebuffer.drawTextLength(text, x, y);
    }

    blit (spritePtr, x, y, width, height, flags) {
        this.blitSub(spritePtr, x, y, width, height, 0, 0, width, flags);
    }

    blitSub (spritePtr, x, y, width, height, srcX, srcY, stride, flags) {
        const sprite = new Uint8Array(this.memory.buffer, spritePtr);
        const bpp2 = (flags & 1);
        const flipX = (flags & 2);
        const flipY = (flags & 4);
        const rotate = (flags & 8);

        this.framebuffer.blit(sprite, x, y, width, height, srcX, srcY, stride, bpp2, flipX, flipY, rotate);
    }

    storageRead (destPtr, size) {
        let str;
        try {
            str = localStorage.getItem("disk");
        } catch (error) {
            if (constants.DEBUG) {
                console.error(error);
            }
        }
        if (str == null) {
            return 0;
        }

        const dest = new Uint8Array(this.memory.buffer, destPtr, Math.min(size, constants.STORAGE_SIZE));
        const bytesRead = z85.decode(str, dest);
        return bytesRead;
    }

    storageWrite (srcPtr, size) {
        const bytesWritten = Math.min(size, constants.STORAGE_SIZE);
        const src = new Uint8Array(this.memory.buffer, srcPtr, bytesWritten);
        const str = z85.encode(src);
        try {
            localStorage.setItem("disk", str);
        } catch (error) {
            if (constants.DEBUG) {
                console.error(error);
            }
            return 0;
        }
        return bytesWritten;
    }

    print (str) {
        if (str.length > 0) {
            console.log(str);
            if (websocket != null && websocket.readyState == 1) {
                websocket.send(str);
            }
        }
    }

    printUtf8 (strUtf8Ptr, byteLength) {
        const strUtf8 = new Uint8Array(this.memory.buffer, strUtf8Ptr, byteLength);
        const str = new TextDecoder().decode(strUtf8);
        this.print(str);
    }

    printUtf16 (strUtf16Ptr, byteLength) {
        const strUtf16 = new Uint8Array(this.memory.buffer, strUtf16Ptr, byteLength);
        const str = new TextDecoder("utf-16").decode(strUtf16);
        this.print(str);
    }

    start () {
        if (this.wasm.exports.start != null) {
            this.wasm.exports.start();
        }
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
        const palette = new Uint32Array(this.memory.buffer, constants.ADDR_PALETTE, 4*4);

        this.compositor.composite(palette, this.framebuffer);
    }
}
