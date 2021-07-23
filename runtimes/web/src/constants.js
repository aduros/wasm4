"use strict";

export const DEBUG = (process.env.NODE_ENV != "production");

export const WIDTH = 160;
export const HEIGHT = 160;

export const FRAMEBUFFER_WIDTH = 160 + 16;
export const FRAMEBUFFER_HEIGHT = 160 + 16;

// Default palette
export const COLORS = [
    0x00,0x00,0x00, // 0x0
    0x00,0x00,0x00, // 0x1
    0x5f,0x57,0x4f, // 0x2
    0xc2,0xc3,0xc7, // 0x3
    0xff,0xff,0xff, // 0x4
    0xe5,0x3b,0x44, // 0x5
    0xff,0xa3,0x00, // 0x6
    0xff,0xe7,0x62, // 0x7
    0x32,0x73,0x45, // 0x8
    0x63,0xc6,0x4d, // 0x9
    0x04,0x84,0xd1, // 0xA
    0x2c,0xe8,0xf4, // 0xB
    0x99,0x34,0x88, // 0xC
    0xff,0x77,0xa8, // 0xD
    0xab,0x52,0x36, // 0xE
    0xff,0xcc,0xaa, // 0xF
];

// Memory layout
export const ADDR_PALETTE_BACKGROUND = 0x0000;
export const ADDR_PALETTE_FOREGROUND = 0x0030;
export const ADDR_DRAW_COLORS = 0x0060;
export const ADDR_SCROLL_X = 0x0062;
export const ADDR_SCROLL_Y = 0x0066;
export const ADDR_CLIP_X = 0x006a;
export const ADDR_CLIP_Y = 0x006b;
export const ADDR_CLIP_WIDTH = 0x006c;
export const ADDR_CLIP_HEIGHT = 0x006d;
export const ADDR_FRAMEBUFFER = 0x006e;
export const ADDR_GAMEPAD0 = 0x59ae;
export const ADDR_GAMEPAD1 = 0x59af;
export const ADDR_GAMEPAD2 = 0x59b0;
export const ADDR_GAMEPAD3 = 0x59b1;
export const ADDR_MOUSE_X = 0x59b2;
export const ADDR_MOUSE_Y = 0x59b3;
export const ADDR_MOUSE_BUTTONS = 0x59b4;

export const BUTTON_X = 1;
export const BUTTON_Z = 2;
// export const BUTTON_RESERVED = 4;
// export const BUTTON_RESERVED = 8;
export const BUTTON_LEFT = 16;
export const BUTTON_RIGHT = 32;
export const BUTTON_UP = 64;
export const BUTTON_DOWN = 128;
