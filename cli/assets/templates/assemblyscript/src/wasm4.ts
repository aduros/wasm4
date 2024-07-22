//
// WASM-4: https://wasm4.org/docs

// ┌───────────────────────────────────────────────────────────────────────────┐
// │                                                                           │
// │ Platform Constants                                                        │
// │                                                                           │
// └───────────────────────────────────────────────────────────────────────────┘

export const SCREEN_SIZE: u32 = 160;
export const FONT_SIZE: u32 = 8;

// ┌───────────────────────────────────────────────────────────────────────────┐
// │                                                                           │
// │ Memory Addresses                                                          │
// │                                                                           │
// └───────────────────────────────────────────────────────────────────────────┘

export const PALETTE: usize = 0x04;
export const DRAW_COLORS: usize = 0x14;
export const GAMEPAD1: usize = 0x16;
export const GAMEPAD2: usize = 0x17;
export const GAMEPAD3: usize = 0x18;
export const GAMEPAD4: usize = 0x19;
export const MOUSE_X: usize = 0x1a;
export const MOUSE_Y: usize = 0x1c;
export const MOUSE_BUTTONS: usize = 0x1e;
export const SYSTEM_FLAGS: usize = 0x1f;
export const NETPLAY: usize = 0x20;
export const FRAMEBUFFER: usize = 0xa0;

export const BUTTON_1: u8 = 1;
export const BUTTON_2: u8 = 2;
export const BUTTON_LEFT: u8 = 16;
export const BUTTON_RIGHT: u8 = 32;
export const BUTTON_UP: u8 = 64;
export const BUTTON_DOWN: u8 = 128;

export const MOUSE_LEFT: u8 = 1;
export const MOUSE_RIGHT: u8 = 2;
export const MOUSE_MIDDLE: u8 = 4;

export const SYSTEM_PRESERVE_FRAMEBUFFER = 1;
export const SYSTEM_HIDE_GAMEPAD_OVERLAY = 2;

// ┌───────────────────────────────────────────────────────────────────────────┐
// │                                                                           │
// │ Drawing Functions                                                         │
// │                                                                           │
// └───────────────────────────────────────────────────────────────────────────┘

/** Copies pixels to the framebuffer. */
// @ts-ignore: decorator
@external("env", "blit")
export declare function blit (spritePtr: usize, x: i32, y: i32, width: u32, height: u32, flags: u32): void;

/** Copies a subregion within a larger sprite atlas to the framebuffer. */
// @ts-ignore: decorator
@external("env", "blitSub")
export declare function blitSub (spritePtr: usize, x: i32, y: i32, width: u32, height: u32,
    srcX: u32, srcY: u32, stride: i32, flags: u32): void;

export const BLIT_1BPP: u32 = 0;
export const BLIT_2BPP: u32 = 1;
export const BLIT_FLIP_X: u32 = 2;
export const BLIT_FLIP_Y: u32 = 4;
export const BLIT_ROTATE: u32 = 8;

/** Draws a line between two points. */
// @ts-ignore: decorator
@external("env", "line")
export declare function line (x1: i32, y1: i32, x2: i32, y2: i32): void;

/** Draws a horizontal line. */
// @ts-ignore: decorator
@external("env", "hline")
export declare function hline (x: i32, y: i32, len: u32): void;

/** Draws a vertical line. */
// @ts-ignore: decorator
@external("env", "vline")
export declare function vline (x: i32, y: i32, len: u32): void;

/** Draws an oval (or circle). */
// @ts-ignore: decorator
@external("env", "oval")
export declare function oval (x: i32, y: i32, width: u32, height: u32): void;

/** Draws a rectangle. */
// @ts-ignore: decorator
@external("env", "rect")
export declare function rect (x: i32, y: i32, width: u32, height: u32): void;

/** Draws text using the built-in system font. */
export function text (str: string, x: i32, y: i32): void {
    const byteLength = load<u32>(changetype<usize>(str) - 4);
    textUtf16(str, byteLength, x, y);
}

// @ts-ignore: decorator
@external("env", "textUtf16")
declare function textUtf16 (text: string, byteLength: u32, x: i32, y: i32): void;

// ┌───────────────────────────────────────────────────────────────────────────┐
// │                                                                           │
// │ Sound Functions                                                           │
// │                                                                           │
// └───────────────────────────────────────────────────────────────────────────┘

/** Plays a sound tone. */
// @ts-ignore: decorator
@external("env", "tone")
export declare function tone (frequency: u32, duration: u32, volume: u32, flags: u32): void;

export const TONE_PULSE1: u32 = 0;
export const TONE_PULSE2: u32 = 1;
export const TONE_TRIANGLE: u32 = 2;
export const TONE_NOISE: u32 = 3;
export const TONE_MODE1: u32 = 0;
export const TONE_MODE2: u32 = 4;
export const TONE_MODE3: u32 = 8;
export const TONE_MODE4: u32 = 12;
export const TONE_PAN_LEFT: u32 = 16;
export const TONE_PAN_RIGHT: u32 = 32;
export const TONE_NOTE_MODE: u32 = 64;

// ┌───────────────────────────────────────────────────────────────────────────┐
// │                                                                           │
// │ Storage Functions                                                         │
// │                                                                           │
// └───────────────────────────────────────────────────────────────────────────┘

/** Reads up to `size` bytes from persistent storage into the pointer `destPtr`. */
// @ts-ignore: decorator
@external("env", "diskr")
export declare function diskr (dest: usize, size: u32): u32;

/** Writes up to `size` bytes from the pointer `srcPtr` into persistent storage. */
// @ts-ignore: decorator
@external("env", "diskw")
export declare function diskw (src: usize, size: u32): u32;

// ┌───────────────────────────────────────────────────────────────────────────┐
// │                                                                           │
// │ Other Functions                                                           │
// │                                                                           │
// └───────────────────────────────────────────────────────────────────────────┘

/** Prints a message to the debug console. */
export function trace (str: string): void {
    const ptr = changetype<usize>(str);
    const byteLength = load<u32>(ptr - 4);
    traceUtf16(ptr, byteLength);
}

// @ts-ignore: decorator
@external("env", "traceUtf16")
declare function traceUtf16 (str: usize, byteLength: u32): void;

// Pass abort messages to trace()
function abortHandler (message: string | null, fileName: string | null, lineNumber: u32, columnNumber: u32) :void {
    const ptr = changetype<usize>(message);
    if (ptr != 0) {
        const byteLength = load<u32>(ptr - 4);
        traceUtf16(ptr, byteLength);
    }
}

// Avoid requiring an external seed. Call `Math.seedRandom()` to manually seed `Math.random()`.
function seedHandler (): f64 {
    return 0;
}
