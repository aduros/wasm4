//
// WASM-4: https://wasm4.org/docs

#pragma once
#define WASM_EXPORT(name) __attribute__((export_name(name)))
#define WASM_IMPORT(name) __attribute__((import_name(name)))

WASM_EXPORT("start") void start ();
WASM_EXPORT("update") void update ();

// ┌───────────────────────────────────────────────────────────────────────────┐
// │                                                                           │
// │ Platform Constants                                                        │
// │                                                                           │
// └───────────────────────────────────────────────────────────────────────────┘

#define SCREEN_SIZE 160

// ┌───────────────────────────────────────────────────────────────────────────┐
// │                                                                           │
// │ Memory Addresses                                                          │
// │                                                                           │
// └───────────────────────────────────────────────────────────────────────────┘

#define PALETTE ((unsigned int*)0x04)
#define DRAW_COLORS ((unsigned short*)0x14)
#define GAMEPAD1 ((const unsigned char*)0x16)
#define GAMEPAD2 ((const unsigned char*)0x17)
#define GAMEPAD3 ((const unsigned char*)0x18)
#define GAMEPAD4 ((const unsigned char*)0x19)
#define MOUSE_X ((const short*)0x1a)
#define MOUSE_Y ((const short*)0x1c)
#define MOUSE_BUTTONS ((const unsigned char*)0x1e)
#define FRAMEBUFFER ((unsigned char*)0xa0)

#define BUTTON_1 1
#define BUTTON_2 2
#define BUTTON_ENTER 4
#define BUTTON_UNUSED 8
#define BUTTON_LEFT 16
#define BUTTON_RIGHT 32
#define BUTTON_UP 64
#define BUTTON_DOWN 128

// ┌───────────────────────────────────────────────────────────────────────────┐
// │                                                                           │
// │ Drawing Functions                                                         │
// │                                                                           │
// └───────────────────────────────────────────────────────────────────────────┘

/** Copies pixels to the framebuffer. */
WASM_IMPORT("blit")
void blit (const char* data, int x, int y, int width, int height, int flags);

/** Copies a subregion within a larger sprite atlas to the framebuffer. */
WASM_IMPORT("blitSub")
void blitSub (const char* data, int x, int y, int width, int height, int srcX, int srcY, int stride, int flags);

#define BLIT_2BPP 1
#define BLIT_1BPP 0
#define BLIT_FLIP_X 2
#define BLIT_FLIP_Y 4
#define BLIT_ROTATE 8

/** Draws a line between two points. */
WASM_IMPORT("line")
void line (int x, int y, int width, int height);

/** Draws an oval (or circle). */
WASM_IMPORT("oval")
void oval (int x, int y, int width, int height);

/** Draws a rectangle. */
WASM_IMPORT("rect")
void rect (int x, int y, int width, int height);

/** Draws text using the built-in system font. */
WASM_IMPORT("text")
void text (const char* text, int x, int y);

// ┌───────────────────────────────────────────────────────────────────────────┐
// │                                                                           │
// │ Sound Functions                                                           │
// │                                                                           │
// └───────────────────────────────────────────────────────────────────────────┘

/** Plays a sound tone. */
WASM_IMPORT("tone")
void tone (unsigned int frequency, unsigned int envelope, unsigned int duration, unsigned int flags);

#define TONE_PULSE1 0
#define TONE_PULSE2 1
#define TONE_TRIANGLE 2
#define TONE_NOISE 3
#define TONE_MODE1 0
#define TONE_MODE2 4
#define TONE_MODE3 8
#define TONE_MODE4 12

// ┌───────────────────────────────────────────────────────────────────────────┐
// │                                                                           │
// │ Storage Functions                                                         │
// │                                                                           │
// └───────────────────────────────────────────────────────────────────────────┘

/** Reads up to `size` bytes from persistent storage into the pointer `destPtr`. */
WASM_IMPORT("diskr")
unsigned int diskr (void* dest, unsigned int size);

/** Writes up to `size` bytes from the pointer `srcPtr` into persistent storage. */
WASM_IMPORT("diskw")
unsigned int diskw (const void* src, unsigned int size);

/** Prints a message to the debug console. */
WASM_IMPORT("trace") void trace (const char* str);

/** Prints a message to the debug console. */
__attribute__((__format__ (__printf__, 1, 2)))
WASM_IMPORT("tracef") void tracef (const char* fmt, ...);

/** Fills memory at `destPtr` with `size` bytes of the fixed value `value`. */
WASM_IMPORT("memset") void* memset (void* dest, int c, unsigned long size);

/** Copies `size` bytes from `srcPtr` into `destPtr`. */
WASM_IMPORT("memcpy") void* memcpy (void* dest, const void* src, unsigned long size);
