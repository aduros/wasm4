"use strict";

export const DEBUG = (process.env.NODE_ENV != "production");

export const WIDTH = 160;
export const HEIGHT = 160;

export const STORAGE_SIZE = 1024;

// Default palette
export const COLORS = [
    0xe0,0xf8,0xd0,
    0x88,0xc0,0x70,
    0x34,0x68,0x56,
    0x08,0x18,0x20,
];

// Memory layout
export const ADDR_PALETTE = 0x0000;
export const ADDR_DRAW_COLORS = 0x000c;
export const ADDR_FRAMEBUFFER = 0x000e;
export const ADDR_GAMEPAD1 = 0x190e;
export const ADDR_GAMEPAD2 = 0x190f;
export const ADDR_GAMEPAD3 = 0x1910;
export const ADDR_GAMEPAD4 = 0x1911;
export const ADDR_MOUSE_X = 0x1912;
export const ADDR_MOUSE_Y = 0x1913;
export const ADDR_MOUSE_BUTTONS = 0x1914;

export const BUTTON_X = 1;
export const BUTTON_Z = 2;
// export const BUTTON_RESERVED = 4;
// export const BUTTON_RESERVED = 8;
export const BUTTON_LEFT = 16;
export const BUTTON_RIGHT = 32;
export const BUTTON_UP = 64;
export const BUTTON_DOWN = 128;
