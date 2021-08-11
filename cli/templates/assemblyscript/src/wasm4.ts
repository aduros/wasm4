export const PALETTE: usize = 0x04;
export const DRAW_COLORS: usize = 0x14;
export const GAMEPAD1: usize = 0x16;
export const GAMEPAD2: usize = 0x17;
export const GAMEPAD3: usize = 0x18;
export const GAMEPAD4: usize = 0x19;
export const MOUSE_X: usize = 0x1a;
export const MOUSE_Y: usize = 0x1c;
export const MOUSE_BUTTONS: usize = 0x1e;
export const FRAMEBUFFER: usize = 0xa0;

export const BUTTON_1: u8 = 1;
export const BUTTON_2: u8 = 2;
export const BUTTON_LEFT: u8 = 16;
export const BUTTON_RIGHT: u8 = 32;
export const BUTTON_UP: u8 = 64;
export const BUTTON_DOWN: u8 = 128;

@external("env", "blit")
export declare function blit (spritePtr: usize, x: i32, y: i32, width: u32, height: u32, flags: u32): void;

@external("env", "blitSub")
export declare function blitSub (spritePtr: usize, x: i32, y: i32, width: u32, height: u32,
    srcX: u32, srcY: u32, stride: i32, flags: u32): void;

export const BLIT_2BPP: u32 = 1;
export const BLIT_1BPP: u32 = 0;
export const BLIT_FLIP_X: u32 = 2;
export const BLIT_FLIP_Y: u32 = 4;
export const BLIT_ROTATE: u32 = 8;

@external("env", "drawRect")
export declare function drawRect (x: i32, y: i32, width: u32, height: u32): void;

@external("env", "circle")
export declare function circle (x: i32, y: i32, width: u32, height: u32): void;

@external("env", "drawTextUtf16")
declare function drawTextUtf16 (text: string, byteLength :i32, x: i32, y: i32): void;
export function drawText (str: string, x: i32, y: i32): void {
    const byteLength = load<u32>(changetype<usize>(str) - 4);
    drawTextUtf16(str, byteLength, x, y);
}

@external("env", "line")
export declare function line (x1: i32, y1: i32, x2: i32, y2: i32): void;

@external("env", "printUtf16")
declare function printUtf16 (str: string, byteLength :i32): void;
export function print (str: string): void {
    const byteLength = load<u32>(changetype<usize>(str) - 4);
    printUtf16(str, byteLength);
}

@external("env", "tone")
export declare function tone (frequency: u32, volume: u32, duration: u32, flags: u32): void;

export const TONE_PULSE1: u32 = 0;
export const TONE_PULSE2: u32 = 1;
export const TONE_TRIANGLE: u32 = 2;
export const TONE_NOISE: u32 = 3;
export const TONE_MODE1: u32 = 0;
export const TONE_MODE2: u32 = 4;
export const TONE_MODE3: u32 = 8;
export const TONE_MODE4: u32 = 12;

@external("env", "storageRead")
export declare function storageRead (dest: usize, size: u32): u32;

@external("env", "storageWrite")
export declare function storageWrite (src: usize, size: u32): u32;

@external("env", "memset")
export declare function memset (dest: usize, byte: u8, size: u32): usize;

@external("env", "memcpy")
export declare function memcpy (dest: usize, src: usize, size: u32): usize;

/**
 * Converts a UTF-16 string to a null-terminated ASCII string. This is much smaller and faster than
 * using String.UTF8.encode(), but has a couple important caveats:
 *
 * 1. Assumes characters are between 0 and 255, it just chops off the high byte.
 * 2. The buffer used to store the output string is written to the very end of available memory. If
 * your program uses a lot of memory, or you encode large strings, this may clobber over used
 * memory!
 *
 * In the near future hopefully AssemblyScript will get better UTF-8 support and this conversion
 * will no longer be required.
 */
function toAscii (str: string): usize {
    // https://github.com/AssemblyScript/assemblyscript/issues/2026
    // const addr = memory.data(1024);

    const addr = 0xffff - str.length - 1;
    let input = changetype<usize>(str);
    let output = addr;
    while (output < 0xffff) {
        store<u8>(output++, load<u8>(input));
        input += 2;
    }
    store<u8>(output, 0);
    return addr;
}
