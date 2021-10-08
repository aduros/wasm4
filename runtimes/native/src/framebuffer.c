#include "framebuffer.h"

#include <string.h>

static const uint16_t* drawColors;
static uint8_t* framebuffer;

static int min (int a, int b) {
    return a < b ? a : b;
}

static int max (int a, int b) {
    return a > b ? a : b;
}

static void drawPoint (uint8_t color, int x, int y) {
    int idx = (WIDTH * y + x) >> 2;
    int shift = (x & 0x3) << 1;
    int mask = 0x3 << shift;
    framebuffer[idx] = (color << shift) | (framebuffer[idx] & ~mask);
}

void w4_framebufferInit (const uint16_t* drawColors_, uint8_t* framebuffer_) {
    drawColors = drawColors_;
    framebuffer = framebuffer_;
}

void w4_framebufferClear () {
    memset(framebuffer, 0, WIDTH*HEIGHT >> 2);
}

void w4_framebufferRect (int x, int y, int width, int height) {
    // TODO(2021-09-28): Clipping
    uint8_t dc0 = *drawColors & 0xf;

    if (dc0) {
        uint8_t fillColor = dc0 - 1;
        for (int yy = y; yy < y+height; ++yy) {
            for (int xx = x; xx < x+width; ++xx) {
                drawPoint(fillColor, xx, yy);
            }
        }
    }
}

void w4_framebufferBlit (const uint8_t* sprite, int dstX, int dstY, int width, int height,
    int srcX, int srcY, int srcStride, bool bpp2, bool flipX, bool flipY, bool rotate) {

    int clipXMin = max(0, dstX) - dstX;
    int clipYMin = max(0, dstY) - dstY;
    int clipXMax = min(width, WIDTH - dstX);
    int clipYMax = min(height, HEIGHT - dstY);
    uint16_t colors = *drawColors;

    if (rotate) {
        flipX = !flipX;
    }

    for (int row = clipYMin; row < clipYMax; ++row) {
        for (int col = clipXMin; col < clipXMax; ++col) {
            // Determine the local position on the sprite
            int sx, sy;
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

            // Sample the sprite to get a color index
            int colorIdx;
            int x = srcX + sx, y = srcY + sy;
            if (bpp2) {
                uint8_t byte = sprite[(y * srcStride + x) >> 2];
                int shift = 6 - ((x & 0x03) << 1);
                colorIdx = (byte >> shift) & 0b11;

            } else {
                uint8_t byte = sprite[(y * srcStride + x) >> 3];
                int shift = 7 - (x & 0x07);
                colorIdx = (byte >> shift) & 0b1;
            }

            // Get the final color using the drawColors indirection
            uint8_t dc = (colors >> (colorIdx << 2)) & 0x0f;
            if (dc != 0) {
                drawPoint((dc - 1) & 0x03, dstX + col, dstY + row);
            }
        }
    }
}
