#include "runtime.h"

#include <stdio.h>
#include <string.h>

#include "framebuffer.h"
#include "wasm.h"
#include "window.h"

#define WIDTH 160
#define HEIGHT 160

typedef struct {
    uint8_t _padding[4];
    uint32_t palette[4];
    uint16_t drawColors;
    uint8_t gamepads[4];
    int16_t mouseX;
    int16_t mouseY;
    uint8_t mouseButtons;
    uint8_t _reserved[129];
    uint8_t framebuffer[WIDTH*HEIGHT>>2];
} Memory;

static Memory* memory;

void w4_runtimeInit (uint8_t* memoryBytes) {
    memory = (Memory*)memoryBytes;

    // Set memory to initial state
    memset(memory, 0, 0xffff);
    memory->palette[0] = 0xe0f8cf;
    memory->palette[1] = 0x86c06c;
    memory->palette[2] = 0x306850;
    memory->palette[3] = 0x071821;
    memory->drawColors = 0x1203;
    memory->mouseX = 0x7fff;
    memory->mouseY = 0x7fff;

    w4_framebufferInit(&memory->drawColors, memory->framebuffer);
}

void w4_runtimeSetGamepad (int idx, uint8_t gamepad) {
    memory->gamepads[idx] = gamepad;
}

void w4_runtimeSetMouse (int16_t x, int16_t y, uint8_t buttons) {
    memory->mouseX = x;
    memory->mouseY = y;
    memory->mouseButtons = buttons;
}

void w4_runtimeBlit (const uint8_t* sprite, int x, int y, int width, int height, int flags) {
    // printf("blit: %p, %d, %d, %d, %d, %d\n", sprite, x, y, width, height, flags);

    w4_runtimeBlitSub(sprite, x, y, width, height, 0, 0, width, flags);
}

void w4_runtimeBlitSub (const uint8_t* sprite, int x, int y, int width, int height, int srcX, int srcY, int stride, int flags) {
    // printf("blitSub: %p, %d, %d, %d, %d, %d, %d, %d, %d\n", sprite, x, y, width, height, srcX, srcY, stride, flags);

    bool bpp2 = (flags & 1);
    bool flipX = (flags & 2);
    bool flipY = (flags & 4);
    bool rotate = (flags & 8);
    w4_framebufferBlit(sprite, x, y, width, height, srcX, srcY, stride, bpp2, flipX, flipY, rotate);
}

void w4_runtimeLine (int x1, int y1, int x2, int y2) {
    // printf("line: %d, %d, %d, %d\n", x1, y1, x2, y2);
    w4_framebufferLine(x1, y1, x2, y2);
}

void w4_runtimeHLine (int x, int y, int len) {
    // printf("hline: %d, %d, %d\n", x, y, len);
    w4_framebufferHLine(x, y, len);
}

void w4_runtimeVLine (int x, int y, int len) {
    // printf("vline: %d, %d, %d\n", x, y, len);
    w4_framebufferVLine(x, y, len);
}

void w4_runtimeOval (int x, int y, int width, int height) {
    // printf("oval: %d, %d, %d, %d\n", x, y, width, height);
    w4_framebufferOval(x, y, width, height);
}

void w4_runtimeRect (int x, int y, int width, int height) {
    // printf("rect: %d, %d, %d, %d\n", x, y, width, height);
    w4_framebufferRect(x, y, width, height);
}

void w4_runtimeText (const char* str, int x, int y) {
    // printf("text: %s, %d, %d\n", str, x, y);
    w4_framebufferText(str, x, y);
}

void w4_runtimeTextUtf8 (const uint8_t* str, int byteLength, int x, int y) {
    printf("TODO: textUtf8: %p, %d, %d, %d\n", str, byteLength, x, y);
}

void w4_runtimeTextUtf16 (const uint8_t* str, int byteLength, int x, int y) {
    printf("TODO: textUtf16: %p, %d, %d, %d\n", str, byteLength, x, y);
}

void w4_runtimeTone (int frequency, int duration, int volume, int flags) {
    printf("TODO: tone: %d, %d, %d, %d\n", frequency, duration, volume, flags);
}

int w4_runtimeDiskr (uint8_t* dest, int size) {
    printf("TODO: diskr: %p, %d\n", dest, size);
    return 0;
}

int w4_runtimeDiskw (const uint8_t* src, int size) {
    printf("TODO: diskw: %p, %d\n", src, size);
    return 0;
}

void w4_runtimeTrace (const char* str) {
    puts(str);
}

void w4_runtimeTraceUtf8 (const uint8_t* str, int byteLength) {
    printf("TODO: traceUtf8: %p, %d\n", str, byteLength);
}

void w4_runtimeTraceUtf16 (const uint8_t* str, int byteLength) {
    printf("TODO: traceUtf16: %p, %d\n", str, byteLength);
}

void w4_runtimeTracef (const char* str, const void* stack) {
    vprintf(str, (void*)&stack);
    putchar('\n');
}

void w4_runtimeUpdate () {
    w4_framebufferClear();
    w4_wasmCallUpdate();
    w4_windowComposite(memory->palette, memory->framebuffer);
}
