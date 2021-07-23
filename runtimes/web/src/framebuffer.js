function readPixel (sprite, x, y, bpp, stride) {
    switch (bpp) {
    case 1:
        var byte = sprite[(y*stride + x) >> 3];
        var shift = 7 - (x & 0x07);
        return (byte >> shift) & 0b1;
    case 2:
        var byte = sprite[(y*stride + x) >> 2];
        var shift = 6 - ((x & 0x03) << 1);
        return (byte >> shift) & 0b11;
    case 4:
        var byte = sprite[(y*stride + x) >> 1];
        return (x & 1) ? byte & 0b1111 : byte >> 4;
    }
    return 0;
}

export class Framebuffer {
    constructor (buffer, ptr, width, height) {
        this.bytes = new Uint8Array(buffer, ptr, width*height);
        this.stride = width;
        this.height = height;
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
        // TODO(2021-07-21): Clipping
        for (let yy = y; yy < y+height; ++yy) {
            for (let xx = x; xx < x+width; ++xx) {
                this.set(foreground, color, xx, yy);
            }
        }
    }

    blit (foreground, sprite, colors, dstX, dstY, width, height, srcX, srcY, srcStride, bpp, flipX, flipY, rotate) {
        const clipXMin = Math.max(0, dstX) - dstX;
        const clipYMin = Math.max(0, dstY) - dstY;
        const clipXMax = Math.min(width, this.stride - dstX);
        const clipYMax = Math.min(height, this.height - dstY);

        if (rotate) {
            flipX = !flipX;
        }

        for (let row = clipYMin; row < clipYMax; ++row) {
            for (let col = clipXMin; col < clipXMax; ++col) {
                let sx, sy;
                if (rotate) {
                    sx = row;
                    sy = col;
                } else {
                    sx = col;
                    sy = row;
                }
                if (flipX) {
                    sx = clipXMax - sx - 1;
                }
                if (flipY) {
                    sy = clipYMax - sy - 1;
                }

                const colorIdx = readPixel(sprite, srcX+sx, srcY+sy, bpp, srcStride);
                const color = (bpp == 4)
                    ? colorIdx
                    : (colors >> (colorIdx << 2)) & 0x0f;
                if (color != 0) {
                    this.set(foreground, color, dstX + col, dstY + row);
                }
            }
        }
    }
}
