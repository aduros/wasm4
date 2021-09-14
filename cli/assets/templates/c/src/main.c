#include "wasm4.h"

const uint8_t smiley[] = {
    0b11000011,
    0b10000001,
    0b00100100,
    0b00100100,
    0b00000000,
    0b00100100,
    0b10011001,
    0b11000011,
};

void update () {
    *DRAW_COLORS = 2;
    text("Hello from C!", 10, 10);

    uint8_t gamepad = *GAMEPAD1;
    if (gamepad & BUTTON_1) {
        *DRAW_COLORS = 4;
    }

    blit(smiley, 76, 76, 8, 8, BLIT_1BPP);
    text("Press X to blink", 16, 90);
}
