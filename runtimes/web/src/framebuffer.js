export class Framebuffer {
    constructor (buffer, ptr, width, height) {
        this.bytes = new Uint8Array(buffer, ptr, width*height >> 1);
        this.stride = width;
    }

    clear () {
        this.bytes.fill(0);
    }

    unpack (dst) {
        for (let ii = 0, d = 0, ll = this.bytes.length; ii < ll; ++ii) {
            const pair = this.bytes[ii];
            dst[d++] = (pair >> 4);
            dst[d++] = pair & 0x0f;
        }
    }

    set (color, x, y) {
        // TODO(2021-07-09): Map lower bits to left to match sprite packing
        const idx = (this.stride*y + x) >> 1;
        const pair = this.bytes[idx];

        if (x & 1) {
            this.bytes[idx] = (pair & 0xf0) | (color & 0x0f);
        } else {
            this.bytes[idx] = (color << 4) | (pair & 0x0f);
        }
    }

    drawRect (color, x, y, width, height) {
        // TODO(2021-07-07): Optimize
        for (let yy = y; yy < y+height; ++yy) {
            for (let xx = x; xx < x+width; ++xx) {
                this.set(color, xx, yy);
            }
        }
    }

    blit (sprite, colors, x, y, width, height, stride, bpp, flipX, flipY) {
        // TODO(2021-07-07): Optimize

        const pixelsPerByte = 8 >> (bpp >> 1);
        const bytesPerRow = width / pixelsPerByte;
        const mask = (1 << bpp) - 1;
        const strideInBytes = stride/pixelsPerByte;

        for (let row = 0; row < height; ++row) {
            let col = 0;
            // For each byte in this row
            for (let b = 0; b < bytesPerRow; ++b) {
                let byte = sprite[row*strideInBytes + b];
                // Process each pixel in this byte
                for (let p = 0; p < pixelsPerByte; ++p) {
                    const colorIdx = byte >> (8 - bpp*(1+p)) & mask;
                    const color = (bpp == 4)
                        ? colorIdx
                        : (colors >> (4*colorIdx)) & 0x0f;
                    if (color != 0) {
                        const dstX = x + (flipX ? width - col : col);
                        const dstY = y + (flipY ? height - row : row);
                        this.set(color, dstX, dstY);
                    }
                    ++col;
                }
            }
        }
    }
}
