/** A safe maximum size for WebRTC data channel messages. */
const CAPACITY = 16384;

/** Receives incoming binary chunks and glues them back together. */
export class ChunkReader {
    private readonly chunks: Uint8Array[] = [];
    private size: number = 0;

    constructor (channel: RTCDataChannel) {
        channel.addEventListener("message", event => {
            if (event.data instanceof ArrayBuffer) {
                const chunk = new Uint8Array(event.data);
                this.size += chunk.byteLength;
                this.chunks.push(chunk);
                console.log("CHUNK received", chunk.byteLength);
            }
        });
    }

    read (): Uint8Array {
        const data = new Uint8Array(this.size);
        let destPos = 0;
        for (const chunk of this.chunks) {
            data.set(chunk, destPos);
            destPos += chunk.byteLength;
        }

        // Clear the local buffer
        this.chunks.length = 0;
        this.size = 0;

        return data;
    }
}

/** Splits outgoing binary data into chunks. */
export class ChunkWriter {
    private buffer: Uint8Array | undefined;
    private size: number = 0;

    constructor (private channel: RTCDataChannel) {
    }

    write (src: Uint8Array) {
        if (!this.buffer) {
            this.buffer = new Uint8Array(CAPACITY);
        }

        let destPos = this.size;
        let srcPos = 0;

        while (srcPos < src.length) {
            const slice = src.subarray(srcPos, srcPos + CAPACITY - destPos);
            this.buffer.set(slice, destPos);

            srcPos += slice.length;
            destPos += slice.length;

            if (destPos >= CAPACITY) {
                destPos -= CAPACITY;

                console.log("CHUNK sending", this.buffer.length);
                this.channel.send(this.buffer);
            }
        }

        this.size = destPos;
    }

    flush () {
        if (this.buffer && this.size > 0) {
            console.log("CHUNK flushing", this.size);
            this.channel.send(this.buffer.subarray(0, this.size));
        }

        this.buffer = undefined;
    }
}
