#pragma once

#include <stdint.h>

void w4_windowBoot (const char* title);

void w4_windowComposite (const uint32_t* palette, const uint8_t* framebuffer);
