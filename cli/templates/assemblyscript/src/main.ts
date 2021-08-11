import * as w4 from "./wasm4";

const face = memory.data<u8>([
    0b11000011,
    0b10000001,
    0b00100100,
    0b00100100,
    0b00000000,
    0b00100100,
    0b10011001,
    0b11000011,
]);

let x = 76;
let y = 76;

export function update () :void {
    // const gamepad = load<u8>(w4.GAMEPAD1);
    // if (gamepad & w4.BUTTON_LEFT) {
    //     x--;
    // }
    // if (gamepad & w4.BUTTON_RIGHT) {
    //     x++;
    // }
    // if (gamepad & w4.BUTTON_UP) {
    //     y--;
    // }
    // if (gamepad & w4.BUTTON_DOWN) {
    //     y++;
    // }
    //
    // store<u16>(w4.DRAW_COLORS, 0x10);
    w4.drawText("Hello world!", 10, 10);
    w4.print("Hi there 123");
    //
    // store<u16>(w4.DRAW_COLORS, 0x02);
    // w4.blit(face, x, y, 8, 8, 0);
}
