module wasm4;

extern(C):

// ┌───────────────────────────────────────────────────────────────────────────┐
// │                                                                           │
// │ Platform Constants                                                        │
// │                                                                           │
// └───────────────────────────────────────────────────────────────────────────┘

enum screenSize = 160;

// ┌───────────────────────────────────────────────────────────────────────────┐
// │                                                                           │
// │ Memory Addresses                                                          │
// │                                                                           │
// └───────────────────────────────────────────────────────────────────────────┘

enum palette = cast(uint*)0x04;
enum drawColors = cast(ushort*)0x14;
enum gamepad1 = cast(const ubyte*)0x16;
enum gamepad2 = cast(const ubyte*)0x17;
enum gamepad3 = cast(const ubyte*)0x18;
enum gamepad4 = cast(const ubyte*)0x19;
enum mouseX = cast(const short*)0x1a;
enum mouseY = cast(const short*)0x1c;
enum mouseButtons = cast(const ubyte*)0x1e;
enum systemFlags = cast(ubyte*)0x1f;
enum netplay = cast(const ubyte*)0x20;
enum framebuffer = cast(ubyte*)0xa0;

enum button1 = 1;
enum button2 = 2;
enum buttonLeft = 16;
enum buttonRight = 32;
enum buttonUp = 64;
enum buttonDown = 128;

enum mouseLeft = 1;
enum mouseRight = 2;
enum mouseMiddle = 4;

enum systemPreserveFramebuffer = 1;
enum systemHideGamepadOverlay = 2;

// ┌───────────────────────────────────────────────────────────────────────────┐
// │                                                                           │
// │ Drawing Functions                                                         │
// │                                                                           │
// └───────────────────────────────────────────────────────────────────────────┘

/** Copies pixels to the framebuffer. */
void blit(const ubyte* data, int x, int y, uint width, uint height, uint flags);

/** Copies a subregion within a larger sprite atlas to the framebuffer. */
void blitSub(
    const ubyte* data, int x, int y, uint width, uint height,
    uint srcX, uint srcY, uint stride, uint flags,
);

enum blit2Bpp = 1;
enum blit1Bpp = 0;
enum blitFlipX = 2;
enum blitFlipY = 4;
enum blitRotate = 8;

/** Draws a line between two points. */
void line(int x1, int y1, int x2, int y2);

/** Draws a horizontal line. */
void hline(int x, int y, uint len);

/** Draws a vertical line. */
void vline(int x, int y, uint len);

/** Draws an oval (or circle). */
void oval(int x, int y, uint width, uint height);

/** Draws a rectangle. */
void rect(int x, int y, uint width, uint height);

// /** Draws text using the built-in system font. */
void text(const char* text, int x, int y);

// ┌───────────────────────────────────────────────────────────────────────────┐
// │                                                                           │
// │ Sound Functions                                                           │
// │                                                                           │
// └───────────────────────────────────────────────────────────────────────────┘

/** Plays a sound tone. */
void tone(uint frequency, uint duration, uint volume, uint flags);

enum tonePulse1 = 0;
enum tonePulse2 = 1;
enum toneTriangle = 2;
enum toneNoise = 3;
enum toneMode1 = 0;
enum toneMode2 = 4;
enum toneMode3 = 8;
enum toneMode4 = 12;
enum tonePanLeft = 16;
enum tonePanRight = 32;
enum toneNoteMode = 64;

// ┌───────────────────────────────────────────────────────────────────────────┐
// │                                                                           │
// │ Storage Functions                                                         │
// │                                                                           │
// └───────────────────────────────────────────────────────────────────────────┘

/** Reads up to `size` bytes from persistent storage into the pointer `destPtr`. */
uint diskr(void* dest, uint size);

/** Writes up to `size` bytes from the pointer `srcPtr` into persistent storage. */
uint diskw(const void* src, uint size);

/** Prints a message to the debug console. */
void trace(const char* str);

/** Prints a message to the debug console. */
void tracef(const char* fmt, ...);
