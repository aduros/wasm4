"use strict";

export const DEBUG = (process.env.NODE_ENV != "production");

export const WIDTH = 160;
export const HEIGHT = 160;

export const STORAGE_SIZE = 1024;

// Default palette
export const COLORS = [
    0xe0f8d0,
    0x88c070,
    0x346856,
    0x081820,
];

// Memory layout
export const ADDR_PALETTE = 0x04;
export const ADDR_DRAW_COLORS = 0x14;
export const ADDR_GAMEPAD1 = 0x16;
export const ADDR_GAMEPAD2 = 0x17;
export const ADDR_GAMEPAD3 = 0x18;
export const ADDR_GAMEPAD4 = 0x19;
export const ADDR_MOUSE_X = 0x1a;
export const ADDR_MOUSE_Y = 0x1c;
export const ADDR_MOUSE_BUTTONS = 0x1e;
export const ADDR_FRAMEBUFFER = 0xa0;

export const BUTTON_X = 1;
export const BUTTON_Z = 2;
// export const BUTTON_RESERVED = 4;
// export const BUTTON_RESERVED = 8;
export const BUTTON_LEFT = 16;
export const BUTTON_RIGHT = 32;
export const BUTTON_UP = 64;
export const BUTTON_DOWN = 128;
