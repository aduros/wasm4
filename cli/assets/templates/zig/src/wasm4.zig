//
// WASM-4: https://wasm4.org/docs

// ┌───────────────────────────────────────────────────────────────────────────┐
// │                                                                           │
// │ Platform Constants                                                        │
// │                                                                           │
// └───────────────────────────────────────────────────────────────────────────┘

pub const CANVAS_SIZE: u32 = 160;

// ┌───────────────────────────────────────────────────────────────────────────┐
// │                                                                           │
// │ Memory Addresses                                                          │
// │                                                                           │
// └───────────────────────────────────────────────────────────────────────────┘

pub const PALETTE: *[4]u32 = @intToPtr(*[4]u32, 0x04);
pub const DRAW_COLORS: *u16 = @intToPtr(*u16, 0x14);
pub const GAMEPAD1: *const Gamepad = @intToPtr(*const Gamepad, 0x16);
pub const GAMEPAD2: *const Gamepad = @intToPtr(*const Gamepad, 0x17);
pub const GAMEPAD3: *const Gamepad = @intToPtr(*const Gamepad, 0x18);
pub const GAMEPAD4: *const Gamepad = @intToPtr(*const Gamepad, 0x19);

pub const MOUSE: *const Mouse = @intToPtr(*const Mouse, 0x1a);
pub const SYSTEM_FLAGS: *SystemFlags = @intToPtr(*SystemFlags, 0x1f);
pub const FRAMEBUFFER: *[6400]u8 = @intToPtr(*[6400]u8, 0xA0);

pub const Gamepad = packed struct {
    button_1: bool,
    button_2: bool,
    _: u2 = 0,
    button_left: bool,
    button_right: bool,
    button_up: bool,
    button_down: bool,
    comptime {
        if(@sizeOf(@This()) != @sizeOf(u8)) unreachable;
    }

    pub fn format(value: @This(), comptime _: []const u8, _: @import("std").fmt.FormatOptions, writer: anytype) !void {
        if(value.button_1) try writer.writeAll("1");
        if(value.button_2) try writer.writeAll("2");
        if(value.button_left) try writer.writeAll("<");//"←");
        if(value.button_right) try writer.writeAll(">");
        if(value.button_up) try writer.writeAll("^");
        if(value.button_down) try writer.writeAll("v");
    }
};

pub const Mouse = packed struct {
    x: i16,
    y: i16,
    buttons: MouseButtons,
    pub fn pos(mouse: Mouse) Vec2 {
        return .{mouse.x, mouse.y};
    }
    comptime {
        if(@sizeOf(@This()) != 5) unreachable;
    }
};

pub const MouseButtons = packed struct {
    left: bool,
    right: bool,
    middle: bool,
    _: u5 = 0,
    comptime {
        if(@sizeOf(@This()) != @sizeOf(u8)) unreachable;
    }
};

pub const SystemFlags = packed struct {
    preserve_framebuffer: bool,
    hide_gamepad_overlay: bool,
    _: u6 = 0,
    comptime {
        if(@sizeOf(@This()) != @sizeOf(u8)) unreachable;
    }
};

pub const SYSTEM_PRESERVE_FRAMEBUFFER: u8 = 1;
pub const SYSTEM_HIDE_GAMEPAD_OVERLAY: u8 = 2;

// ┌───────────────────────────────────────────────────────────────────────────┐
// │                                                                           │
// │ Drawing Functions                                                         │
// │                                                                           │
// └───────────────────────────────────────────────────────────────────────────┘

/// Copies pixels to the framebuffer.
pub extern fn blit(sprite: [*]const u8, x: i32, y: i32, width: i32, height: i32, flags: u32) void;

/// Copies a subregion within a larger sprite atlas to the framebuffer.
pub extern fn blitSub(sprite: [*]const u8, x: i32, y: i32, width: i32, height: i32, src_x: u32, src_y: u32, stride: i32, flags: u32) void;

pub const BLIT_2BPP: u32 = 1;
pub const BLIT_1BPP: u32 = 0;
pub const BLIT_FLIP_X: u32 = 2;
pub const BLIT_FLIP_Y: u32 = 4;
pub const BLIT_ROTATE: u32 = 8;

/// Draws a line between two points.
pub extern fn line(x1: i32, y1: i32, x2: i32, y2: i32) void;

/// Draws an oval (or circle).
pub extern fn oval(x: i32, y: i32, width: i32, height: i32) void;

/// Draws a rectangle.
pub extern fn rect(x: i32, y: i32, width: u32, height: u32) void;

/// Draws text using the built-in system font.
pub fn text(str: []const u8, x: i32, y: i32) void {
    textUtf8(str.ptr, str.len, x, y);
}
extern fn textUtf8(strPtr: [*]const u8, strLen: usize, x: i32, y: i32) void;

/// Draws a vertical line
pub extern fn vline(x: i32, y: i32, len: u32) void;

/// Draws a horizontal line
pub extern fn hline(x: i32, y: i32, len: u32) void;

// ┌───────────────────────────────────────────────────────────────────────────┐
// │                                                                           │
// │ Sound Functions                                                           │
// │                                                                           │
// └───────────────────────────────────────────────────────────────────────────┘

const externs = struct {
    extern fn tone(frequency: u32, duration: u32, volume: u32, flags: u32) void;
};

/// Plays a sound tone.
pub fn tone(frequency: ToneFrequency, duration: ToneDuration, volume: u32, flags: ToneFlags) void {
    return externs.tone(@bitCast(u32, frequency), @bitCast(u32, duration), volume, @bitCast(u8, flags));
}
pub const ToneFrequency = packed struct {
    start: u16,
    end: u16 = 0,

    comptime {
        if(@sizeOf(@This()) != @sizeOf(u32)) unreachable;
    }
};

pub const ToneDuration = packed struct {
    sustain: u8,
    release: u8 = 0,
    decay: u8 = 0,
    attack: u8 = 0,

    comptime {
        if(@sizeOf(@This()) != @sizeOf(u32)) unreachable;
    }
};

pub const ToneFlags = packed struct {
    pub const Channel = enum(u2) {
        pulse1,
        pulse2,
        triangle,
        noise,
    };
    pub const Mode = enum(u2) {
        p12_5,
        p25,
        p50,
        p75,
    };

    channel: Channel,
    mode: Mode = .p12_5,
    _: u4 = 0,

    comptime {
        if(@sizeOf(@This()) != @sizeOf(u8)) unreachable;
    }
};

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

/// Use with caution, as there's no compile-time type checking.
///
/// * %c, %d, and %x expect 32-bit integers.
/// * %f expects 64-bit floats.
/// * %s expects a *zero-terminated* string pointer.
///
/// See https://github.com/aduros/wasm4/issues/244 for discussion and type-safe
/// alternatives.
pub extern fn tracef(x: [*:0]const u8, ...) void;
