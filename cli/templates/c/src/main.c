#include "wasm4.h"

const char face[] = {
    0b11000011,
    0b10000001,
    0b00100100,
    0b00100100,
    0b00000000,
    0b00100100,
    0b10011001,
    0b11000011,
};

int x = 76;
int y = 76;

void update () {
    char gamepad = *GAMEPAD1;
    if (gamepad & BUTTON_LEFT) {
        x -= 1;
    }
    if (gamepad & BUTTON_RIGHT) {
        x += 1;
    }
    if (gamepad & BUTTON_UP) {
        y -= 1;
    }
    if (gamepad & BUTTON_DOWN) {
        y += 1;
    }

    *DRAW_COLORS = 0xfff2;
    blit(face, x, y, 8, 8, 0);

    *DRAW_COLORS = 0xff2f;
    drawText("Hello utf8 from C!", 0, 10);
}
