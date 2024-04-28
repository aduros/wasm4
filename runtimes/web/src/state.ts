import * as constants from "./constants";
import { Runtime } from "./runtime";

export class State {
    memory: ArrayBuffer;
    globals: {[name: string]: string};

    diskSize: number;
    diskBuffer: ArrayBuffer;

    // TODO(2022-03-17): APU state

    constructor () {
        this.memory = new ArrayBuffer(1 << 16);
        this.globals = {};
        this.diskBuffer = new ArrayBuffer(constants.STORAGE_SIZE);
        this.diskSize = 0;
    }

    read (runtime: Runtime) {
        new Uint8Array(this.memory).set(new Uint8Array(runtime.memory.buffer));

        this.globals = {};
        for (const exName in runtime.wasm!.exports) {
            const exInst = runtime.wasm!.exports[exName]
            if (exInst instanceof WebAssembly.Global) {
                this.globals[exName] = exInst.value.toString(); // believe it or not, `toString()` seems to be safe
            }
        }

        this.diskSize = runtime.diskSize;
        new Uint8Array(this.diskBuffer).set(new Uint8Array(runtime.diskBuffer, 0, runtime.diskSize));
    }

    write (runtime: Runtime) {
        new Uint8Array(runtime.memory.buffer).set(new Uint8Array(this.memory));

        for (const exName in runtime.wasm!.exports) {
            const exInst = runtime.wasm!.exports[exName]
            if (exInst instanceof WebAssembly.Global && exName in this.globals) {
                exInst.value = this.globals[exName];
            }
        }

        runtime.diskSize = this.diskSize;
        new Uint8Array(runtime.diskBuffer).set(new Uint8Array(this.diskBuffer, 0, this.diskSize));
    }

    toBytes (): Uint8Array {
        // Serialize globals
        const globalBytes = new TextEncoder().encode(JSON.stringify(this.globals));

        // Perpare output buffer
        const dest = new Uint8Array((1<<16) + 8 + globalBytes.byteLength + this.diskSize);
        const dataView = new DataView(dest.buffer, dest.byteOffset, dest.byteLength);

        // Write memory
        dest.set(new Uint8Array(this.memory), 0);
        let offset = 1<<16;

        // Write globals
        dataView.setUint32(offset, globalBytes.byteLength);
        dest.set(globalBytes, offset + 4);
        offset += 4 + globalBytes.byteLength;

        // Write disk
        dataView.setUint32(offset, this.diskSize);
        dest.set(new Uint8Array(this.diskBuffer, 0, this.diskSize), offset + 4);

        return dest;
    }

    fromBytes (src: Uint8Array) {
        const dataView = new DataView(src.buffer, src.byteOffset, src.byteLength);

        // Read memory
        new Uint8Array(this.memory).set(src.subarray(0, 1<<16));
        let offset = 1<<16;

        // Read globals
        const globalBytesSize = dataView.getUint32(offset);
        const globalBytes = src.slice(offset + 4, offset + 4 + globalBytesSize)
        this.globals = JSON.parse(new TextDecoder().decode(globalBytes));
        offset += 4 + globalBytesSize;

        // Read disk
        this.diskSize = dataView.getUint32(offset);
        new Uint8Array(this.diskBuffer).set(src.subarray(offset + 4, offset + 4 + this.diskSize));
    }
}
