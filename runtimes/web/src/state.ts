import * as constants from "./constants";
import { Runtime } from "./runtime";

export class State {
    memory: ArrayBuffer;
    diskBuffer: ArrayBuffer;
    diskSize: number;
    // TODO(2022-03-17): APU state

    constructor () {
        this.memory = new ArrayBuffer(1 << 16);
        this.diskBuffer = new ArrayBuffer(constants.STORAGE_SIZE);
        this.diskSize = 0;
    }

    read (runtime: Runtime) {
        new Uint8Array(this.memory).set(new Uint8Array(runtime.memory.buffer));
        new Uint8Array(this.diskBuffer).set(new Uint8Array(runtime.diskBuffer));
        this.diskSize = runtime.diskSize;
    }

    write (runtime: Runtime) {
        new Uint8Array(runtime.memory.buffer).set(new Uint8Array(this.memory));
        new Uint8Array(runtime.diskBuffer).set(new Uint8Array(this.diskBuffer));
        runtime.diskSize = this.diskSize;
    }
}
