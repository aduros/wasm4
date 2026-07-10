#include "menu.h"

#include <string.h>
#include "runtime.h"

#define SCREEN_W 160
#define SCREEN_H 160
#define NUM_OPTIONS 2

static const char* options[NUM_OPTIONS] = {
    "CONTINUE",
    "STORE",
};

static const int actions[NUM_OPTIONS] = {
    MENU_ACTION_CONTINUE,
    MENU_ACTION_STORE,
};

static bool menuOpen = false;
static int selectedIdx = 0;
static uint8_t lastGamepad = 0;
static int pendingAction = MENU_ACTION_NONE;

static uint8_t menuFb[SCREEN_W * SCREEN_H / 4];

static void setPixel(int x, int y, uint8_t color) {
    if (x < 0 || x >= SCREEN_W || y < 0 || y >= SCREEN_H) return;
    int idx = (y * SCREEN_W + x) >> 2;
    int shift = (x & 3) * 2;
    menuFb[idx] = (menuFb[idx] & ~(3 << shift)) | ((color & 3) << shift);
}

static void drawRect(int x, int y, int w, int h, uint8_t color) {
    for (int dy = 0; dy < h; dy++)
        for (int dx = 0; dx < w; dx++)
            setPixel(x + dx, y + dy, color);
}

// Same mini font as store.c
static const uint8_t miniFont[][6] = {
    {0x0,0x0,0x0,0x0,0x0,0x0}, // space
    {0x6,0x9,0x9,0xF,0x9,0x9}, // A
    {0x7,0x9,0x7,0x9,0x9,0x7}, // B
    {0x6,0x9,0x1,0x1,0x9,0x6}, // C
    {0x7,0x9,0x9,0x9,0x9,0x7}, // D
    {0xF,0x1,0x7,0x1,0x1,0xF}, // E
    {0xF,0x1,0x7,0x1,0x1,0x1}, // F
    {0x6,0x9,0x1,0xD,0x9,0x6}, // G
    {0x9,0x9,0xF,0x9,0x9,0x9}, // H
    {0xE,0x4,0x4,0x4,0x4,0xE}, // I
    {0x8,0x8,0x8,0x8,0x9,0x6}, // J
    {0x9,0x5,0x3,0x3,0x5,0x9}, // K
    {0x1,0x1,0x1,0x1,0x1,0xF}, // L
    {0x9,0xF,0xF,0x9,0x9,0x9}, // M
    {0x9,0xB,0xD,0x9,0x9,0x9}, // N
    {0x6,0x9,0x9,0x9,0x9,0x6}, // O
    {0x7,0x9,0x9,0x7,0x1,0x1}, // P
    {0x6,0x9,0x9,0x9,0x5,0xA}, // Q
    {0x7,0x9,0x9,0x7,0x5,0x9}, // R
    {0x6,0x1,0x6,0x8,0x8,0x7}, // S
    {0xE,0x4,0x4,0x4,0x4,0x4}, // T
    {0x9,0x9,0x9,0x9,0x9,0x6}, // U
    {0x9,0x9,0x9,0x9,0x6,0x6}, // V
    {0x9,0x9,0x9,0xF,0xF,0x9}, // W
    {0x9,0x9,0x6,0x6,0x9,0x9}, // X
    {0x9,0x9,0x6,0x4,0x4,0x4}, // Y
    {0xF,0x8,0x4,0x2,0x1,0xF}, // Z
    {0x6,0x9,0xD,0xB,0x9,0x6}, // 0
    {0x2,0x3,0x2,0x2,0x2,0x7}, // 1
    {0x6,0x9,0x8,0x4,0x2,0xF}, // 2
    {0xF,0x8,0x4,0x8,0x9,0x6}, // 3
    {0x8,0x9,0x9,0xF,0x8,0x8}, // 4
    {0xF,0x1,0x7,0x8,0x9,0x6}, // 5
    {0x4,0x2,0x7,0x9,0x9,0x6}, // 6
    {0xF,0x8,0x4,0x4,0x2,0x2}, // 7
    {0x6,0x9,0x6,0x9,0x9,0x6}, // 8
    {0x6,0x9,0x9,0xE,0x4,0x2}, // 9
    {0x0,0x0,0x0,0x0,0x0,0x2}, // .
    {0x0,0x0,0x6,0x0,0x0,0x0}, // -
    {0x8,0x8,0x4,0x2,0x1,0x1}, // /
    {0x1,0x2,0x4,0x2,0x1,0x0}, // >
    {0x0,0x2,0x0,0x0,0x2,0x0}, // :
};

static int fontIndex(char c) {
    if (c == ' ') return 0;
    if (c >= 'A' && c <= 'Z') return 1 + (c - 'A');
    if (c >= 'a' && c <= 'z') return 1 + (c - 'a');
    if (c >= '0' && c <= '9') return 27 + (c - '0');
    if (c == '.') return 37;
    if (c == '-') return 38;
    if (c == '/') return 39;
    if (c == '>') return 40;
    if (c == ':') return 41;
    return 0;
}

static void drawChar(int x, int y, char c, uint8_t color) {
    int idx = fontIndex(c);
    for (int row = 0; row < 6; row++) {
        uint8_t bits = miniFont[idx][row];
        for (int col = 0; col < 4; col++) {
            if (bits & (1 << col))
                setPixel(x + col, y + row, color);
        }
    }
}

static void drawText(int x, int y, const char* text, uint8_t color) {
    while (*text) {
        drawChar(x, y, *text, color);
        x += 5;
        text++;
    }
}

static int textWidth(const char* text) {
    int len = strlen(text);
    return len > 0 ? len * 5 - 1 : 0;
}

static void drawTextCentered(int y, const char* text, uint8_t color) {
    int w = textWidth(text);
    drawText((SCREEN_W - w) / 2, y, text, color);
}

void w4_menuOpen(void) {
    if (menuOpen) return;
    menuOpen = true;
    selectedIdx = 0;
    lastGamepad = 0;
    pendingAction = MENU_ACTION_NONE;
}

void w4_menuClose(void) {
    menuOpen = false;
    pendingAction = MENU_ACTION_NONE;
}

bool w4_menuIsOpen(void) {
    return menuOpen;
}

void w4_menuInput(uint8_t gamepad) {
    uint8_t pressed = gamepad & (gamepad ^ lastGamepad);
    lastGamepad = gamepad;

    if (pressed & W4_BUTTON_DOWN) {
        selectedIdx = (selectedIdx + 1) % NUM_OPTIONS;
    }
    if (pressed & W4_BUTTON_UP) {
        selectedIdx = (selectedIdx + NUM_OPTIONS - 1) % NUM_OPTIONS;
    }
    if (pressed & (W4_BUTTON_X | W4_BUTTON_Z)) {
        pendingAction = actions[selectedIdx];
    }
}

int w4_menuGetAction(void) {
    int action = pendingAction;
    pendingAction = MENU_ACTION_NONE;
    return action;
}

void w4_menuRender(uint32_t* palette, uint8_t* framebuffer) {
    palette[0] = 0x111111;
    palette[1] = 0x333333;
    palette[2] = 0x73eff7;
    palette[3] = 0xf4f4f4;

    memset(menuFb, 0x00, sizeof(menuFb));

    // Title
    drawTextCentered(30, "WASM-4", 2);

    // Menu border
    int menuX = 30;
    int menuY = 48;
    int menuW = 100;
    int menuH = NUM_OPTIONS * 14 + 8;
    drawRect(menuX, menuY, menuW, menuH, 1);
    drawRect(menuX + 1, menuY + 1, menuW - 2, menuH - 2, 0);

    // Options
    for (int i = 0; i < NUM_OPTIONS; i++) {
        int y = menuY + 6 + i * 14;

        if (i == selectedIdx) {
            drawRect(menuX + 2, y - 2, menuW - 4, 12, 1);
            drawText(menuX + 8, y, ">", 2);
            drawText(menuX + 16, y, options[i], 2);
        } else {
            drawText(menuX + 16, y, options[i], 3);
        }
    }

    memcpy(framebuffer, menuFb, sizeof(menuFb));
}
