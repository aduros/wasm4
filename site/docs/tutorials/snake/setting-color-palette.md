---
sidebar_label: Setting Color Palette
---

import MultiLanguageCode from '@site/src/components/MultiLanguageCode';

# Setting Color Palette

## The default color palette

In WASM-4, you can set 4 colors to your liking. The default color palette looks like this:

<div className="row row--no-gutters">
    <div className="col col--2" style={{padding: "1.5rem", background: "#e0f8cf", color: "#000"}}>Color 1: #e0f8cf</div>
    <div className="col col--2" style={{padding: "1.5rem", background: "#86c06c", color: "#000"}}>Color 2: #86c06c</div>
    <div className="col col--2" style={{padding: "1.5rem", background: "#306850", color: "#fff"}}>Color 3: #306850</div>
    <div className="col col--2" style={{padding: "1.5rem", background: "#071821", color: "#fff"}}>Color 4: #071821</div>
</div>

It's inspired by the color palette of the original gameboy. But you can set your own palette too.

## Picking a color palette

There are a lot of different color palettes available. One of the most famous is probably https://lospec.com/palette-list.

You can set the number of colors to 4 and get a lot of palettes presented. For this tutorial, I'll pick the [EN4 Palette](https://lospec.com/palette-list/en4).

<div className="row row--no-gutters">
    <div className="col col--2" style={{padding: "1.5rem", background: "#fbf7f3", color: "#000"}}>Color 1: #fbf7f3</div>
    <div className="col col--2" style={{padding: "1.5rem", background: "#e5b083", color: "#000"}}>Color 2: #e5b083</div>
    <div className="col col--2" style={{padding: "1.5rem", background: "#426e5d", color: "#fff"}}>Color 3: #426e5d</div>
    <div className="col col--2" style={{padding: "1.5rem", background: "#20283d", color: "#fff"}}>Color 4: #20283d</div>
</div>

This palette provides enough "green" for the snake and a "not green" for the fruit. Also the background is fine.

## Setting in source

Once you've picked a color palette, it's time to actually set it. Let's look at the `hello world` example:

<MultiLanguageCode>

```typescript
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
```

```c
#include "wasm4.h"

const uint8_t smiley[] = {
    0b11000011,
    0b10000001,
    0b00100100,
    0b00100100,
    0b00000000,
    0b00100100,
    0b10011001,
    0b11000011,
};

void update () {
    *DRAW_COLORS = 2;
    text("Hello from C!", 10, 10);

    uint8_t gamepad = *GAMEPAD1;
    if (gamepad & BUTTON_1) {
        *DRAW_COLORS = 4;
    }

    blit(smiley, 76, 76, 8, 8, BLIT_1BPP);
    text("Press X to blink", 16, 90);
}
```

```rust
#[cfg(feature = "buddy-alloc")]
mod alloc;
mod wasm4;
use wasm4::*;

#[rustfmt::skip]
const SMILEY: [u8; 8] = [
    0b11000011,
    0b10000001,
    0b00100100,
    0b00100100,
    0b00000000,
    0b00100100,
    0b10011001,
    0b11000011,
];

#[no_mangle]
fn update() {
    unsafe { *DRAW_COLORS = 2 }
    text("Hello from Rust!", 10, 10);

    let gamepad = unsafe { *GAMEPAD1 };
    if gamepad & BUTTON_1 != 0 {
        unsafe { *DRAW_COLORS = 4 }
    }

    blit(&SMILEY, 76, 76, 8, 8, BLIT_1BPP);
    text("Press X to blink", 16, 90);
}
```

```go
package main

import "cart/w4"

var smiley = [8]byte{
	0b11000011,
	0b10000001,
	0b00100100,
	0b00100100,
	0b00000000,
	0b00100100,
	0b10011001,
	0b11000011,
}

//go:export update
func update() {
	*w4.DRAW_COLORS = 2
	w4.Text("Hello from Go!", 10, 10)

	var gamepad = *w4.GAMEPAD1
	if gamepad&w4.BUTTON_1 != 0 {
		*w4.DRAW_COLORS = 4
	}

	w4.Blit(&smiley[0], 76, 76, 8, 8, w4.BLIT_1BPP)
	w4.Text("Press X to blink", 16, 90)
}
```

</MultiLanguageCode>

There's a lot going on. First it defines a sprite. And in the update-function:
- Set the draw color to 2
- Print some text
- If "Button 1" on "Gamepad 1" is pressed, change the draw color to 4
- Draw the smiley
- Print some more text

To change the color palette, we can use the "start" function of WASM-4:

<MultiLanguageCode>

```typescript
export function start (): void {
    store<u32>(w4.PALETTE, 0xfbf7f3, 0 * sizeof<u32>());
    store<u32>(w4.PALETTE, 0xe5b083, 1 * sizeof<u32>());
    store<u32>(w4.PALETTE, 0x426e5d, 2 * sizeof<u32>());
    store<u32>(w4.PALETTE, 0x20283d, 3 * sizeof<u32>());
}
```

```c
void start () {
    PALETTE[0] = 0xfbf7f3;
    PALETTE[1] = 0xe5b083;
    PALETTE[2] = 0x426e5d;
    PALETTE[3] = 0x20283d;
}
```

```rust
#[no_mangle]
fn start() {
    unsafe {
        *PALETTE = [
            0xfbf7f3,
            0xe5b083,
            0x426e5d,
            0x20283d,
        ];
    }
}
```

```go
//go:export start
func start() {
    w4.PALETTE[0] = 0xfbf7f3
    w4.PALETTE[1] = 0xe5b083
    w4.PALETTE[2] = 0x426e5d
    w4.PALETTE[3] = 0x20283d
}
```

</MultiLanguageCode>
