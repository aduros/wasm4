package main

var smiley = [8]byte {
    0b11000011,
    0b10000001,
    0b00100100,
    0b00100100,
    0b00000000,
    0b00100100,
    0b10011001,
    0b11000011,
};

//go:export update
func update () {
    *DRAW_COLORS = 2;
    text("Hello from Go!", 10, 10);

    var gamepad = *GAMEPAD1;
    if (gamepad & BUTTON_1 != 0) {
        *DRAW_COLORS = 4;
    }

    blit(&smiley[0], 76, 76, 8, 8, BLIT_1BPP);
    text("Press X to blink", 16, 90);
}
