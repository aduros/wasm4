import {
    FONT,
    WIDTH,
    HEIGHT,
    ADDR_FRAMEBUFFER,
    ADDR_DRAW_COLORS
} from "./constants";

export class Framebuffer {
    drawColors: Uint16Array;
    bytes: Uint8Array;

    constructor (memory: ArrayBuffer) {
        this.bytes = new Uint8Array(memory, ADDR_FRAMEBUFFER, WIDTH * HEIGHT >>> 2);
        this.drawColors = new Uint16Array(memory, ADDR_DRAW_COLORS, 1);
    }

    clear (): void {
        this.bytes.fill(0);
    }

    drawPoint (color: number, x: number, y: number) {
        const idx = (WIDTH * y + x) >>> 2;
        const shift = (x & 0x3) << 1;
        const mask = 0x3 << shift;
        this.bytes[idx] = (color << shift) | (this.bytes[idx] & ~mask);
    }

    drawPointUnclipped (color: number, x: number, y: number) {
        if (x >= 0 && x < WIDTH && y >= 0 && y < HEIGHT) {
            this.drawPoint(color, x, y);
        }
    }

    drawHLineFast(color: number, startX: number, y: number, endX: number) {
        const fillEnd = endX - (endX & 3);
        const fillStart = Math.min((startX + 3) & ~3, fillEnd);

        if (fillEnd - fillStart > 3) {
            for (let xx = startX; xx < fillStart; xx++) {
                this.drawPoint(color, xx, y);
            }

            const from = (WIDTH * y + fillStart) >>> 2;
            const to = (WIDTH * y + fillEnd) >>> 2;
            const fillColor = color * 0b01010101;

            this.bytes.fill(fillColor, from, to);
            startX = fillEnd;
        }

        for (let xx = startX; xx < endX; xx++) {
            this.drawPoint(color, xx, y);
        }
    }

    drawHLineUnclipped(color: number, startX: number, y: number, endX: number) {
        if (y >= 0 && y < HEIGHT) {
            if (startX < 0) {
                startX = 0;
            }
            if (endX > WIDTH) {
                endX = WIDTH;
            }
            if (startX < endX) {
                this.drawHLineFast(color, startX, y, endX);
            }
        }
    }

    drawHLine(x: number, y: number, len: number) {
        const dc0 = this.drawColors[0] & 0xf;
        if (dc0 == 0) {
            return;
        }

        const strokeColor = (dc0 - 1) & 0x3;
        this.drawHLineUnclipped(strokeColor, x, y, x + len);
    }

    drawVLine(x: number, y: number, len: number) {
        if (y + len <= 0 || x < 0 || x >= WIDTH) {
            return;
        }

        const dc0 = this.drawColors[0] & 0xf;
        if (dc0 == 0) {
            return;
        }

        const startY = Math.max(0, y);
        const endY = Math.min(HEIGHT, y + len);
        const strokeColor = (dc0 - 1) & 0x3;
        for (let yy = startY; yy < endY; yy++) {
            this.drawPoint(strokeColor, x, yy);
        }
    }

    drawRect(x: number, y: number, width: number, height: number) {
        const startX = Math.max(0, x);
        const startY = Math.max(0, y);
        const endXUnclamped = x + width;
        const endYUnclamped = y + height;
        const endX = Math.min(endXUnclamped, WIDTH);
        const endY = Math.min(endYUnclamped, HEIGHT);

        const drawColors = this.drawColors[0];
        const dc0 = drawColors & 0xf;
        const dc1 = (drawColors >>> 4) & 0xf;

        if (dc0 !== 0) {
            const fillColor = (dc0 - 1) & 0x3;
            for (let yy = startY; yy < endY; ++yy) {
                this.drawHLineFast(fillColor, startX, yy, endX);
            }
        }

        if (dc1 !== 0) {
            const strokeColor = (dc1 - 1) & 0x3;

            // Left edge
            if (x >= 0 && x < WIDTH) {
                for (let yy = startY; yy < endY; ++yy) {
                    this.drawPoint(strokeColor, x, yy);
                }
            }

            // Right edge
            if (endXUnclamped >= 0 && endXUnclamped <= WIDTH) {
                for (let yy = startY; yy < endY; ++yy) {
                    this.drawPoint(strokeColor, endXUnclamped - 1, yy);
                }
            }

            // Top edge
            if (y >= 0 && y < HEIGHT) {
                this.drawHLineFast(strokeColor, startX, y, endX);
            }

            // Bottom edge
            if (endYUnclamped >= 0 && endYUnclamped <= HEIGHT) {
                this.drawHLineFast(strokeColor, startX, endYUnclamped - 1, endX);
            }
        }
    }

    drawOval (x: number, y: number, width: number, height: number) {
        const drawColors = this.drawColors[0];
        const dc0 = drawColors & 0xf;
        const dc1 = (drawColors >>> 4) & 0xf;

        if (dc1 === 0xf) {
            return;
        }

        const strokeColor = (dc1 - 1) & 0x3;
        const fillColor = (dc0 - 1) & 0x3;

        const a = width >>> 1;
        const b = height >>> 1;

        if (a <= 0) return;
        if (b <= 0) return;

        const x0 = x + a, y0 = y + b;
        const aa2 = a * a * 2, bb2 = b * b * 2;

        {
            let x = a, y = 0;
            let dx = (1 - 2 * a) * b * b, dy = a * a;
            let sx = bb2 * a, sy = 0;
            let e = 0;

            while (sx >= sy) {
                this.drawPointUnclipped(strokeColor, x0 + x, y0 + y); /*   I. Quadrant */
                this.drawPointUnclipped(strokeColor, x0 + x, y0 - y); /*  II. Quadrant */
                this.drawPointUnclipped(strokeColor, x0 - x, y0 + y); /* III. Quadrant */
                this.drawPointUnclipped(strokeColor, x0 - x, y0 - y); /*  IV. Quadrant */

                if (dc0 !== 0) {
                    const start = x0 - x + 1;
                    const end = x0 + x;
                    this.drawHLineUnclipped(fillColor, start, y0 + y, end); /*   I and III. Quadrant */
                    this.drawHLineUnclipped(fillColor, start, y0 - y, end); /*  II and IV. Quadrant */
                }

                y++;
                sy += aa2;
                e += dy;
                dy += aa2;
                if (2 * e + dx > 0) {
                    x--;
                    sx -= bb2;
                    e += dx;
                    dx += bb2;
                }
            }
        }

        {
            let x = 0, y = b;
            let dx = b * b, dy = (1 - 2 * b) * a * a;
            let sx = 0, sy = aa2 * b;
            let e = 0;
            let ddx = 0;

            while (sy >= sx) {
                this.drawPointUnclipped(strokeColor, x0 + x, y0 + y); /*   I. Quadrant */
                this.drawPointUnclipped(strokeColor, x0 + x, y0 - y); /*  II. Quadrant */
                this.drawPointUnclipped(strokeColor, x0 - x, y0 + y); /* III. Quadrant */
                this.drawPointUnclipped(strokeColor, x0 - x, y0 - y); /*  IV. Quadrant */

                x++;
                sx += bb2;
                e += dx;
                dx += bb2;
                ddx++;
                if (2 * e + dy > 0) {
                    if (dc0 !== 0) {
                        const w = x - ddx - 1;
                        const start = x0 - w;
                        const end = x0 + w + 1;
                        this.drawHLineUnclipped(fillColor, start, y0 + y, end); /*   I and III. Quadrant */
                        this.drawHLineUnclipped(fillColor, start, y0 - y, end); /*  II and IV. Quadrant */
                    }

                    y--;
                    sy -= aa2;
                    e += dy;
                    dy += aa2;
                    ddx = 0;
                }
            }
        }
    }

    // From https://github.com/nesbox/TIC-80/blob/master/src/core/draw.c
    drawLine (x1: number, y1: number, x2: number, y2: number) {
        const drawColors = this.drawColors[0];
        const dc0 = drawColors & 0xf;
        if (dc0 === 0) {
            return;
        }
        const strokeColor = (dc0 - 1) & 0x3;

        if (y1 > y2) {
            let swap = x1;
            x1 = x2;
            x2 = swap;

            swap = y1;
            y1 = y2;
            y2 = swap;
        }

        const dx = Math.abs(x2 - x1), sx = x1 < x2 ? 1 : -1;
        const dy = y2 - y1;
        let err = (dx > dy ? dx : -dy) / 2, e2;

        for (;;) {
            this.drawPointUnclipped(strokeColor, x1, y1);
            if (x1 === x2 && y1 === y2) {
                break;
            }
            e2 = err;
            if (e2 > -dx) {
                err -= dy;
                x1 += sx;
            }
            if (e2 < dy) {
                err += dx;
                y1++;
            }
        }
    }

    drawText (charArray: number[] | Uint8Array | Uint8ClampedArray | Uint16Array, x: number, y: number) {
        let currentX = x;
        for (let ii = 0, len = charArray.length; ii < len; ++ii) {
            const charCode = charArray[ii];
            switch (charCode) {
            case 0:  // \0
                return;
            case 10: // \n
                y += 8;
                currentX = x;
                break;
            default:
                this.blit(FONT, currentX, y, 8, 8, 0, (charCode - 32) << 3, 8);
                currentX += 8;
                break;
            }
        }
    }

    blit (
        sprite: Uint8Array,
        dstX: number, dstY: number,
        width: number, height: number,
        srcX: number, srcY: number,
        srcStride: number,
        bpp2: number | boolean = false,
        flipX: number | boolean = false,
        flipY: number | boolean = false,
        rotate: number | boolean = false
    ) {
        const drawColors = this.drawColors[0];

        // Clip rectangle to screen
        let clipXMin, clipYMin, clipXMax, clipYMax;
        if (rotate) {
            flipX = !flipX;
            clipXMin = Math.max(0, dstY) - dstY;
            clipYMin = Math.max(0, dstX) - dstX;
            clipXMax = Math.min(width, HEIGHT - dstY);
            clipYMax = Math.min(height, WIDTH - dstX);
        } else {
            clipXMin = Math.max(0, dstX) - dstX;
            clipYMin = Math.max(0, dstY) - dstY;
            clipXMax = Math.min(width, WIDTH - dstX);
            clipYMax = Math.min(height, HEIGHT - dstY);
        }

        // Iterate pixels in rectangle
        for (let y = clipYMin; y < clipYMax; y++) {
            for (let x = clipXMin; x < clipXMax; x++) {
                // Calculate sprite target coords
                const tx = dstX + (rotate ? y : x);
                const ty = dstY + (rotate ? x : y);

                // Calculate sprite source coords
                const sx = srcX + (flipX ? width - x - 1 : x);
                const sy = srcY + (flipY ? height - y - 1 : y);

                // Sample the sprite to get a color index
                let colorIdx;
                const bitIndex = sy * srcStride + sx;
                if (bpp2) {
                    const byte = sprite[bitIndex >>> 2];
                    const shift = 6 - ((bitIndex & 0x03) << 1);
                    colorIdx = (byte >>> shift) & 0b11;
                } else {
                    const byte = sprite[bitIndex >>> 3];
                    const shift = 7 - (bitIndex & 0x7);
                    colorIdx = (byte >>> shift) & 0b1;
                }

                // Get the final color using the drawColors indirection
                // TODO(2021-08-11): Use a lookup table here?
                const dc = (drawColors >>> (colorIdx << 2)) & 0x0f;
                if (dc !== 0) {
                    this.drawPoint((dc - 1) & 0x03, tx, ty);
                }
            }
        }
    }
}
