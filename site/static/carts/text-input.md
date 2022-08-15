---
author: Cedric Hutchings
github: cedric-h
date: 2022-08-14
---

# Text Input

Simple example cartridge of how to take text input for your game

C source:
```c
#include "wasm4.h"

#define MAX(x, y) (((x) > (y)) ? (x) : (y))
#define MIN(x, y) (((x) < (y)) ? (x) : (y))
#define ABS(x   ) (((x) <  0 ) ? -x  :  x )
#define iARR_LEN(arr) ((int)(sizeof(arr) / sizeof(arr[0])))

typedef struct { int x, y; } iVec2;

typedef struct { char *str; int strlen, offset_px; } Keyboard_Row;
#define KEYBOARD_ROW(s, o) ((Keyboard_Row) { s, sizeof(s), o })
static Keyboard_Row keyboard[] = {
  KEYBOARD_ROW("qwertyuiop",  5),
  KEYBOARD_ROW( "asdfghjkl",  8),
  KEYBOARD_ROW(   "zxcvbnm", 14)
};
#undef KEYBOARD_ROW

typedef struct { int x, y; } Keyplace;

static int mod(int x, int n) {
  return ((x % n) + n) % n;
}
static Keyplace keyplace_normalize(Keyplace kp) {
  int old_y = kp.y;
  kp.y = mod(kp.y, iARR_LEN(keyboard));
  // kp.y = MIN(kp.y, iARR_LEN(keyboard)-1);
  // kp.y = MAX(kp.y, 0);

  Keyboard_Row *row = keyboard + kp.y;
  kp.x = mod(kp.x, row->strlen-1);
  // kp.x = MAX(kp.x, 0);

  return kp;
}

static iVec2 keyplace_to_px(Keyplace kp) {
  Keyboard_Row *row = keyboard + kp.y;
  return (iVec2) { 16*kp.x + row->offset_px, 100 + 14*kp.y };
}

static char keyplace_char(Keyplace kp) {
  return keyboard[kp.y].str[kp.x];
}

static uint8_t keyplace_eq(Keyplace a, Keyplace b) {
  return a.x == b.x && a.y == b.y;
}

typedef enum {
  Widget_Delete,
  Widget_Clear,
  Widget_Done,
  Widget_Keyboard,
  Widget_COUNT,
} Widget;

typedef enum {
  Modal_Widgets,
  Modal_KeyboardOpen,
  Modal_TypeSomething,
} Modal;

typedef struct {
  Widget w_select; /* selected widget */
  Modal modal;

  Keyplace kb_select;
  char input[4];
  int input_len;

  uint8_t button_cooldown[6];
} State;
static State state;

static uint8_t button_tap(uint8_t button) {
  uint8_t gamepad = *GAMEPAD1;
  uint8_t *cooldown = 0;

  if (button == BUTTON_1    ) cooldown = state.button_cooldown + 0;
  if (button == BUTTON_2    ) cooldown = state.button_cooldown + 1;
  if (button == BUTTON_LEFT ) cooldown = state.button_cooldown + 2;
  if (button == BUTTON_RIGHT) cooldown = state.button_cooldown + 3;
  if (button == BUTTON_UP   ) cooldown = state.button_cooldown + 4;
  if (button == BUTTON_DOWN ) cooldown = state.button_cooldown + 5;

  if (*cooldown > 0) *cooldown = *cooldown - 1;

  if ((gamepad & button) && (*cooldown == 0)) {
    *cooldown = 16;
    return 1;
  }
  if (!(gamepad & button)) *cooldown = 0;

  return 0;
}

int tick = 0;
void update(void) {
  tick++;

  if (state.modal == Modal_TypeSomething) {
    text(
      "   Please type at   \n"
      "least one character.\n" 
      "                    \n"
      "                    \n"
      "     \x80=continue  \n",
      0, 60
    );
    if (*GAMEPAD1 > 0 && tick > 20) state.modal = Modal_Widgets;
    return;
  }

  uint16_t select_color = ((tick/10)%3 == 0) ? 4 : 3;

  {
    uint32_t len = sizeof(state.input)-2;
    int x = SCREEN_SIZE/2 - len*8/2;

    *DRAW_COLORS = 0x20;
    rect(x-2, 40-3, len*12+4, 8+5);

    *DRAW_COLORS = select_color;
    state.input[state.input_len] = (select_color == 4) ? '|' : '\0';
    state.input[3] = '\0';
    text(state.input, x, 40);
  }

  *DRAW_COLORS = 4;
  for (int y = 0; y < iARR_LEN(keyboard); y++) {
    int x = 0;
    char *str = keyboard[y].str;
    while (*str) {
      char tmp[2] = { *str };
      Keyplace kp = { x, y };
      iVec2 px_pos = keyplace_to_px(kp);

      if (state.modal != Modal_KeyboardOpen)
        *DRAW_COLORS = 3;
      else if (keyplace_eq(kp, state.kb_select))
        *DRAW_COLORS = select_color;
      else
        *DRAW_COLORS = 2;
      text(tmp, px_pos.x, px_pos.y);

      str++, x++;
    }
  }

  char *help = 0;

  if (state.modal == Modal_KeyboardOpen) {
    *DRAW_COLORS = 0x30;
    help = "\x80=stop  \x81=type";
  } else if (state.w_select == Widget_Keyboard) {
    *DRAW_COLORS = (uint16_t) (select_color << 4);
    help = "\x80=start typing";
  } else
    *DRAW_COLORS = 0x20;
  rect(2, 96, 156, 44);

  *DRAW_COLORS = 2;
  if (state.w_select == Widget_Delete)
    *DRAW_COLORS = select_color, help = "\x80=delete";
  text("delete",   5, 80);

  *DRAW_COLORS = 2;
  if (state.w_select == Widget_Clear)
    *DRAW_COLORS = select_color, help = "\x80=clear";
  text( "clear",  67, 80);

  *DRAW_COLORS = 2;
  if (state.w_select == Widget_Done)
    *DRAW_COLORS = select_color, help = "\x80=finish";
  text(  "done", 120, 80);

  *DRAW_COLORS = 4;
  text(help, 4, 147);



  if (state.modal == Modal_KeyboardOpen) {

    if (button_tap(BUTTON_RIGHT)) state.kb_select.x++;
    if (button_tap(BUTTON_LEFT )) state.kb_select.x--;
    if (button_tap(BUTTON_UP   )) state.kb_select.y--;
    if (button_tap(BUTTON_DOWN )) state.kb_select.y++;

    if (button_tap(BUTTON_1)) state.modal = Modal_Widgets;
    if (                       button_tap(BUTTON_2) &&
        state.input_len < (int)sizeof(state.input))
      state.input[state.input_len++] = keyplace_char(state.kb_select);

    state.kb_select = keyplace_normalize(state.kb_select);
  } else {
    if (button_tap(BUTTON_UP   )) state.w_select--;
    if (button_tap(BUTTON_DOWN )) state.w_select++;
    if (button_tap(BUTTON_1    )) {
      if (state.w_select == Widget_Clear)  state.input_len = 0;
      if (state.w_select == Widget_Delete) state.input_len--;
      if (state.w_select == Widget_Keyboard)
        state.modal = Modal_KeyboardOpen;
      if (state.w_select == Widget_Done) {
        if (state.input_len == 0)
          tick = 0, state.modal = Modal_TypeSomething;
      }
    }
    state.w_select = (Widget)mod((int)state.w_select, Widget_COUNT);
  }
}
```
