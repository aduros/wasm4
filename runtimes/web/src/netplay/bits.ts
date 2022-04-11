/** Reads a stream of individual bits from a byte buffer. */
export class BitReader {
    constructor (private buffer: Uint8Array, public position = 0) {
    }

    readBit (): boolean {
        const value = !!(this.buffer[(this.position / 8) >>> 0] & (1 << (this.position & 7)));
        ++this.position;
        return value;
    }

    readBits (size: number): number {
        let value = 0;
        for (let ii = 0; ii < size; ++ii) {
            value |= +this.readBit() << ii;
        }
        return value;
    }
}

/** Writes a stream of individual bits to a byte buffer. */
export class BitWriter {
    constructor (private buffer: Uint8Array, public position = 0) {
    }

    write1 () {
        this.buffer[(this.position / 8) >>> 0] |= 1 << (this.position & 7);
        ++this.position;
    }

    write0 () {
        this.buffer[(this.position / 8) >>> 0] &= ~(1 << (this.position & 7));
        ++this.position;
    }

    writeBits (value: number, size: number) {
        for (let ii = 0; ii < size; ++ii) {
            if (value & (1 << ii)) {
                this.write1();
            } else {
                this.write0();
            }
        }
    }
}
