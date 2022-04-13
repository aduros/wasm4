import * as constants from "./constants";
import { Runtime } from "./runtime";

export class State {
    memory: ArrayBuffer;

    diskSize: number;
    diskBuffer: ArrayBuffer;

    // TODO(2022-03-17): APU state

    constructor () {
        this.memory = new ArrayBuffer(1 << 16);
        this.diskBuffer = new ArrayBuffer(constants.STORAGE_SIZE);
        this.diskSize = 0;
    }

    read (runtime: Runtime) {
        new Uint8Array(this.memory).set(new Uint8Array(runtime.memory.buffer));

        this.diskSize = runtime.diskSize;
        new Uint8Array(this.diskBuffer).set(new Uint8Array(runtime.diskBuffer, 0, runtime.diskSize));
    }

    write (runtime: Runtime) {
        new Uint8Array(runtime.memory.buffer).set(new Uint8Array(this.memory));

        runtime.diskSize = this.diskSize;
        new Uint8Array(runtime.diskBuffer).set(new Uint8Array(this.diskBuffer, 0, this.diskSize));
    }

    toBytes (dest?: Uint8Array): Uint8Array {
        if (!dest) {
            dest = new Uint8Array((1<<16) + 4 + this.diskSize);
        }

        dest.set(new Uint8Array(this.memory), 0);

        const dataView = new DataView(dest.buffer, dest.byteOffset, dest.byteLength);
        dataView.setUint32(1<<16, this.diskSize);

        dest.set(new Uint8Array(this.diskBuffer, 0, this.diskSize), (1<<16) + 4);

        return dest;
    }

    fromBytes (src: Uint8Array) {
        new Uint8Array(this.memory).set(src.subarray(0, 1<<16));

        const dataView = new DataView(src.buffer, src.byteOffset, src.byteLength);
        this.diskSize = dataView.getUint32(1<<16);

        const offset = (1<<16) + 4;
        new Uint8Array(this.diskBuffer).set(src.subarray(offset, offset + this.diskSize));
    }
}
