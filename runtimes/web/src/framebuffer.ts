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
            if (endXUnclamped > 0 && endXUnclamped <= WIDTH) {
                for (let yy = startY; yy < endY; ++yy) {
                    this.drawPoint(strokeColor, endXUnclamped - 1, yy);
                }
            }

            // Top edge
            if (y >= 0 && y < HEIGHT) {
                this.drawHLineFast(strokeColor, startX, y, endX);
            }

            // Bottom edge
            if (endYUnclamped > 0 && endYUnclamped <= HEIGHT) {
                this.drawHLineFast(strokeColor, startX, endYUnclamped - 1, endX);
            }
        }
    }

    // Oval drawing function using a variation on the midpoint algorithm.
    // TIC-80's ellipse drawing function used as reference.
    // https://github.com/nesbox/TIC-80/blob/main/src/core/draw.c
    //
    // Javatpoint has a in depth academic explanation that mostly went over my head:
    // https://www.javatpoint.com/computer-graphics-midpoint-ellipse-algorithm
    //
    // Draws the ellipse by "scanning" along the edge in one quadrant, and mirroring
    // the movement for the other four quadrants.
    //
    // There are a lot of details to get correct while implementing this algorithm,
    // so ensure the edge cases are covered when changing it. Long, thin ellipses
    // are particularly susceptible to being drawn incorrectly.
    drawOval (x: number, y: number, width: number, height: number) {
        const drawColors = this.drawColors[0];
        const dc0 = drawColors & 0xf;
        const dc1 = (drawColors >>> 4) & 0xf;

        if (dc1 === 0xf) {
            return;
        }

        const strokeColor = (dc1 - 1) & 0x3;
        const fillColor = (dc0 - 1) & 0x3;

        let a = width - 1;
        const b = height - 1;
        let b1 = b % 2; // Compensates for precision loss when dividing

        let north = y + Math.floor(height / 2); // Precision loss here
        let west = x;
        let east = x + width - 1;
        let south = north - b1; // Compensation here. Moves the bottom line up by
                                // one (overlapping the top line) for even heights

        // Error increments. Also known as the decision parameters
        let dx = 4 * (1 - a) * b * b;
        let dy = 4 * (b1 + 1) * a * a;

        // Error of 1 step
        let err = dx + dy + b1 * a * a;

        a *= 8 * a;
        b1 = 8 * b * b;

        do {
            this.drawPointUnclipped(strokeColor, east, north); /*   I. Quadrant     */
            this.drawPointUnclipped(strokeColor, west, north); /*   II. Quadrant    */
            this.drawPointUnclipped(strokeColor, west, south); /*   III. Quadrant   */
            this.drawPointUnclipped(strokeColor, east, south); /*   IV. Quadrant    */
            const start = west + 1;
            const len = east - start;
            if (dc0 !== 0 && len > 0) { // Only draw fill if the length from west to east is not 0
                this.drawHLineUnclipped(fillColor, start, north, east); /*   I and III. Quadrant */
                this.drawHLineUnclipped(fillColor, start, south, east); /*  II and IV. Quadrant */
            }
            const err2 = 2 * err;
            if (err2 <= dy) {
                // Move vertical scan
                north += 1;
                south -= 1;
                dy += a;
                err += dy;
            }
            if (err2 >= dx || 2 * err > dy) {
                // Move horizontal scan
                west += 1;
                east -= 1;
                dx += b1;
                err += dx;
            }
        } while (west <= east);

        // Make sure north and south have moved the entire way so top/bottom aren't missing
        while (north - south < height) {
            this.drawPointUnclipped(strokeColor, west - 1, north); /*   II. Quadrant    */
            this.drawPointUnclipped(strokeColor, east + 1, north); /*   I. Quadrant     */
            north += 1;
            this.drawPointUnclipped(strokeColor, west - 1, south); /*   III. Quadrant   */
            this.drawPointUnclipped(strokeColor, east + 1, south); /*   IV. Quadrant    */
            south -= 1;
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
            if (charCode === 0) {
                return;
            } else if (charCode === 10) {
                y += 8;
                currentX = x;
            } else if (charCode >= 32 && charCode <= 255) {
                this.blit(FONT, currentX, y, 8, 8, 0, (charCode - 32) << 3, 8);
                currentX += 8;
            } else {
                currentX += 8;
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
