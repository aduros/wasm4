#include "wasm4.h"


void update () {
    *DRAW_COLORS = 2;
    text("Hello from C!", 10, 10);


    *DRAW_COLORS = 2;
    text("Press \\x80 to blink", 10, 25);
    *DRAW_COLORS = 3;
    text("Press \x80 to blink", 10, 35);

    *DRAW_COLORS = 2;
    text("Press \\xC2\\x80 to blink", 10, 50);
    *DRAW_COLORS = 3;
    text("Press \xC2\x80 to blink", 10, 60);

    *DRAW_COLORS = 3;
    text("$10/£10/€10.", 10, 80);
    text("Aÿ!!! 하와!!!", 10, 100);
    text("𐍅𐌰𐍃𐌼4!", 10, 110);

    *DRAW_COLORS = 2;
    text("A\\xFF! \\xA3 10", 10, 130);
    *DRAW_COLORS = 3;
    text("A\xFF! \xA3 10", 10, 140);
}

