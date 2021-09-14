#include "wasm4.h"

const uint8_t ARROW[] = {
    0b00001000,
    0b00001100,
    0b01111110,
    0b01111111,
    0b01111110,
    0b00001100,
    0b00001000,
    0b00000000,
};

int arrowIdx;
char lastGamepadState;

int values[] = {
    440,
    0,
    0,
    0,
    60,
    /* 255, */
    0,
    100,
    0,
    0,
};

const int MAX_VALUES[] = {
    1000,
    1000,
    255,
    255,
    255,
    255,
    100,
    3,
    3,
};

static char *itoa_simple_helper(char *dest, int i) {
  if (i <= -10) {
    dest = itoa_simple_helper(dest, i/10);
  }
  *dest++ = '0' - i%10;
  return dest;
}

char *itoa(char *dest, int i) {
  char *s = dest;
  if (i < 0) {
    *s++ = '-';
  } else {
    i = -i;
  }
  *itoa_simple_helper(s, i) = '\0';
  return dest;
}

int min (int a, int b) { return (a < b) ? a : b; }
int max (int a, int b) { return (a > b) ? a : b; }

void drawControl (const char* name, int x, int y, int valueIdx) {
    int value = values[valueIdx];
    int maxValue = MAX_VALUES[valueIdx];

    int meterWidth = 50;
    *DRAW_COLORS = 2;
    rect(5*8 + x + 4, y, meterWidth+2, 8);

    *DRAW_COLORS = 3;
    rect(5*8 + x + 4 + 1, y+1, (float)value/maxValue * meterWidth, 6);

    *DRAW_COLORS = 4;
    text(name, x, y);

    char buffer[16];
    itoa(buffer, value);
    text(buffer, 5*8 + x + 4 + meterWidth+2 + 4, y);
}

void update () {

    int x = 20;
    int y = 40;
    int spacing = 12;
    drawControl("FREQ1", x, y + 0*spacing, 0);
    drawControl("FREQ2", x, y + 1*spacing, 1);
    drawControl("ATTCK", x, y + 2*spacing, 2);
    drawControl("DECAY", x, y + 3*spacing, 3);
    drawControl("SUSTN", x, y + 4*spacing, 4);
    drawControl("RLEAS", x, y + 5*spacing, 5);
    drawControl("VOLUM", x, y + 6*spacing, 6);
    drawControl("CHNNL", x, y + 7*spacing, 7);
    drawControl(" MODE", x, y + 8*spacing, 8);

    *DRAW_COLORS = 4;
    text("Arrows: Adjust\nX: Play tone", x, 8);

    *DRAW_COLORS = 0x40;
    blit(ARROW, x-8-4, y + arrowIdx*spacing, 8, 8, BLIT_1BPP);

    char gamepad = *GAMEPAD1;
    char pressedThisFrame = gamepad & (gamepad ^ lastGamepadState);
    lastGamepadState = gamepad;

    if ((pressedThisFrame & BUTTON_DOWN) && arrowIdx < 8) {
        ++arrowIdx;
    }
    if ((pressedThisFrame & BUTTON_UP) && arrowIdx > 0) {
        --arrowIdx;
    }

    int step = MAX_VALUES[arrowIdx]/100;
    if (step == 0) {
        step = 1;
        gamepad = pressedThisFrame;
    }

    if (gamepad & BUTTON_RIGHT) {
        values[arrowIdx] = min(values[arrowIdx]+step, MAX_VALUES[arrowIdx]);
    }
    if ((gamepad & BUTTON_LEFT) && values[arrowIdx] >= 0) {
        values[arrowIdx] = max(0, values[arrowIdx]-step);
    }

    if (pressedThisFrame & BUTTON_1) {
        int freq1 = values[0];
        int freq2 = values[1];
        int attack = values[2];
        int decay = values[3];
        int sustain = values[4];
        int release = values[5];
        int volume = values[6];
        int channel = values[7];
        int mode = values[8];
        tone(freq1 | (freq2 << 16), (attack << 24) | (decay << 16) | sustain | (release << 8), volume, channel | (mode << 2));
    }
}
