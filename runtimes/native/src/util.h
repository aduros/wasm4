#pragma once

#include <stdint.h>
#include <stddef.h>

// Safe versions of malloc and realloc that abort on failure, and never return null.
void* xmalloc(size_t size);
void* xrealloc(void* ptr, size_t size);

uint16_t w4_read16LE (const void* ptr);
uint32_t w4_read32LE (const void* ptr);
double w4_readf64LE (const void* ptr);

void w4_write16LE (void* ptr, uint16_t value);
void w4_write32LE (void* ptr, uint32_t value);
