#pragma once

#include <stdbool.h>
#include <stdint.h>

void w4_menuOpen(void);
void w4_menuClose(void);
bool w4_menuIsOpen(void);
void w4_menuInput(uint8_t gamepad);
void w4_menuRender(uint32_t* palette, uint8_t* framebuffer);

// Returns the selected action (0 = none)
#define MENU_ACTION_NONE      0
#define MENU_ACTION_CONTINUE  1
#define MENU_ACTION_STORE     2

int w4_menuGetAction(void);
