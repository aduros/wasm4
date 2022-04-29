export const WIDTH = 160;
export const HEIGHT = 160;

export const STORAGE_SIZE = 1024;

// Default palette
export const COLORS = [0xe0f8cf, 0x86c06c, 0x306850, 0x071821];

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
export const ADDR_SYSTEM_FLAGS = 0x1f;
export const ADDR_FRAMEBUFFER = 0xa0;

export const BUTTON_X = 1;
export const BUTTON_Z = 2;
// export const BUTTON_RESERVED = 4;
// export const BUTTON_RESERVED = 8;
export const BUTTON_LEFT = 16;
export const BUTTON_RIGHT = 32;
export const BUTTON_UP = 64;
export const BUTTON_DOWN = 128;

export const MOUSE_LEFT = 1;
export const MOUSE_RIGHT = 2;
export const MOUSE_MIDDLE = 4;

export const SYSTEM_PRESERVE_FRAMEBUFFER = 1;
export const SYSTEM_HIDE_GAMEPAD_OVERLAY = 2;

export const MAX_CART_SIZE = 1 << 16;

interface Range {
  offset: number;
  len: number;
}

export const memoryMap: Readonly<Record<string, Range>> = {
  PALETTE: {
    offset: ADDR_PALETTE,
    len: 16,
  },
  DRAW_COLORS: {
    offset: ADDR_DRAW_COLORS,
    len: 2,
  },
  GAMEPAD1: {
    offset: ADDR_GAMEPAD1,
    len: 1,
  },
  GAMEPAD2: {
    offset: ADDR_GAMEPAD2,
    len: 1,
  },
  GAMEPAD3: {
    offset: ADDR_GAMEPAD3,
    len: 1,
  },
  GAMEPAD4: {
    offset: ADDR_GAMEPAD4,
    len: 1,
  },
  MOUSE_X: {
    offset: ADDR_MOUSE_X,
    len: 2,
  },
  MOUSE_Y: {
    offset: ADDR_MOUSE_Y,
    len: 2,
  },
  MOUSE_BUTTONS: {
    offset: ADDR_MOUSE_BUTTONS,
    len: 1,
  },
  SYSTEM_FLAGS: {
    offset: ADDR_SYSTEM_FLAGS,
    len: 1,
  },
  RESERVED: {
    offset: 0x0020,
    len: 128,
  },
  FRAMEBUFFER: {
    offset: ADDR_FRAMEBUFFER,
    len: 6400,
  },
  PROGRAM_MEMORY: {
    offset: 0x19a0,
    len: 58976,
  },
};
