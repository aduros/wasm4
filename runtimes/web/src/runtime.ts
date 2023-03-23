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
    wasmBuffer: Uint8Array | null = null;
    wasmBufferByteLen: number;
    wasm: WebAssembly.Instance | null = null;
    warnedFileSize = false;

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

    setNetplay (localPlayerIdx: number) {
        this.data.setUint8(constants.ADDR_NETPLAY, 0b100 | (localPlayerIdx & 0b11));
    }

    getSystemFlag (mask: number) {
        return this.data.getUint8(constants.ADDR_SYSTEM_FLAGS) & mask;
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

    async load (wasmBuffer: Uint8Array, enforceSizeLimit = true) {
        const limit = 1 << 16;
        this.wasmBuffer = wasmBuffer;
        this.wasmBufferByteLen = wasmBuffer.byteLength;
        this.wasm = null;

        if (wasmBuffer.byteLength > limit) {
            if (import.meta.env.DEV) {
                if (!this.warnedFileSize) {
                    this.warnedFileSize = true;
                    this.print(`Warning: Cart is larger than ${limit} bytes. Ensure the release build of your cart is small enough to be bundled.`);
                }
            } else if (enforceSizeLimit) {
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

        await this.bluescreenOnError(async () => {
            const module = await WebAssembly.instantiate(wasmBuffer, { env });
            this.wasm = module.instance;

            if (typeof this.wasm.exports["start"] !== 'function') {
                throw new Wasm4Error('The cartridge does\nnot export a\n"start" function.');
            }

            if (typeof this.wasm.exports["update"] !== 'function') {
                throw new Wasm4Error('The cartridge does\nnot export an\n"update" function.');
            }

            // Call the WASI _start/_initialize function (different from WASM-4's start callback!)
            if (typeof this.wasm.exports._start === 'function') {
                this.wasm.exports._start();
            }
            if (typeof this.wasm.exports._initialize === 'function') {
                this.wasm.exports._initialize();
            }
        });
    }

    async bluescreenOnError (fn: Function) {
        try {
            await fn();
        } catch (err) {
            if (err instanceof Error) {
                const errorExplanation = errorToBlueScreenText(err);
                this.blueScreen(errorExplanation);
                this.printToServer(err.stack ?? '');
            }

            throw err;
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

    print (str: string ) {
        console.log(str);
        this.printToServer(str);
    }

    printToServer (str: string) {
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
        let output = "";
        let ch;
        while ((ch = this.data.getUint8(fmtPtr++))) {
            if (ch == 37) {
                switch (ch = this.data.getUint8(fmtPtr++)) {
                case 37: // %
                    output += "%";
                    break;
                case 99: // c
                    output += String.fromCharCode(this.data.getInt32(argPtr, true));
                    argPtr += 4;
                    break;
                case 100: // d
                case 120: // x
                    output += this.data.getInt32(argPtr, true).toString(ch == 100 ? 10 : 16);
                    argPtr += 4;
                    break;
                case 115: // s
                    output += this.getCString(this.data.getUint32(argPtr, true));
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
        this.bluescreenOnError(this.wasm!.exports["start"] as Function);
    }

    update () {
        if (this.pauseState != 0) {
            return;
        }

        if (!this.getSystemFlag(constants.SYSTEM_PRESERVE_FRAMEBUFFER)) {
            this.framebuffer.clear();
        }

        this.bluescreenOnError(this.wasm!.exports["update"] as Function);
    }

    blueScreen (text: string) {
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
        this.framebuffer.drawText(toCharArr(text), messageX, messageY);
        this.composite();
    }

    composite () {
        const palette = new Uint32Array(this.memory.buffer, constants.ADDR_PALETTE, 4);

        this.compositor.composite(palette, this.framebuffer);
    }
}

function errorToBlueScreenText(err: Error) {
    // hand written messages for specific errors
    if (err instanceof WebAssembly.RuntimeError) {
        let message;
        if (err.message.match(/unreachable/)) {
            message = "The cartridge has\nreached a code \nsegment marked as\nunreachable.";
        } else if (err.message.match(/out of bounds/)) {
            message = "The cartridge has\nattempted a memory\naccess that is\nout of bounds.";
        }
        return message + "\n\n\n\n\nHit R to reboot.";
    } else if (err instanceof WebAssembly.LinkError) {
        return "The cartridge has\ntried to import\na missing function.\n\n\n\nSee console for\nmore details.";
    } else if (err instanceof WebAssembly.CompileError) {
        return "The cartridge is\ncorrupted.\n\n\n\nSee console for\nmore details.";
    } else if (err instanceof Wasm4Error) {
        return err.wasm4Message;
    }
    return "Unknown error.\n\n\n\nSee console for\nmore details.";
}

class Wasm4Error extends Error {
    wasm4Message: string;
    constructor(w4Message: string) {
        super(w4Message.replace('\n', ' '));
        this.name = "Wasm4Error";
        this.wasm4Message = w4Message;
    }
}
