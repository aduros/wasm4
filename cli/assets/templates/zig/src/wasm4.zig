//
// WASM-4: https://wasm4.org/docs

const std = @import("std");

fn assert_equal(a: anytype, b: anytype, comptime error_msg: []const u8) void {
    if (a != b) @compileError(std.fmt.comptimePrint("{} != {}  {s}", .{a, b, error_msg}));
}

comptime {
    const builtin = @import("builtin");
    const native_endian = builtin.target.cpu.arch.endian();
    assert_equal(native_endian, .Little, "Bit flags need little endian");
}

// ┌───────────────────────────────────────────────────────────────────────────┐
// │                                                                           │
// │ Platform Constants                                                        │
// │                                                                           │
// └───────────────────────────────────────────────────────────────────────────┘

pub const SCREEN_SIZE: u32 = 160;

// ┌───────────────────────────────────────────────────────────────────────────┐
// │                                                                           │
// │ Memory Addresses                                                          │
// │                                                                           │
// └───────────────────────────────────────────────────────────────────────────┘

pub const Memory = packed struct {
    _padding: [4]u8,
    palette: [4]Color,
    colors: DrawColors,
    gamepads: [4]GamePad,
    mouse: Mouse,
    system: SystemFlags,
    _reserved: [128]u8,
    framebuffer: [6400]u8,
    userdata: [58976]u8,
};

comptime {
    assert_equal(@bitSizeOf(Memory), 64 * 1024 * 8, "Memory layout wrong");
}

pub const m = @intToPtr(*allowzero Memory, 0);

pub const Color = packed struct {
    blue  : u8,
    green : u8,
    red   : u8,
    _reserved: u8 = 0,
};

pub const DrawColors = packed struct {
    _0: ColorIndex,
    _1: ColorIndex,
    _2: ColorIndex,
    _3: ColorIndex,
};

pub const ColorIndex = enum(u4) {
    transparent = 0,
    /// Use palette[0]
    p0   = 1,
    /// Use palette[1]
    p1   = 2,
    /// Use palette[2]
    p2   = 3,
    /// Use palette[3]
    p3   = 4,
};

pub const GamePad = packed struct {
    x: bool,
    z: bool,
    _reserved: u2,
    left: bool,
    right: bool,
    up: bool,
    down: bool,
};

pub const Mouse = packed struct {
    x: i16,
    y: i16,
    /// primary button
    b0: bool,
    /// secondary button
    b1: bool,
    /// third button
    b2: bool,
    _reserved: u5,
};

pub const SystemFlags = packed struct {
    preserve_framebuffer: bool,
    hide_gamepad_overlay: bool,
    _reserved: u6,
};

// ┌───────────────────────────────────────────────────────────────────────────┐
// │                                                                           │
// │ Raw Functions                                                             │
// │                                                                           │
// └───────────────────────────────────────────────────────────────────────────┘

const raw_api = struct {
    extern fn blit(sprite: [*]const u8, x: u32, y: u32, width: u32, height: u32, flags: u32) void;
    extern fn blitSub(sprite: [*]const u8, x: u32, y: u32, width: u32, height: u32, src_x: u32, src_y: u32, stride: u32, flags: u32) void;
    extern fn tone(frequency: u32, duration: u32, volume: u32, flags: u32) void;
};

// ┌───────────────────────────────────────────────────────────────────────────┐
// │                                                                           │
// │ Drawing Functions                                                         │
// │                                                                           │
// └───────────────────────────────────────────────────────────────────────────┘

pub const BlitFlags = packed struct {
    /// one or two bits per pixel
    two_bits:  bool = false,
    flip_x: bool = false,
    flip_y: bool = false,
    rotate: bool = false,
    _reserved: u28 = 0,
};

/// Copies pixels to the framebuffer.
pub fn blit(sprite: []const u8, x: u32, y: u32, width: u32, height: u32, flags: BlitFlags) void {
    
    raw_api.blit(sprite.ptr, x, y, width, height, @bitCast(u32, flags));
}

/// Copies a subregion within a larger sprite atlas to the framebuffer.
/// srcX: Source X position of the sprite region.
/// srcY: Source Y position of the sprite region.
/// stride: Total width of the overall sprite atlas. This is typically larger than width.
pub fn blitSub(sprite: []const u8, x: u32, y: u32, width: u32, height: u32, src_x: u32, src_y: u32, stride: u32, flags: BlitFlags) void {
    raw_api.blitSub(sprite.ptr, x, y, width, height, src_x, src_y, stride, @bitCast(u32, flags));
}

/// Draws a line between two points.
pub extern fn line(x1: u32, y1: u32, x2: u32, y2: u32) void;

/// Draws an oval (or circle).
pub extern fn oval(x: u32, y: u32, width: u32, height: u32) void;

/// Draws a rectangle.
pub extern fn rect(x: u32, y: u32, width: u32, height: u32) void;

/// Draws text using the built-in system font.
pub fn text(str: []const u8, x: u32, y: u32) void {
    textUtf8(str.ptr, str.len, x, y);
}
extern fn textUtf8(strPtr: [*]const u8, strLen: usize, x: u32, y: u32) void;

/// Draws a vertical line
pub extern fn vline(x: u32, y: u32, len: u32) void;

/// Draws a horizontal line
pub extern fn hline(x: u32, y: u32, len: u32) void;

// ┌───────────────────────────────────────────────────────────────────────────┐
// │                                                                           │
// │ Sound Functions                                                           │
// │                                                                           │
// └───────────────────────────────────────────────────────────────────────────┘

/// Plays a sound tone.
/// frequency: Wave frequency in hertz.
/// duration: Duration of the tone in frames (1/60th of a second), up to 255 frames.
/// volume: Volume of the sustain and attack durations, between 0 and 100.
pub fn tone(frequency: Tone.Frequency, duration: Tone.Duration, volume: Tone.Volume, flags: Tone.Flags) void {
    std.debug.assert(volume.is_valid());
    tone(@bitCast(u32, frequency), @bitCast(u32, duration), @bitCast(u32, volume), @bitCast(u32, flags));
}

pub const Tone = struct {
    /// Wave frequency in hertz.
    pub const Frequency = packed struct {
        start: u16,
        end: u16 = 0,
    };
    
    /// Duration of ADSR of note (unit: frames)
    ///
    ///          ^
    ///         / \ decay
    /// attack /   \ 
    ///       /     \--------
    ///      /       sustain \ release
    ///     /                 \
    pub const Duration = packed struct {
        sustain : u8 = 0,
        release : u8 = 0,
        decay   : u8 = 0,
        attack  : u8 = 0,
    };
    
    /// Volume of note (0 to 100)
    ///
    ///          ^  <-- attack volume
    ///         / \
    ///        /   \ 
    ///       /     \--------  <-- sustain valume
    ///      /               \
    ///     /                 \
    pub const Volume = packed struct {
        sustain : u8 = 100,
        attack  : u8 = 100,

        pub fn is_valid(volume: @This()) bool {
            return (0 <= volume.sustain) and (volume.sustain <= 100)
               and (0 <= volume.attack ) and (volume.attack  <= 100);
        }
    };

    pub const Flags = packed struct {
        channel: Channel,
        pulse_duty: DutyCycle,
    };

    pub const Channel = enum(u2) {
        pulse0 = 0,
        pulse1 = 1,
        triangle = 2,
        noise = 3,
    };

    pub const DutyCycle = enum(u2) {
        @"1/8" = 0,
        @"1/4" = 1,
        @"1/2" = 2,
        @"3/4" = 3, 
    };
};

pub const TONE_MODE1: u32 = 0;
pub const TONE_MODE2: u32 = 4;
pub const TONE_MODE3: u32 = 8;
pub const TONE_MODE4: u32 = 12;
pub const TONE_PAN_LEFT: u32 = 16;
pub const TONE_PAN_RIGHT: u32 = 32;

// ┌───────────────────────────────────────────────────────────────────────────┐
// │                                                                           │
// │ Storage Functions                                                         │
// │                                                                           │
// └───────────────────────────────────────────────────────────────────────────┘

/// Reads up to `size` bytes from persistent storage into the pointer `dest`.
pub extern fn diskr(dest: [*]u8, size: u32) u32;

/// Writes up to `size` bytes from the pointer `src` into persistent storage.
pub extern fn diskw(src: [*]const u8, size: u32) u32;

// ┌───────────────────────────────────────────────────────────────────────────┐
// │                                                                           │
// │ Other Functions                                                           │
// │                                                                           │
// └───────────────────────────────────────────────────────────────────────────┘

/// Prints a message to the debug console.
pub fn trace(x: []const u8) void {
    traceUtf8(x.ptr, x.len);
}
extern fn traceUtf8(strPtr: [*]const u8, strLen: usize) void;
