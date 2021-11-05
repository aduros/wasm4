#pragma once

#include <stdint.h>

#define W4_BUTTON_X 1
#define W4_BUTTON_Z 2
// #define W4_BUTTON_RESERVED 4
// #define W4_BUTTON_RESERVED 8
#define W4_BUTTON_LEFT 16
#define W4_BUTTON_RIGHT 32
#define W4_BUTTON_UP 64
#define W4_BUTTON_DOWN 128

#define W4_MOUSE_LEFT 1
#define W4_MOUSE_RIGHT 2
#define W4_MOUSE_MIDDLE 4

void w4_runtimeInit (uint8_t* memory, uint8_t* disk);

void w4_runtimeSetGamepad (int idx, uint8_t gamepad);
void w4_runtimeSetMouse (int16_t x, int16_t y, uint8_t buttons);

void w4_runtimeBlit (const uint8_t* sprite, int x, int y, int width, int height, int flags);
void w4_runtimeBlitSub (const uint8_t* sprite, int x, int y, int width, int height, int srcX, int srcY, int stride, int flags);
void w4_runtimeLine (int x1, int y1, int x2, int y2);
void w4_runtimeHLine (int x, int y, int len);
void w4_runtimeVLine (int x, int y, int len);
void w4_runtimeOval (int x, int y, int width, int height);
void w4_runtimeRect (int x, int y, int width, int height);
void w4_runtimeText (const uint8_t* str, int x, int y);
void w4_runtimeTextUtf8 (const uint8_t* str, int byteLength, int x, int y);
void w4_runtimeTextUtf16 (const uint16_t* str, int byteLength, int x, int y);

void w4_runtimeTone (int frequency, int duration, int volume, int flags);

int w4_runtimeDiskr (uint8_t* dest, int size);
int w4_runtimeDiskw (const uint8_t* src, int size);

void w4_runtimeTrace (const uint8_t* str);
void w4_runtimeTraceUtf8 (const uint8_t* str, int byteLength);
void w4_runtimeTraceUtf16 (const uint16_t* str, int byteLength);
void w4_runtimeTracef (const uint8_t* str, const void* stack);

void w4_runtimeUpdate ();

int w4_runtimeSerializeSize ();
void w4_runtimeSerialize (void* dest);
void w4_runtimeUnserialize (const void* src);
