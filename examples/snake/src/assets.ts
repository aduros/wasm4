const FRUIT = memory.data<u8>([
    0b11111001,
    0b11110111,
    0b11000011,
    0b10000001,
    0b00000000,
    0b00000000,
    0b10000001,
    0b11000011,
]);

const BRICK = memory.data<u8>([
    0b00000000,
    0b01110111,
    0b00000000,
    0b11011101,
    0b00000000,
    0b01110111,
    0b00000000,
    0b11011101,
]);

const SNAKE_HEAD = memory.data<u8>([
    0b11000011,
    0b10000001,
    0b00100100,
    0b00000000,
    0b00000000,
    0b00000000,
    0b00000000,
    0b10000001,
]);

const SNAKE_BODY = memory.data<u8>([
    0b10000001,
    0b00000000,
    0b00000000,
    0b00000000,
    0b00000000,
    0b00000000,
    0b00000000,
    0b10000001,
]);

export {FRUIT, BRICK, SNAKE_HEAD, SNAKE_BODY};