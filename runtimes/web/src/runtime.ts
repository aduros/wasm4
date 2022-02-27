import * as constants from "./constants";
import * as z85 from "./z85";
import { APU } from "./apu";
import { Framebuffer } from "./framebuffer";
import { WebGLCompositor } from "./compositor";
import * as devkit from "./devkit";

export class Runtime {
    canvas: HTMLCanvasElement;
    memory: WebAssembly.Memory;
    apu: any;
    compositor: WebGLCompositor;
    data: DataView;
    framebuffer: Framebuffer;
    pauseState: number;
    wasmBufferByteLen: number;
    wasm?: WebAssembly.Instance;
    warnedFileSize: boolean = false;

    diskName: string;
    diskBuffer: ArrayBuffer;
    diskSize: number;

    constructor (diskName: string) {
        const canvas = document.createElement("canvas");
        canvas.width = constants.WIDTH;
        canvas.height = constants.HEIGHT;
        this.canvas = canvas;

        const gl = canvas.getContext("webgl", {
            alpha: false,
            depth: false,
            antialias: false,
        });

        if(!gl) {
            throw new Error('web-runtime: could not create wegl context')  // TODO(2021-08-01): Fallback to Canvas2DCompositor
        }

        this.compositor = new WebGLCompositor(gl);
        
        this.apu = new APU();

        this.diskName = diskName;
        this.diskBuffer = new ArrayBuffer(constants.STORAGE_SIZE);

        // Try to load from localStorage
        let str;
        try {
            str = localStorage.getItem(diskName);
        } catch (error) {
            if (constants.DEBUG) {
                console.error("Error reading disk", error);
            }
        }
        this.diskSize = (str != null)
            ? z85.decode(str, new Uint8Array(this.diskBuffer))
            : 0;

        this.memory = new WebAssembly.Memory({initial: 1, maximum: 1});
        this.data = new DataView(this.memory.buffer);

        this.framebuffer = new Framebuffer(this.memory.buffer);

        this.reset();

        this.pauseState = 0;
        this.wasmBufferByteLen = 0;
    }

    async init () {
        await this.apu.init();
    }

    setMouse (x: number, y: number, buttons: number) {
        this.data.setInt16(constants.ADDR_MOUSE_X, x, true);
        this.data.setInt16(constants.ADDR_MOUSE_Y, y, true);
        this.data.setUint8(constants.ADDR_MOUSE_BUTTONS, buttons);
    }

    setGamepad (idx: number, buttons: number) {
        this.data.setUint8(constants.ADDR_GAMEPAD1 + idx, buttons);
    }

    getGamepad (idx: number) {
        return this.data.getUint8(constants.ADDR_GAMEPAD1 + idx);
    }

    getSystemFlag (mask: number) {
        return this.data.getUint8(constants.ADDR_SYSTEM_FLAGS) & mask;
    }

    maskGamepad (idx: number, mask: number, down: boolean) {
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
        this.apu.unlockAudio();
    }

    pauseAudio() {
        this.apu.pauseAudio();
    }

    reset (zeroMemory?: boolean) {
        // Initialize default color table and palette
        const mem32 = new Uint32Array(this.memory.buffer);
        if (zeroMemory) {
            mem32.fill(0);
        }
        this.pauseState &= ~constants.PAUSE_CRASHED;
        mem32.set(constants.COLORS, constants.ADDR_PALETTE >> 2);
        this.data.setUint16(constants.ADDR_DRAW_COLORS, 0x1203, true);

        // Initialize the mouse off screen
        this.data.setInt16(constants.ADDR_MOUSE_X, 0x7fff, true);
        this.data.setInt16(constants.ADDR_MOUSE_Y, 0x7fff, true);
    }

    async load (wasmBuffer:  ArrayBuffer | Uint8Array) {
        const limit = 0xffff;
        this.wasmBufferByteLen = wasmBuffer.byteLength;

        if (wasmBuffer.byteLength > limit) {
            if (DEVELOPER_BUILD) {
                if (!this.warnedFileSize) {
                    this.warnedFileSize = true;
                    this.print(`Warning: Cart is larger than ${limit} bytes. Ensure the release build of your cart is small enough to be bundled.`);
                }
            } else {
                throw new Error("Cart too big!");
            }
        }

        const env = {
            memory: this.memory,

            rect: this.framebuffer.drawRect.bind(this.framebuffer),
            oval: this.framebuffer.drawOval.bind(this.framebuffer),
            line: this.framebuffer.drawLine.bind(this.framebuffer),

            hline: this.framebuffer.drawHLine.bind(this.framebuffer),
            vline: this.framebuffer.drawVLine.bind(this.framebuffer),

            text: this.text.bind(this),
            textUtf8: this.textUtf8.bind(this),
            textUtf16: this.textUtf16.bind(this),

            blit: this.blit.bind(this),
            blitSub: this.blitSub.bind(this),

            tone: this.apu.tone.bind(this.apu),

            diskr: this.diskr.bind(this),
            diskw: this.diskw.bind(this),

            trace: this.trace.bind(this),
            traceUtf8: this.traceUtf8.bind(this),
            traceUtf16: this.traceUtf16.bind(this),
            tracef: this.tracef.bind(this),
        };

        await this.safeCall(async () => {
            const module = await WebAssembly.instantiate(wasmBuffer, { env });
            this.wasm = module.instance;

            // Call the WASI _start/_initialize function (different from WASM-4's start callback!)
            if (typeof this.wasm.exports._start === 'function') {
                this.wasm.exports._start();
            }
            if (typeof this.wasm.exports._initialize === 'function') {
                this.wasm.exports._initialize();
            }
        });
    }

    async safeCall (fn?: null | undefined | WebAssembly.ExportValue) {
        if (typeof fn === 'function') {
            try {
                await fn();
            } catch (err) {
                if (err instanceof WebAssembly.RuntimeError
                        || err instanceof WebAssembly.LinkError
                        || err instanceof WebAssembly.CompileError) {
                    this.blueScreen(err);
                } else {
                    // if we don't know what it is, throw it again
                    throw err;
                }
            }
        }
    }

    text (textPtr: number, x: number, y: number) {
        const text = new Uint8Array(this.memory.buffer, textPtr);
        this.framebuffer.drawText(text, x, y);
    }

    textUtf8 (textPtr: number, byteLength: number, x: number, y: number) {
        const text = new Uint8Array(this.memory.buffer, textPtr, byteLength);
        this.framebuffer.drawText(text, x, y);
    }

    textUtf16 (textPtr: number, byteLength: number, x: number, y: number) {
        const text = new Uint16Array(this.memory.buffer, textPtr, byteLength >> 1);
        this.framebuffer.drawText(text, x, y);
    }

    blit (spritePtr: number, x: number, y: number, width: number, height: number, flags: number) {
        this.blitSub(spritePtr, x, y, width, height, 0, 0, width, flags);
    }

    blitSub (spritePtr: number, x: number, y: number, width: number, height: number, srcX: number, srcY: number, stride: number, flags: number) {
        const sprite = new Uint8Array(this.memory.buffer, spritePtr);
        const bpp2 = (flags & 1);
        const flipX = (flags & 2);
        const flipY = (flags & 4);
        const rotate = (flags & 8);

        this.framebuffer.blit(sprite, x, y, width, height, srcX, srcY, stride, bpp2, flipX, flipY, rotate);
    }

    diskr (destPtr: number, size: number): number {
        const bytesRead = Math.min(size, this.diskSize);
        const src = new Uint8Array(this.diskBuffer, 0, bytesRead);
        const dest = new Uint8Array(this.memory.buffer, destPtr);

        dest.set(src);
        return bytesRead;
    }

    diskw (srcPtr: number, size: number): number {
        const bytesWritten = Math.min(size, constants.STORAGE_SIZE);
        const src = new Uint8Array(this.memory.buffer, srcPtr, bytesWritten);
        const dest = new Uint8Array(this.diskBuffer);

        // Try to save to localStorage
        const str = z85.encode(src);
        try {
            localStorage.setItem(this.diskName, str);
        } catch (error) {
            // TODO(2022-02-13): Show a warning to the user that storage is not persisted
            if (constants.DEBUG) {
                console.error("Error writing disk", error);
            }
        }

        dest.set(src);
        this.diskSize = bytesWritten;
        return bytesWritten;
    }

    getCString (ptr: number) {
        let str = "";
        for (;;) {
            const c = this.data.getUint8(ptr++);
            if (c == 0) {
                break;
            }
            str += String.fromCharCode(c);
        }
        return str;
    }

    print (str: string , error = false) {
        if (error) {
            console.error(str);
        } else {
            console.log(str);
        }
        if (devkit.websocket != null && devkit.websocket.readyState == 1) {
            devkit.websocket.send(str);
        }
    }

    trace (cstrPtr: number) {
        this.print(this.getCString(cstrPtr));
    }

    traceUtf8 (strUtf8Ptr: number, byteLength: number) {
        const strUtf8 = new Uint8Array(this.memory.buffer, strUtf8Ptr, byteLength);
        const str = new TextDecoder().decode(strUtf8);
        this.print(str);
    }

    traceUtf16 (strUtf16Ptr: number, byteLength: number) {
        const strUtf16 = new Uint8Array(this.memory.buffer, strUtf16Ptr, byteLength);
        const str = new TextDecoder("utf-16").decode(strUtf16);
        this.print(str);
    }

    tracef (fmtPtr: number, argPtr: number) {
        var output = "";
        let ch;
        while (ch = this.data.getUint8(fmtPtr++)) {
            if (ch == 37) {
                switch (ch = this.data.getUint8(fmtPtr++)) {
                case 37: // %
                    output += "%";
                    break;
                case 99: // c
                    output += String.fromCodePoint(this.data.getInt32(argPtr, true));
                    argPtr += 4;
                    break;
                case 100: // d
                case 120: // x
                    output += this.data.getInt32(argPtr, true).toString(ch == 100 ? 10 : 16);
                    argPtr += 4;
                    break;
                case 115: // s
                    let cstrPtr = this.data.getUint32(argPtr, true);
                    output += this.getCString(cstrPtr);
                    argPtr += 4;
                    break;
                case 102: // f
                    output += this.data.getFloat64(argPtr, true);
                    argPtr += 8;
                    break;
                }
            } else {
                output += String.fromCharCode(ch);
            }
        }
        this.print(output);
    }

    start () {
        this.safeCall(this.wasm!.exports.start);
    }

    update () {
        if (this.pauseState != 0) {
            return;
        }

        if (!this.getSystemFlag(constants.SYSTEM_PRESERVE_FRAMEBUFFER)) {
            this.framebuffer.clear();
        }

        this.safeCall(this.wasm!.exports.update);

        this.composite();
    }

    blueScreen(err: Error) {
        this.pauseState |= constants.PAUSE_CRASHED;

        const COLORS = [
            0x1111ee, // blue
            0x86c06c,
            0xaaaaaa, // grey
            0xffffff, // white
        ];

        const toCharArr = (s: string) => [...s].map(x => x.charCodeAt(0));

        const title = ` ${constants.CRASH_TITLE} `;
        const headerTitle = title;
        const headerWidth = (8 * title.length);
        const headerX = (160 - (8 * title.length)) / 2;
        const headerY = 20;
        const messageX = 9;
        const messageY = 60;

        const mem32 = new Uint32Array(this.memory.buffer);
        mem32.set(COLORS, constants.ADDR_PALETTE >> 2);
        this.data.setUint16(constants.ADDR_DRAW_COLORS, 0x1203, true);
        this.framebuffer.clear();
        this.framebuffer.drawHLine(headerX, headerY-1, headerWidth);
        this.data.setUint16(constants.ADDR_DRAW_COLORS, 0x1131, true);
        this.framebuffer.drawText(toCharArr(headerTitle), headerX, headerY);
        this.data.setUint16(constants.ADDR_DRAW_COLORS, 0x1203, true);
        const errorExplanation = errorToBlueScreenText(err);
        this.framebuffer.drawText(toCharArr(errorExplanation), messageX, messageY);
        this.composite();

        // to help with debugging
        this.print(err.stack ?? '', true);
    }

    composite () {
        const palette = new Uint32Array(this.memory.buffer, constants.ADDR_PALETTE, 4*4);

        this.compositor.composite(palette, this.framebuffer);
    }

    updateIdleState = () => {
        const lostFocus = !document.body.classList.contains('focus');

        if (lostFocus) {
            this.pauseAudio();
            this.pauseState |= constants.PAUSE_UNFOCUSED;
        } else {
            this.unlockAudio();
            this.pauseState &= ~constants.PAUSE_UNFOCUSED;
        }
    }
}

function errorToBlueScreenText(err: Error) {
    let message = `${err.name}:\n${err.message}`;

    // hand written messages for specific errors
    if (err instanceof WebAssembly.RuntimeError) {
        if (err.message.match(/unreachable/)) {
            message = "The cartridge has\nreached a code \nsegment marked as\nunreachable.";
        } else if (err.message.match(/out of bounds/)) {
            message = "The cartridge has\nattempted a memory\naccess that is\nout of bounds.";
        }
        message += "\n\n\n\n\nHit R to reboot.";
    } else if (err instanceof WebAssembly.LinkError) {
        message = "The cartridge has\ntried to import\na missing function.\n\n\n\nSee console for\nmore details.";
    } else if (err instanceof WebAssembly.CompileError) {
        message = "The cartridge is\ncorrupted.\n\n\n\nSee console for\nmore details.";
    }
    return message;
}
