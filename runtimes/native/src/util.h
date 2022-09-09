#pragma once

#include <stdint.h>

uint16_t w4_read16LE (const uint16_t* ptr);
uint32_t w4_read32LE (const uint32_t* ptr);

void w4_write16LE (uint16_t* ptr, uint16_t value);
void w4_write32LE (uint32_t* ptr, uint32_t value);
