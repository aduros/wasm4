// WASM-4: https://wasm4.org/docs
package wasm4

foreign import wasm4 "env"

#assert(size_of(int) == size_of(u32))

// ┌───────────────────────────────────────────────────────────────────────────┐
// │                                                                           │
// │ Platform Constants                                                        │
// │                                                                           │
// └───────────────────────────────────────────────────────────────────────────┘

SCREEN_SIZE :: 160

PALETTE       := (^Palette)(uintptr(0x04))
DRAW_COLORS   := (^u16)(uintptr(0x14))
GAMEPAD1      := (^Buttons)(uintptr(0x16))
GAMEPAD2      := (^Buttons)(uintptr(0x17))
GAMEPAD3      := (^Buttons)(uintptr(0x18))
GAMEPAD4      := (^Buttons)(uintptr(0x19))
MOUSE_X       := (^i16)(uintptr(0x1a))
MOUSE_Y       := (^i16)(uintptr(0x1c))
MOUSE_BUTTONS := (^Mouse_Buttons)(uintptr(0x1e))
SYSTEM_FLAGS  := (^System_Flags)(uintptr(0x1f))
FRAMEBUFFER   := (^[6400]u8)(uintptr(0xa0)) // 4 bits * (160*160)

Palette :: distinct [4]u32

Buttons :: distinct bit_set[Button; u8]
Button :: enum u8 {
	A     = 0,
	B     = 1,
	_     = 2,
	_     = 3,
	LEFT  = 4,
	RIGHT = 5,
	UP    = 6,
	DOWN  = 7,
}

Mouse_Buttons :: distinct bit_set[Mouse_Button; u8]
Mouse_Button :: enum u8 {
	LEFT   = 0,
	RIGHT  = 1,
	MIDDLE = 2,
}

System_Flags :: distinct bit_set[System_Flag; u8]
System_Flag :: enum u8 {
	PRESERVE_FRAMEBUFFER = 0,
	HIDE_GAMEPAD_OVERLAY = 1,
}

// ┌───────────────────────────────────────────────────────────────────────────┐
// │                                                                           │
// │ Drawing Functions                                                         │
// │                                                                           │
// └───────────────────────────────────────────────────────────────────────────┘

Blit_Flag :: enum u32 {
	USE_2BPP      = 0, // 1BPP by default
	FLIPX         = 1,
	FLIPY         = 2,
	ROTATE_CCW_90 = 3,
}
Blit_Flags :: distinct bit_set[Blit_Flag; u32]

@(default_calling_convention="c")
foreign wasm4 {
	// Copies pixels to the framebuffer.
	blit :: proc(sprite: [^]u8, x, y: i32, width, height: u32, flags: Blit_Flags = nil) ---
	
	// Copies a subregion within a larger sprite atlas to the framebuffer.
	@(link_name="blitSub")
	blit_sub :: proc(sprite: [^]u8, x, y: i32, width, height: u32, src_x, src_y: u32, stride: int, flags: Blit_Flags = nil) ---
	
	// Draws a line between two points.
	line :: proc(x1, y1, x2, y2: i32) ---
	
	// Draws a horizontal line.
	hline :: proc(x, y: i32, len: u32) ---
	
	// Draws a vertical line.
	vline :: proc(x, y: i32, len: u32) ---
	
	// Draws an oval (or circle).
	oval :: proc(x, y: i32, width, height: u32) ---
	
	// Draws a rectangle.
	rect :: proc(x, y: i32, width, height: u32) ---
	
	// Draws text using the built-in system font.
	@(link_name="textUtf8")
	text :: proc(text: string, x, y: i32) ---
}

// ┌───────────────────────────────────────────────────────────────────────────┐
// │                                                                           │
// │ Sound Functions                                                           │
// │                                                                           │
// └───────────────────────────────────────────────────────────────────────────┘

Tone_Channel :: enum u32 {
	Pulse1   = 0,
	Pulse2   = 1,
	Triangle = 2,
	Noise    = 3,
}
Tone_Duty_Cycle :: enum u32 {
	Eigth          = 0,  // 1/8
	Quarter        = 4,  // 1/4
	Half           = 8,  // 1/2
	Three_Quarters = 12, // 3/4
}
Tone_Pan :: enum u32 {
	Center = 0,
	Left   = 16,
	Right  = 32,
}

Tone_Duration :: struct {
	attack:  u8, // in frames
	delay:   u8, // in frames
	release: u8, // in frames
	sustain: u8, // in frames
}


@(private)
foreign wasm4 {
	@(link_name="tone")
	internal_tone :: proc(frequency: u32, duration_in_frames: u32, volume_percent: u32, flags: u32) ---
}

// Plays a sound tone.
tone :: proc "c" (frequency: u32, duration: u32, volume_percent: u32, channel: Tone_Channel, duty_cycle := Tone_Duty_Cycle.Eigth, pan := Tone_Pan.Center) {
	flags := u32(channel) | u32(duty_cycle) | u32(pan)
	internal_tone(frequency, duration, volume_percent, flags)
}

tone_complex :: proc "c" (start_frequency, end_frequency: u16, duration: Tone_Duration, volume_percent: u32, channel: Tone_Channel, duty_cycle := Tone_Duty_Cycle.Eigth, pan := Tone_Pan.Center) {
	flags := u32(channel) | u32(duty_cycle) | u32(pan)
	frequency := u32(start_frequency) | u32(end_frequency)<<16
	duration_in_frames := u32(duration.attack)<<24 | u32(duration.delay)<<16 | u32(duration.release)<<8 | u32(duration.sustain)
	
	internal_tone(frequency, duration_in_frames, volume_percent, flags)
}



// ┌───────────────────────────────────────────────────────────────────────────┐
// │                                                                           │
// │ Storage Functions                                                         │
// │                                                                           │
// └───────────────────────────────────────────────────────────────────────────┘

@(default_calling_convention="c")
foreign wasm4 {
	// Reads up to `size` bytes from persistent storage into the pointer `destPtr`.
	diskr :: proc(dst: rawptr, size: int) -> int ---
	// Writes up to `size` bytes from the pointer `srcPtr` into persistent storage.
	diskw :: proc(src: rawptr, size: int) -> int ---
}

// ┌───────────────────────────────────────────────────────────────────────────┐
// │                                                                           │
// │ Other Functions                                                           │
// │                                                                           │
// └───────────────────────────────────────────────────────────────────────────┘

@(default_calling_convention="c")
foreign wasm4 {
	// Prints a message to the debug console.
	@(link_name="traceUtf8")
	trace :: proc(text: string) ---
	// Prints a message to the debug console, with a format string.
	// These formats are supported: 
	// %c: Character
	// %d: Decimal
	// %f: Float (Cast ints to float with f64(your_int))
	// %s: String
	// %x: Hex
	tracef :: proc(fmt:cstring, #c_vararg args: ..any) ---
	
}

