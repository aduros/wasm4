#pragma once

#include <stdint.h>

#define WIDTH 160
#define HEIGHT 160

void w4_framebufferInit (const uint16_t* drawColors, uint8_t* framebuffer);

void w4_framebufferRect (int x, int y, int width, int height);
