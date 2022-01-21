#pragma once

#include <stdbool.h>
#include <stdint.h>

#define WIDTH 160
#define HEIGHT 160

void w4_framebufferInit (const uint8_t* drawColors, uint8_t* framebuffer);

void w4_framebufferClear ();

void w4_framebufferHLine (int x, int y, int length);

void w4_framebufferVLine (int x, int y, int length);

void w4_framebufferRect (int x, int y, int width, int height);

void w4_framebufferLine (int x1, int y1, int x2, int y2);

void w4_framebufferOval (int x, int y, int width, int height);

void w4_framebufferText (const uint8_t* str, int x, int y);
void w4_framebufferTextUtf8 (const uint8_t* str, int byteLength, int x, int y);
void w4_framebufferTextUtf16 (const uint16_t* str, int byteLength, int x, int y);

void w4_framebufferBlit (const uint8_t* sprite, int dstX, int dstY, int width, int height,
    int srcX, int srcY, int srcStride, bool bpp2, bool flipX, bool flipY, bool rotate);
