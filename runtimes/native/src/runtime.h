#pragma once

#include <stdint.h>

void w4_runtimeInit (uint8_t* memory);

void w4_runtimeBlit (const uint8_t* sprite, int x, int y, int width, int height, int flags);
void w4_runtimeBlitSub (const uint8_t* sprite, int x, int y, int width, int height, int srcX, int srcY, int stride, int flags);
void w4_runtimeLine (int x1, int y1, int x2, int y2);
void w4_runtimeOval (int x, int y, int width, int height);
void w4_runtimeRect (int x, int y, int width, int height);
void w4_runtimeText (const char* str, int x, int y);
void w4_runtimeTextUtf8 (const uint8_t* str, int byteLength, int x, int y);
void w4_runtimeTextUtf16 (const uint8_t* str, int byteLength, int x, int y);

void w4_runtimeTone (int frequency, int duration, int volume, int flags);

int w4_runtimeDiskr (uint8_t* dest, int size);
int w4_runtimeDiskw (const uint8_t* src, int size);

void w4_runtimeTrace (const char* str);

void w4_runtimeUpdate ();
