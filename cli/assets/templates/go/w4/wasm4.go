//
// WASM-4: https://wasm4.org/docs

package w4

import "unsafe"

// ┌───────────────────────────────────────────────────────────────────────────┐
// │                                                                           │
// │ Platform Constants                                                        │
// │                                                                           │
// └───────────────────────────────────────────────────────────────────────────┘

const SCREEN_SIZE int = 160
const FONT_SIZE int = 8

// ┌───────────────────────────────────────────────────────────────────────────┐
// │                                                                           │
// │ Memory Addresses                                                          │
// │                                                                           │
// └───────────────────────────────────────────────────────────────────────────┘

var (
	PALETTE       = (*[4]uint32)(unsafe.Pointer(uintptr(0x04)))
	DRAW_COLORS   = (*uint16)(unsafe.Pointer(uintptr(0x14)))
	GAMEPAD1      = (*uint8)(unsafe.Pointer(uintptr(0x16)))
	GAMEPAD2      = (*uint8)(unsafe.Pointer(uintptr(0x17)))
	GAMEPAD3      = (*uint8)(unsafe.Pointer(uintptr(0x18)))
	GAMEPAD4      = (*uint8)(unsafe.Pointer(uintptr(0x19)))
	MOUSE_X       = (*int16)(unsafe.Pointer(uintptr(0x1a)))
	MOUSE_Y       = (*int16)(unsafe.Pointer(uintptr(0x1c)))
	MOUSE_BUTTONS = (*uint8)(unsafe.Pointer(uintptr(0x1e)))
	SYSTEM_FLAGS  = (*uint8)(unsafe.Pointer(uintptr(0x1f)))
	NETPLAY       = (*uint8)(unsafe.Pointer(uintptr(0x20)))
	FRAMEBUFFER   = (*[6400]uint8)(unsafe.Pointer(uintptr(0xa0)))
)

const (
	BUTTON_1     byte = 1
	BUTTON_2     byte = 2
	BUTTON_LEFT  byte = 16
	BUTTON_RIGHT byte = 32
	BUTTON_UP    byte = 64
	BUTTON_DOWN  byte = 128
)

const (
	MOUSE_LEFT   byte = 1
	MOUSE_RIGHT  byte = 2
	MOUSE_MIDDLE byte = 4
)

const (
	SYSTEM_PRESERVE_FRAMEBUFFER byte = 1
	SYSTEM_HIDE_GAMEPAD_OVERLAY byte = 2
)

// ┌───────────────────────────────────────────────────────────────────────────┐
// │                                                                           │
// │ Drawing Functions                                                         │
// │                                                                           │
// └───────────────────────────────────────────────────────────────────────────┘

/** Copies pixels to the framebuffer. */
//go:export blit
func Blit(sprite *byte, x int, y int, width uint, height uint, flags uint)

/** Copies a subregion within a larger sprite atlas to the framebuffer. */
//go:export blitSub
func BlitSub(sprite *byte, x int, y int, width uint, height uint,
	srcX uint, srcY uint, stride int, flags uint)

const (
	BLIT_2BPP   = 1
	BLIT_1BPP   = 0
	BLIT_FLIP_X = 2
	BLIT_FLIP_Y = 4
	BLIT_ROTATE = 8
)

/** Draws a line between two points. */
//go:export line
func Line(x1 int, y1 int, x2 int, y2 int)

/** Draws a horizontal line. */
//go:export hline
func HLine(x int, y int, len uint)

/** Draws a vertical line. */
//go:export vline
func VLine(x int, y int, len uint)

/** Draws an oval (or circle). */
//go:export oval
func Oval(x int, y int, width uint, height uint)

/** Draws a rectangle. */
//go:export rect
func Rect(x int, y int, width uint, height uint)

/** Draws text using the built-in system font. */
//go:export textUtf8
func Text(text string, x int, y int)

// ┌───────────────────────────────────────────────────────────────────────────┐
// │                                                                           │
// │ Sound Functions                                                           │
// │                                                                           │
// └───────────────────────────────────────────────────────────────────────────┘

/** Plays a sound tone. */
//go:export tone
func Tone(frequency uint, duration uint, volume uint, flags uint)

const (
	TONE_PULSE1    = 0
	TONE_PULSE2    = 1
	TONE_TRIANGLE  = 2
	TONE_NOISE     = 3
	TONE_MODE1     = 0
	TONE_MODE2     = 4
	TONE_MODE3     = 8
	TONE_MODE4     = 12
	TONE_PAN_LEFT  = 16
	TONE_PAN_RIGHT = 32
	TONE_NOTE_MODE = 64
)

// ┌───────────────────────────────────────────────────────────────────────────┐
// │                                                                           │
// │ Storage Functions                                                         │
// │                                                                           │
// └───────────────────────────────────────────────────────────────────────────┘

/** Reads up to `size` bytes from persistent storage into the pointer `destPtr`. */
//go:export diskr
func DiskR(ptr unsafe.Pointer, count uint) uint

/** Writes up to `size` bytes from the pointer `srcPtr` into persistent storage. */
//go:export diskw
func DiskW(src unsafe.Pointer, count uint) uint

// ┌───────────────────────────────────────────────────────────────────────────┐
// │                                                                           │
// │ Other Functions                                                           │
// │                                                                           │
// └───────────────────────────────────────────────────────────────────────────┘

/** Prints a message to the debug console. */
//go:export traceUtf8
func Trace(str string)

// TinyGo requires a main function, so provide one
//
//go:linkname main main.main
func main() {}
