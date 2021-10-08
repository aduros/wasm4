#pragma once

#include <stdbool.h>
#include <stdint.h>

#define WIDTH 160
#define HEIGHT 160

void w4_framebufferInit (const uint16_t* drawColors, uint8_t* framebuffer);

void w4_framebufferClear ();

void w4_framebufferRect (int x, int y, int width, int height);

void w4_framebufferText (const char* str, int x, int y);

void w4_framebufferBlit (const uint8_t* sprite, int dstX, int dstY, int width, int height,
    int srcX, int srcY, int srcStride, bool bpp2, bool flipX, bool flipY, bool rotate);
