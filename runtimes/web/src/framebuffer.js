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

    drawSprite1BPP (sprite, colors, x, y, flipX, flipY) {
        // TODO(2021-07-07): Optimize
        for (let v = 0; v < 8; ++v) {
            for (let h = 0; h < 8; ++h) {
                const colorIdx = (sprite[v] >> (7 - h)) & 0x1;
                const color = (colors >> (4*colorIdx)) & 0x0f;
                if (color != 0) {
                    const dstX = x + (flipX ? 7 - h : h);
                    const dstY = y + (flipY ? 7 - v : v);
                    this.set(color, dstX, dstY);
                }
            }
        }
    }

    drawSprite2BPP (sprite, colors, x, y, flipX, flipY) {
        // TODO(2021-07-07): Optimize
        for (let v = 0; v < 8; ++v) {
            for (let h = 0; h < 8; ++h) {
                const ch1 = ((sprite[v] >> (7 - h)) & 0x1);
                const ch2 = ((sprite[v + 8] >> (7 - h)) & 0x1);
                const colorIdx = (ch2 << 1) | ch1;
                const color = (colors >> (4*colorIdx)) & 0x0f;
                if (color != 0) {
                    const dstX = x + (flipX ? 7 - h : h);
                    const dstY = y + (flipY ? 7 - v : v);
                    this.set(color, dstX, dstY);
                }
            }
        }
    }

    drawSprite4BPP (sprite, x, y, flipX, flipY) {
    }
}
