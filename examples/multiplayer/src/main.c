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

typedef struct {
    int16_t x, y;
    uint16_t color;
} Player;

static Player players[] = {
    {
        .x = 10,
        .y = 10,
        .color = 2,
    },
    {
        .x = 142,
        .y = 142,
        .color = 3,
    },
    {
        .x = 10,
        .y = 142,
        .color = 4,
    },
    {
        .x = 142,
        .y = 10,
        .color = 0x32,
    },
};

static void playerHandleInput (Player* player, uint8_t gamepad) {
    if (gamepad & BUTTON_LEFT) {
        --player->x;
    }
    if (gamepad & BUTTON_RIGHT) {
        ++player->x;
    }
    if (gamepad & BUTTON_UP) {
        --player->y;
    }
    if (gamepad & BUTTON_DOWN) {
        ++player->y;
    }
}

static void playerDraw (const Player* player) {
    *DRAW_COLORS = player->color;
    blit(smiley, player->x, player->y, 8, 8, BLIT_1BPP);
}

void update () {
    *DRAW_COLORS = 3;
    text("  Gamepads 1 to 4\nto move each player", 4, 64);

    for (int n = 0; n < 4; ++n) {
        Player* player = &players[n];
        playerHandleInput(player, GAMEPAD1[n]);
        playerDraw(player);
    }
}
