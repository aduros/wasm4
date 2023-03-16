#pragma once

#include <stdint.h>
#include <stddef.h>

// Safe versions of malloc and realloc that abort on failure, and never return null.
void* xmalloc(size_t size);
void* xrealloc(void* ptr, size_t size);

uint16_t w4_read16LE (const uint16_t* ptr);
uint32_t w4_read32LE (const uint32_t* ptr);

void w4_write16LE (uint16_t* ptr, uint16_t value);
void w4_write32LE (uint32_t* ptr, uint32_t value);
