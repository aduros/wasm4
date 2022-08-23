const w4 = @import("wasm4.zig");

export fn update() void {
    w4.DRAW_COLORS.* = 2;
    w4.text("Hello from Zig!", 10, 10);

    w4.DRAW_COLORS.* = 2;
    w4.text("ress \\u{0080} to blink", 2, 25);
    w4.DRAW_COLORS.* = 3;
    w4.text("Press \u{0080} to blink", 10, 35);

    w4.DRAW_COLORS.* = 2;
    w4.text("ress \\x80 to blink", 2, 50);
    w4.DRAW_COLORS.* = 3;
    w4.text("Press \x80 to blink", 10, 60);

    w4.DRAW_COLORS.* = 3;
    w4.text("$10/£10/€10.", 10, 80);
    w4.text("Aÿ!!! 하와!!!", 10, 100);
    w4.text("𐍅𐌰𐍃𐌼4!", 10, 110);

    w4.DRAW_COLORS.* = 2;
    w4.text("FFFD}\\u{FFFE}\\u{FFFF", 2, 130);
    w4.DRAW_COLORS.* = 3;
    w4.text("\u{FFFD}\u{FFFE}\u{FFFF}!", 10, 140);
}
