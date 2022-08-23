#[cfg(feature = "buddy-alloc")]
mod alloc;
mod wasm4;
use wasm4::*;

#[no_mangle]
fn update() {
    unsafe { *DRAW_COLORS = 3 }
    text("Press X to blink", 10, 10);
    unsafe { *DRAW_COLORS = 2 }
    text("ress \\u{0080} to blink", 2, 25);
    unsafe { *DRAW_COLORS = 3 }
    text("Press \u{0080} to blink", 10, 35);

    unsafe { *DRAW_COLORS = 2 }
    text("8_unchecked(&[0x80])", 2, 50);
    unsafe { *DRAW_COLORS = 3 }
    text("Press ", 10, 60);
    text(unsafe { std::str::from_utf8_unchecked(&[0x80]) }, 64, 60);
    text("to blink", 80, 60);

    unsafe { *DRAW_COLORS = 3 }
    text("$10/£10/€10.", 10, 80);
    text("Aÿ!!! 하와!!!", 10, 100);
    text("𐍅𐌰𐍃𐌼4!", 10, 120);
    text("\u{FFFD}\u{FFFE}\u{FFFF}!", 10, 140);
}
