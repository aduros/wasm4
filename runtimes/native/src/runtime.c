#include "runtime.h"

#include <stdio.h>
#include <string.h>

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
}

void w4_runtimeText (const char* str, int x, int y) {
    printf("Would draw \"%s\" to %dx%d with colors %d\n", str, x, y, memory->palette[0]);
}

void w4_runtimeUpdate () {
    // Clear the framebuffer
    memset(memory->framebuffer, 0, sizeof(memory->framebuffer));

    w4_wasmCallUpdate();

    w4_windowComposite(memory->palette, memory->framebuffer);
}
