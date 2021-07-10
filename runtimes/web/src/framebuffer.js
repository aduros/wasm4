export class Framebuffer {
    constructor (buffer, ptr, width, height) {
        this.bytes = new Uint8Array(buffer, ptr, width*height);
        this.stride = width;
    }

    clearForeground () {
        // TODO(2021-07-10): Optimize by operating on 32 or 64 bit numbers instead of per individual
        // byte?
        const bytes = this.bytes;
        for (let ii = 0, ll = bytes.length; ii < ll; ++ii) {
            bytes[ii] &= 0xf0;
        }
    }

    set (foreground, color, x, y) {
        const idx = this.stride*y + x;
        if (foreground) {
            this.bytes[idx] = (this.bytes[idx] & 0xf0) | color;
        } else {
            this.bytes[idx] = (this.bytes[idx] & 0x0f) | (color << 4)
        }
    }

    drawRect (foreground, color, x, y, width, height) {
        // TODO(2021-07-07): Optimize
        for (let yy = y; yy < y+height; ++yy) {
            for (let xx = x; xx < x+width; ++xx) {
                this.set(foreground, color, xx, yy);
            }
        }
    }

    blit (foreground, sprite, colors, x, y, width, height, stride, bpp, flipX, flipY) {
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
                        this.set(foreground, color, dstX, dstY);
                    }
                    ++col;
                }
            }
        }
    }
}
