import * as w4 from "./wasm4";

const smiley = memory.data<u8>([
    0b11000011,
    0b10000001,
    0b00100100,
    0b00100100,
    0b00000000,
    0b00100100,
    0b10011001,
    0b11000011,
]);

export function update (): void {
    store<u16>(w4.DRAW_COLORS, 2);
    w4.text("Hello from\nAssemblyScript!", 10, 10);

    const gamepad = load<u8>(w4.GAMEPAD1);
    if (gamepad & w4.BUTTON_1) {
        store<u16>(w4.DRAW_COLORS, 4);
    }

    w4.blit(smiley, 76, 76, 8, 8, w4.BLIT_1BPP);
    w4.text("Press X to blink", 16, 90);
}
