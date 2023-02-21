#include "runtime.h"

#include <stdio.h>
#include <string.h>
#include <assert.h>

#include "apu.h"
#include "framebuffer.h"
#include "util.h"
#include "wasm.h"
#include "window.h"

#define WIDTH 160
#define HEIGHT 160

#define SYSTEM_PRESERVE_FRAMEBUFFER 1

typedef struct {
    uint8_t _padding[4];
    uint32_t palette[4];
    uint8_t drawColors[2];
    uint8_t gamepads[4];
    int16_t mouseX;
    int16_t mouseY;
    uint8_t mouseButtons;
    uint8_t systemFlags;
    uint8_t _reserved[128];
    uint8_t framebuffer[WIDTH*HEIGHT>>2];
    uint8_t _user[58976];
} Memory;

typedef struct {
    Memory memory;
    w4_Disk disk;
    bool firstFrame;
} SerializedState;

static Memory* memory;
static w4_Disk* disk;
static bool firstFrame;

void w4_runtimeInit (uint8_t* memoryBytes, w4_Disk* diskBytes) {
    memory = (Memory*)memoryBytes;
    disk = diskBytes;
    firstFrame = true;

    // Set memory to initial state
    memset(memory, 0, 1 << 16);
    w4_write32LE(&memory->palette[0], 0xe0f8cf);
    w4_write32LE(&memory->palette[1], 0x86c06c);
    w4_write32LE(&memory->palette[2], 0x306850);
    w4_write32LE(&memory->palette[3], 0x071821);
    memory->drawColors[0] = 0x03;
    memory->drawColors[1] = 0x12;
    w4_write16LE(&memory->mouseX, 0x7fff);
    w4_write16LE(&memory->mouseY, 0x7fff);

    w4_apuInit();
    w4_framebufferInit(memory->drawColors, memory->framebuffer);
}

void w4_runtimeSetGamepad (int idx, uint8_t gamepad) {
    memory->gamepads[idx] = gamepad;
}

void w4_runtimeSetMouse (int16_t x, int16_t y, uint8_t buttons) {
    w4_write16LE(&memory->mouseX, x);
    w4_write16LE(&memory->mouseY, y);
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

void w4_runtimeText (const uint8_t* str, int x, int y) {
    // printf("text: %s, %d, %d\n", str, x, y);
    w4_framebufferText(str, x, y);
}

void w4_runtimeTextUtf8 (const uint8_t* str, int byteLength, int x, int y) {
    // printf("textUtf8: %p, %d, %d, %d\n", str, byteLength, x, y);
    w4_framebufferTextUtf8(str, byteLength, x, y);
}

void w4_runtimeTextUtf16 (const uint16_t* str, int byteLength, int x, int y) {
    // printf("textUtf16: %p, %d, %d, %d\n", str, byteLength, x, y);
    w4_framebufferTextUtf16(str, byteLength, x, y);
}

void w4_runtimeTone (int frequency, int duration, int volume, int flags) {
    // printf("tone: %d, %d, %d, %d\n", frequency, duration, volume, flags);
    w4_apuTone(frequency, duration, volume, flags);
}

int w4_runtimeDiskr (uint8_t* dest, int size) {
    if (!disk) {
        return 0;
    }

    if (size > disk->size) {
        size = disk->size;
    }
    memcpy(dest, disk->data, size);
    return size;
}

int w4_runtimeDiskw (const uint8_t* src, int size) {
    if (!disk) {
        return 0;
    }

    if (size > 1024) {
        size = 1024;
    }
    disk->size = size;
    memcpy(disk->data, src, size);
    return size;
}

void w4_runtimeTrace (const uint8_t* str) {
    puts(str);
}

void w4_runtimeTraceUtf8 (const uint8_t* str, int byteLength) {
    printf("%.*s\n", byteLength, str);
}

void w4_runtimeTraceUtf16 (const uint16_t* str, int byteLength) {
    printf("TODO: traceUtf16: %p, %d\n", str, byteLength);
}

static unsigned align(unsigned v, unsigned a) {
    return (v + a - 1) & ~(a - 1);
}

void w4_runtimeTracef (const uint8_t* fmt, const uint8_t * stk, const uint8_t * mem) {
    char out[256];
    char buf[256];
    size_t sofar = 0;
    unsigned si = 0;
    char * ctx = buf;
    char * s;
    snprintf(buf, sizeof(buf), "%s", fmt);
    s = strsep(&ctx, "%");
    while (s) {
        char fb[32];
	char fc;
        char * fm =  strsep(&ctx, "cdxfs");
        if (!fm) {
            sofar += snprintf(out+sofar, sizeof(out)-sofar, "%s", s);
            break;
        }
        fc = fmt[(fm+strlen(fm)) - buf];
        snprintf(fb, sizeof(fb), "%s%%%s%c", s, fm, fc);
        switch (fc) {
	case 0:
            sofar += snprintf(out+sofar, sizeof(out)-sofar, fb);
            break;
        case 'c':
        case 'd':
        case 'x':
            sofar += snprintf(out+sofar, sizeof(out)-sofar, fb, *(int32_t*)(stk+si));
            si += 4;
            break;
        case 'f':
            si = align(si, 8);
            sofar += snprintf(out+sofar, sizeof(out)-sofar, fb, *(double*)(stk+si));
            si += 8;
            break;
        case 's':
            sofar += snprintf(out+sofar, sizeof(out)-sofar, fb, mem+*(int32_t*)(stk+si));
            si += 4;
            break;
        default:
            assert(0);
        }
        s = strsep(&ctx, "%");
    }
    fputs(out, stdout);
}

void w4_runtimeUpdate () {
    if (firstFrame) {
        firstFrame = false;
        w4_wasmCallStart();
    } else if (!(memory->systemFlags & SYSTEM_PRESERVE_FRAMEBUFFER)) {
        w4_framebufferClear();
    }
    w4_wasmCallUpdate();
    uint32_t palette[4] = {
        w4_read32LE(&memory->palette[0]),
        w4_read32LE(&memory->palette[1]),
        w4_read32LE(&memory->palette[2]),
        w4_read32LE(&memory->palette[3]),
    };
    w4_windowComposite(palette, memory->framebuffer);
}

int w4_runtimeSerializeSize () {
    return sizeof(SerializedState);
}

void w4_runtimeSerialize (void* dest) {
    SerializedState* state = dest;
    memcpy(&state->memory, memory, 1 << 16);
    memcpy(&state->disk, disk, sizeof(w4_Disk));
    state->firstFrame = firstFrame;
}

void w4_runtimeUnserialize (const void* src) {
    const SerializedState* state = src;
    memcpy(memory, &state->memory, 1 << 16);
    memcpy(disk, &state->disk, sizeof(w4_Disk));
    firstFrame = state->firstFrame;
}
