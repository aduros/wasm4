# Drawing Text

import MultiLanguageCode from '@site/src/components/MultiLanguageCode';

To draw some text at position (10, 10):

<MultiLanguageCode>

```typescript
w4.text("Hello world!", 10, 10);
```

```c
text("Hello world!", 10, 10);
```

```c3
w4::text("Hello world!", 10, 10);
```

```d
w4.text("Hello world!", 10, 10);
```

```go
w4.Text("Hello world!", 10, 10)
```

```lua
text("Hello world!", 10, 10)
```

```nim
text("Hello world!", 10, 10)
```

```odin
w4.text("Hello world!", 10, 10)
```

```penne
text("Hello world!", 10, 10);
```

```porth
import proc text int int ptr in end

10 10 "Hello World!"c text
```

```roland
text("Hello world!", 10, 10);
```

```rust
text("Hello world!", 10, 10);
```

```wasm
(import "env" "text" (func $text (param i32 i32 i32)))

;; Put the string at address 0x2000 in memory.
(data (i32.const 0x2000) "Hello world!\00")

(call $text (i32.const 0x2000) (i32.const 10) (i32.const 10))
```

```zig
w4.text("Hello world!", 10, 10);
```

</MultiLanguageCode>

`DRAW_COLORS` color 1 is used as the text color, `DRAW_COLORS` color 2 is used as the background color.

## Special Characters

The WASM-4 font contains 224 characters total.

<img src="/img/charset.png" width="256" height="224" className="pixelated"/>

Aside from text and symbols, many slots are empty. This is because in ASCII, the text format used for the `text()` function, doesn't have any character indexed to it. Moreover, some of them *are* mapped, but as control characters.

The `\n`, for example, is technically a character, but it's mapped to mark a line break.

If we look closely at the font, we'll find four arrows and two buttons, highlighted by a circle.
It's possible to print one of these characters by escaping it's charcode.

| Key         | Escape Character |
|-------------|------------------|
| X button    | `\x80`           |
| Z button    | `\x81`           |
| Left arrow  | `\x84`           |
| Right arrow | `\x85`           |
| Up arrow    | `\x86`           |
| Down arrow  | `\x87`           |

We could use those as instructions for our games!

<MultiLanguageCode>

```typescript
// Press UP to jump!
w4.text("Press \x86 to jump!", 10, 10);
```

```c
// Press UP to jump!
text("Press \x86 to jump!", 10, 10);
```

```c3
// Press UP to jump!
w4::text("Press \x86 to jump!", 10, 10);
```

```d
// Press UP to jump!
w4.text("Press \x86 to jump!", 10, 10);
```

```go
// Press UP to jump!
w4.Text("Press \x86 to jump!", 10, 10)
```

```lua
-- Press UP to jump!
text("Press \x86 to jump!", 10, 10)
```

```nim
# Press UP to jump!
text("Press \x86 to jump!", 10, 10)
```

```odin
// Press UP to jump!
w4.text("Press \x86 to jump!", 10, 10)
```

```penne
text("Press \x86 to jump!", 10, 10);
```

```porth
import proc text int int ptr in end

// Press UP to jump!
10 10 "Press \x86 to jump!"c text
```

```roland
// Press UP to jump!
text("Press \x86 to jump!", 10, 10);
```

```rust
// Press UP to jump!
text(b"Press \x86 to jump!", 10, 10);
```

```wasm
(import "env" "text" (func $text (param i32 i32 i32)))

;; Press UP to jump!
(data (i32.const 0x2000) "Press \86 to jump!\00")

(call $text (i32.const 0x2000) (i32.const 10) (i32.const 10))
```

```zig
// Press UP to jump!
w4.text("Press \x86 to jump!", 10, 10);
```

</MultiLanguageCode>

## Custom Fonts

Since WASM-4 doesn't have a custom font, we have to figure a way to implement our own. One way to approach this is treating a font like a tilemap, except we're indexing characters instead of numbers!

The example below will print a text using the [BitScript sprite font](https://opengameart.org/content/bitscript-a-low-res-handwriting-font):

<MultiLanguageCode>

```typescript
import * as w4 from "./wasm4";

const fontWidth = 208;
const fontFlags = w4.BLIT_1BPP;
const charWidth = 8;
const charHeight = 8;
const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const font = memory.data<u8>([
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x08, 0x1c, 0x1c, 0x3c, 0x18, 0x3e,
  0x1c, 0x26, 0x10, 0x2c, 0x12, 0x08, 0x24, 0x26,
  0x1c, 0x3c, 0x1c, 0x78, 0x1c, 0x3c, 0x62, 0x42,
  0x82, 0xc4, 0x42, 0x66, 0x08, 0x32, 0x22, 0x52,
  0x24, 0x51, 0x22, 0x25, 0x28, 0x14, 0x14, 0x08,
  0x24, 0x26, 0x22, 0x52, 0x22, 0xa4, 0x22, 0x52,
  0x22, 0xa5, 0x44, 0x2a, 0x24, 0x1c, 0x14, 0x52,
  0x20, 0x12, 0x20, 0x10, 0x20, 0x26, 0x28, 0x04,
  0x14, 0x08, 0x2c, 0x24, 0x22, 0x52, 0x22, 0xa4,
  0x20, 0x10, 0x22, 0x24, 0x54, 0x10, 0x24, 0x04,
  0x14, 0x5c, 0x40, 0x22, 0x38, 0x38, 0x4e, 0x7c,
  0x28, 0x08, 0x28, 0x10, 0x54, 0x58, 0x42, 0x14,
  0x44, 0x78, 0x18, 0x10, 0x24, 0x28, 0x54, 0x10,
  0x14, 0x08, 0x24, 0xa4, 0x40, 0x62, 0x40, 0x20,
  0x44, 0x48, 0x10, 0x08, 0x34, 0x30, 0x54, 0x48,
  0x44, 0x20, 0x54, 0x48, 0x04, 0x20, 0x44, 0x28,
  0x2c, 0x28, 0x08, 0x10, 0x3c, 0xa4, 0x42, 0xa4,
  0x44, 0xa0, 0x44, 0xc9, 0x10, 0x48, 0x24, 0x52,
  0x44, 0x4a, 0x44, 0xa0, 0x3a, 0x48, 0x44, 0xa0,
  0x44, 0x10, 0x28, 0xa8, 0x48, 0x38, 0x42, 0x5b,
  0x3c, 0x58, 0x38, 0x40, 0x38, 0x46, 0x68, 0x34,
  0x42, 0x2c, 0x82, 0x84, 0x3a, 0x40, 0x08, 0x86,
  0x38, 0x40, 0x3a, 0x10, 0x48, 0x46, 0x30, 0x66
]);

function drawSpace(x: i32, y: i32, column: i32, line: i32, colors: u16): void {
    store<u16>(w4.DRAW_COLORS, w4.DRAW_COLORS & 0x0F);
    w4.rect(
        x + (column * charWidth),
        y + (line * charHeight),
        charWidth,
        charHeight
    );
    store<u16>(w4.DRAW_COLORS, colors);
}

function write(text: string, x: i32, y: i32, colors: u16): void {
    // Set draw colors...
    store<u16>(w4.DRAW_COLORS, colors);

    // Line and column counters.
    let line  : i32 = 0;
    let column: i32 = 0;

    // Iterate through each character...
    for(let i = 0; i < text.length; i += 1) {
        const char: string = text.charAt(i);
        const charCode: i32 = char.charCodeAt(0);

        // Break into next line when encounter a "\n" (newline)...
        if(charCode === 10) {
            line  += 1;
            column = 0;
            continue;
        }

        // Character index on charset.
        let charIndex: i32 = charset.indexOf(char);

        // Skip invalid characters, spaces, etc.
        if(charIndex < 0 || charIndex >= charset.length) {
            drawSpace(x, y, column, line, colors);
            column += 1;
            continue;
        }

        // Draw character...
        w4.blitSub(
            font,
            x + (column * charWidth),
            y + (line * charHeight),
            charWidth,
            charHeight,
            charIndex * charWidth,
            0,
            fontWidth,
            fontFlags
        );

        // Advance to next column...
        column += 1;
    }
}

export function update (): void {
    write("HELLO WORLD WITH\nOUR CUSTOM FONT", 4, 4, 0x30);
}
```

```penne
import "wasm4.pn";

const FONT_WIDTH: u32 = 208;
const CHAR_WIDTH: u32 = 8;
const CHAR_HEIGHT: u32 = 8;
const CHARSET: [26]u8 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const FONT: [208]u8 = [
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x08, 0x1c, 0x1c, 0x3c, 0x18, 0x3e,
  0x1c, 0x26, 0x10, 0x2c, 0x12, 0x08, 0x24, 0x26,
  0x1c, 0x3c, 0x1c, 0x78, 0x1c, 0x3c, 0x62, 0x42,
  0x82, 0xc4, 0x42, 0x66, 0x08, 0x32, 0x22, 0x52,
  0x24, 0x51, 0x22, 0x25, 0x28, 0x14, 0x14, 0x08,
  0x24, 0x26, 0x22, 0x52, 0x22, 0xa4, 0x22, 0x52,
  0x22, 0xa5, 0x44, 0x2a, 0x24, 0x1c, 0x14, 0x52,
  0x20, 0x12, 0x20, 0x10, 0x20, 0x26, 0x28, 0x04,
  0x14, 0x08, 0x2c, 0x24, 0x22, 0x52, 0x22, 0xa4,
  0x20, 0x10, 0x22, 0x24, 0x54, 0x10, 0x24, 0x04,
  0x14, 0x5c, 0x40, 0x22, 0x38, 0x38, 0x4e, 0x7c,
  0x28, 0x08, 0x28, 0x10, 0x54, 0x58, 0x42, 0x14,
  0x44, 0x78, 0x18, 0x10, 0x24, 0x28, 0x54, 0x10,
  0x14, 0x08, 0x24, 0xa4, 0x40, 0x62, 0x40, 0x20,
  0x44, 0x48, 0x10, 0x08, 0x34, 0x30, 0x54, 0x48,
  0x44, 0x20, 0x54, 0x48, 0x04, 0x20, 0x44, 0x28,
  0x2c, 0x28, 0x08, 0x10, 0x3c, 0xa4, 0x42, 0xa4,
  0x44, 0xa0, 0x44, 0xc9, 0x10, 0x48, 0x24, 0x52,
  0x44, 0x4a, 0x44, 0xa0, 0x3a, 0x48, 0x44, 0xa0,
  0x44, 0x10, 0x28, 0xa8, 0x48, 0x38, 0x42, 0x5b,
  0x3c, 0x58, 0x38, 0x40, 0x38, 0x46, 0x68, 0x34,
  0x42, 0x2c, 0x82, 0x84, 0x3a, 0x40, 0x08, 0x86,
  0x38, 0x40, 0x3a, 0x10, 0x48, 0x46, 0x30, 0x66
];

fn draw_space(x: i32, y: i32, column: u32, line: u32, colors: u16)
{
    DRAW_COLORS = DRAW_COLORS & 0x0F;
    rect(
        x + (column * CHAR_WIDTH) as i32,
        y + (line * CHAR_HEIGHT) as i32,
        CHAR_WIDTH,
        CHAR_HEIGHT
    );
    DRAW_COLORS = colors;
}

fn draw_char(char_index: u32, x: i32, y: i32, column: u32, line: u32)
{
    blitSub(
        FONT,
        x + (column * CHAR_WIDTH) as i32,
        y + (line * CHAR_HEIGHT) as i32,
        CHAR_WIDTH,
        CHAR_HEIGHT,
        char_index * CHAR_WIDTH,
        0,
        FONT_WIDTH,
        BLIT_1BPP,
    );
}

fn write_with_custom_font(text: []u8, x: i32, y: i32, colors: u16)
{
    // Set draw colors...
    DRAW_COLORS = colors;

    // Line and column counters.
    var line: u32 = 0;
    var column: u32 = 0;

    // Iterate through each character...
    var i = 0;
    {
        if i == |text|
            goto end;

        var char_code: u8 = text[i];

        // Break into next line when encounter a "\n" (newline)...
        if char_code == 10
        {
            line = line + 1;
            column = 0;
            goto next;
        }

        // Character index on charset.
        var char_index = 0;
        {
            if char_index == |CHARSET|
                goto not_found;
            if CHARSET[char_index] == char_code
            {
                draw_char(char_index as u32, x, y, column, line);
                goto drawn;
            }
            char_index = char_index + 1;
            loop;
        }

        not_found:
        // Skip invalid characters, spaces, etc.
        draw_space(x, y, column, line, colors);

        drawn:
        // Advance to next column...
        column = column + 1;

        next:
        i = i + 1;
        loop;
    }
    end:
}

pub extern fn update()
{
    write_with_custom_font("HELLO WORLD WITH\nOUR CUSTOM FONT", 4, 4, 0x30);
}
```

```rust
use crate::wasm4::*;

const FONT_WIDTH: u32 = 208;
const FONT_FLAGS: u32 = BLIT_1BPP;
const CHAR_WIDTH: u32 = 8;
const CHAR_HEIGHT: u32 = 8;
const CHARSET: &str = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const FONT: &'static [u8] = &[
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x08, 0x1c, 0x1c, 0x3c, 0x18, 0x3e,
  0x1c, 0x26, 0x10, 0x2c, 0x12, 0x08, 0x24, 0x26,
  0x1c, 0x3c, 0x1c, 0x78, 0x1c, 0x3c, 0x62, 0x42,
  0x82, 0xc4, 0x42, 0x66, 0x08, 0x32, 0x22, 0x52,
  0x24, 0x51, 0x22, 0x25, 0x28, 0x14, 0x14, 0x08,
  0x24, 0x26, 0x22, 0x52, 0x22, 0xa4, 0x22, 0x52,
  0x22, 0xa5, 0x44, 0x2a, 0x24, 0x1c, 0x14, 0x52,
  0x20, 0x12, 0x20, 0x10, 0x20, 0x26, 0x28, 0x04,
  0x14, 0x08, 0x2c, 0x24, 0x22, 0x52, 0x22, 0xa4,
  0x20, 0x10, 0x22, 0x24, 0x54, 0x10, 0x24, 0x04,
  0x14, 0x5c, 0x40, 0x22, 0x38, 0x38, 0x4e, 0x7c,
  0x28, 0x08, 0x28, 0x10, 0x54, 0x58, 0x42, 0x14,
  0x44, 0x78, 0x18, 0x10, 0x24, 0x28, 0x54, 0x10,
  0x14, 0x08, 0x24, 0xa4, 0x40, 0x62, 0x40, 0x20,
  0x44, 0x48, 0x10, 0x08, 0x34, 0x30, 0x54, 0x48,
  0x44, 0x20, 0x54, 0x48, 0x04, 0x20, 0x44, 0x28,
  0x2c, 0x28, 0x08, 0x10, 0x3c, 0xa4, 0x42, 0xa4,
  0x44, 0xa0, 0x44, 0xc9, 0x10, 0x48, 0x24, 0x52,
  0x44, 0x4a, 0x44, 0xa0, 0x3a, 0x48, 0x44, 0xa0,
  0x44, 0x10, 0x28, 0xa8, 0x48, 0x38, 0x42, 0x5b,
  0x3c, 0x58, 0x38, 0x40, 0x38, 0x46, 0x68, 0x34,
  0x42, 0x2c, 0x82, 0x84, 0x3a, 0x40, 0x08, 0x86,
  0x38, 0x40, 0x3a, 0x10, 0x48, 0x46, 0x30, 0x66
];

fn draw_space(x: i32, y: i32, column: u32, line: u32, colors: u16) {
    unsafe { *DRAW_COLORS = *DRAW_COLORS & 0x0F }
    rect(
        x + (column * CHAR_WIDTH) as i32,
        y + (line * CHAR_HEIGHT) as i32,
        CHAR_WIDTH,
        CHAR_HEIGHT
    );
    unsafe { *DRAW_COLORS = colors }
}

pub fn write(text: &str, x: i32, y: i32, colors: u16) {
    // Set draw colors...
    unsafe { *DRAW_COLORS = colors }

    // Line and column counters.
    let mut line: u32 = 0;
    let mut column: u32 = 0;

    // Iterate through each character...
    for c in text.chars() {
        let char_code = c as u32;

        // Break into next line when encounter a "\n" (newline)...
        if char_code == 10 {
            line += 1;
            column = 0;
            continue;
        }

        // Character index on charset.
        let char_index: u32;

        match CHARSET.find(c) {
            Some(x) => char_index = x as u32,

            // Skip invalid characters, spaces, etc.
            None => {
                draw_space(x, y, column, line, colors);
                column += 1;
                continue;
            }
        }

        // Draw character...
        blit_sub(
            FONT,
            x + (column * CHAR_WIDTH) as i32,
            y + (line * CHAR_HEIGHT) as i32,
            CHAR_WIDTH,
            CHAR_HEIGHT,
            char_index * CHAR_WIDTH,
            0,
            FONT_WIDTH,
            FONT_FLAGS
        );

        // Advance to next column...
        column += 1;
    }
}

#[no_mangle]
fn update() {
    custom::write("HELLO WORLD WITH\nOUR CUSTOM FONT", 4, 4, 0x30);
}
```

</MultiLanguageCode>
