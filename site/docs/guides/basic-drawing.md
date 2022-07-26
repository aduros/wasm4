import MultiLanguageCode from '@site/src/components/MultiLanguageCode';

# Basic Drawing

## The `PALETTE` Register

WASM-4 can only display 4 colors on screen at a time. This palette's RGB values are stored in the `PALETTE` memory register, and can be modified.

For example, to change the palette to [Ice Cream GB](https://lospec.com/palette-list/ice-cream-gb):

<MultiLanguageCode>

```typescript
store<u32>(w4.PALETTE, 0xfff6d3, 0 * sizeof<u32>());
store<u32>(w4.PALETTE, 0xf9a875, 1 * sizeof<u32>());
store<u32>(w4.PALETTE, 0xeb6b6f, 2 * sizeof<u32>());
store<u32>(w4.PALETTE, 0x7c3f58, 3 * sizeof<u32>());
```

```c
PALETTE[0] = 0xfff6d3;
PALETTE[1] = 0xf9a875;
PALETTE[2] = 0xeb6b6f;
PALETTE[3] = 0x7c3f58;
```

```d
w4.palette[0] = 0xfff6d3;
w4.palette[1] = 0xf9a875;
w4.palette[2] = 0xeb6b6f;
w4.palette[3] = 0x7c3f58;
```

```go
w4.PALETTE[0] = 0xfff6d3
w4.PALETTE[1] = 0xf9a875
w4.PALETTE[2] = 0xeb6b6f
w4.PALETTE[3] = 0x7c3f58
```

```lua
PALETTE[0] = 0xfff6d3
PALETTE[1] = 0xf9a875
PALETTE[2] = 0xeb6b6f
PALETTE[3] = 0x7c3f58
```

```nim
PALETTE[0] = 0xfff6d3
PALETTE[1] = 0xf9a875
PALETTE[2] = 0xeb6b6f
PALETTE[3] = 0x7c3f58
```

```odin
w4.PALETTE[0] = 0xfff6d3
w4.PALETTE[1] = 0xf9a875
w4.PALETTE[2] = 0xeb6b6f
w4.PALETTE[3] = 0x7c3f58
```

```porth
0xfff6d3 $PALETTE0 !int
0xf9a875 $PALETTE1 !int
0xeb6b6f $PALETTE2 !int
0x7c3f58 $PALETTE3 !int
```

```roland
PALETTE~ = [
   0xfff6d3,
   0xf9a875,
   0xeb6b6f,
   0x7c3f58,
];
```

```rust
unsafe {
    *PALETTE = [
        0xfff6d3,
        0xf9a875,
        0xeb6b6f,
        0x7c3f58,
    ];
}
```

```wasm
(i32.store (global.get $PALETTE0) (i32.const 0xfff6d3))
(i32.store (global.get $PALETTE1) (i32.const 0xf9a875))
(i32.store (global.get $PALETTE2) (i32.const 0xeb6b6f))
(i32.store (global.get $PALETTE3) (i32.const 0x7c3f58))
```

```zig
w4.PALETTE.* = .{
    0xfff6d3,
    0xf9a875,
    0xeb6b6f,
    0x7c3f58,
};
```

</MultiLanguageCode>

The default Gameboy-ish palette looks like this:

<div className="row row--no-gutters">
    <div className="col col--2" style={{padding: "1.5rem", background: "#e0f8cf", color: "#000"}}>Color 1</div>
    <div className="col col--2" style={{padding: "1.5rem", background: "#86c06c", color: "#000"}}>Color 2</div>
    <div className="col col--2" style={{padding: "1.5rem", background: "#306850", color: "#fff"}}>Color 3</div>
    <div className="col col--2" style={{padding: "1.5rem", background: "#071821", color: "#fff"}}>Color 4</div>
</div>

The first color in the palette register is used as the screen background color.

## The `DRAW_COLORS` Register

All drawing functions are affected by the `DRAW_COLORS` memory register. `DRAW_COLORS` is a 16 bit value that can store up to 4 colors, using 4 bits each.

For example, `rect()` uses the first draw color for the fill color, and the
second draw color as the outline color. To draw a light-green (palette color 2)
rectangle with a black (palette color 4) outline:

<MultiLanguageCode>

```typescript
store<u16>(w4.DRAW_COLORS, 0x42);
w4.rect(10, 10, 32, 32);
```

```c
*DRAW_COLORS = 0x42;
rect(10, 10, 32, 32);
```

```d
*w4.drawColors = 0x42;
w4.rect(10, 10, 32, 32);
```

```go
*w4.DRAW_COLORS = 0x42
w4.Rect(10, 10, 32, 32)
```

```lua
$DRAW_COLORS = 0x42
rect(10, 10, 32, 32)
```

```nim
DRAW_COLORS[] = 0x42
rect(10, 10, 32, 32)
```

```odin
w4.DRAW_COLORS^ = 0x42
w4.rect(10, 10, 32, 32)
```

```porth
0x42 $DRAW_COLORS !16
32 32 10 10 rect
```

```roland
DRAW_COLORS~ = 0x42;
rect(10, 10, 32, 32);
```

```rust
unsafe { *DRAW_COLORS = 0x42 }
rect(10, 10, 32, 32);
```

```wasm
;; Set DRAW_COLORS to 0x42.
(i32.store16 (global.get $DRAW_COLORS) (i32.const 0x42))

;; Draw a rectangle at (10, 10) with size (32, 32).
(call $rect (i32.const 10) (i32.const 10) (i32.const 32) (i32.const 32))
```

```zig
w4.DRAW_COLORS.* = 0x42;
w4.rect(10, 10, 32, 32);
```

</MultiLanguageCode>

A value of `0` in a draw color means it will be transparent. For example, to
draw a black outlined rectangle with no fill, set `DRAW_COLORS` to `0x40`.

## Drawing Text

To draw some text at position (10, 10):

<MultiLanguageCode>

```typescript
w4.text("Hello world!", 10, 10);
```

```c
text("Hello world!", 10, 10);
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

:::note
There is no way to use a custom font with this function. To draw text with
custom fonts, handle the drawing yourself by looping over each character and
drawing a sprite.
:::

## Other Shapes

For info on other shape drawing functions like `line()` and `oval()`, see the [Functions](/docs/reference/functions) reference.

## Direct Framebuffer Access

The `FRAMEBUFFER` memory region contains the framebuffer, with each byte containing 4 pixels (2 bits
per pixel). In the framebuffer, the palette colors 1-4 are represented numerically as 0-3.

For example, to clear the entire screen to palette color 4, we write 3 into each position:

<MultiLanguageCode>

```typescript
memory.fill(w4.FRAMEBUFFER, 3 | (3 << 2) | (3 << 4) | (3 << 6), 160*160/4);
```

```c
memset(FRAMEBUFFER, 3 | (3 << 2) | (3 << 4) | (3 << 6), 160*160/4);
```

```d
// Requires WASI_SDK_PATH to be set!
import core.stdc.string;
memset(w4.framebuffer, 3 | (3 << 2) | (3 << 4) | (3 << 6), 160*160/4);
```

```go
for i := range w4.FRAMEBUFFER {
    w4.FRAMEBUFFER[i] = 3 | (3 << 2) | (3 << 4) | (3 << 6)
}
```

```lua
require "memory"
memory.set(FRAMEBUFFER, (3 | (3 << 2) | (3 << 4) | (3 << 6)), 160*160/4)
```

```nim
for i in 0..<len(FRAMEBUFFER[]):
  FRAMEBUFFER[i] = 3 or (3 shl 2) or (3 shl 4) or (3 shl 6)
```

```odin
for _, i in w4.FRAMEBUFFER {
    w4.FRAMEBUFFER[i] = 3 | (3 << 2) | (3 << 4) | (3 << 6)
}
```

```porth
$FRAMEBUFFER
0 while dup 6400 < do
  over over ptr+ 0xff swap !8
  1 +
end drop drop
```

```roland
for i in 0..FRAMEBUFFER~.length {
   FRAMEBUFFER~[i] = 3 | (3 << 2) | (3 << 4) | (3 << 6);
}
```

```rust
unsafe {
    (&mut *FRAMEBUFFER).fill(3 | (3 << 2) | (3 << 4) | (3 << 6));
}
```

```wasm
;; i = 0;
(local $i i32)

(loop $loop
  ;; FRAMEBUFFER[i] = 0xff;
  (i32.store8 offset=0xa0 (local.get $i) (i32.const 0xff))

  ;; i = i + 1;
  (local.set $i (i32.add (local.get $i) (i32.const 1)))

  ;; loop while i < 160*160/4
  (br_if $loop (i32.lt_u (local.get $i) (i32.const 6400)))
)
```

```zig
for (w4.FRAMEBUFFER) |*x| {
    x.* = 3 | (3 << 2) | (3 << 4) | (3 << 6);
}
```

</MultiLanguageCode>

Advanced users can implement their own drawing functions by carefully manipulating the framebuffer.
For example, to implement a function which can get and set a single pixel at any position of screen:

<MultiLanguageCode>

```typescript
function setPixel(x: i32, y: i32, color: u8): boolean {
    // Ignore pixels outside screen...
    if((x < 0 || x >= w4.SCREEN_SIZE) || (y < 0 || y >= w4.SCREEN_SIZE)) {
      return false;
    }

    // Calculate pixel offset and index on framebuffer.
    const offset = y * 40 + x / 4;
    const index = x & 3;

    // Get the byte representing the screen pixels.
    let pixelData = load<u8>(w4.FRAMEBUFFER + offset);

    let offset = index * 2;
    
    // clear and set new color component...
    pixelData &= ~(0b11 << offset);
    pixelData |= color % 4 << offset;

    // Change framebuffer...
    store<u8>(w4.FRAMEBUFFER + offset, pixelData);
    return true;
  }

function getPixel(x: i32, y: i32): u8 {
  // Ignore pixels outside screen...
  if (x < 0 || y < 0 || x >= w4.SCREEN_SIZE || y >= w4.SCREEN_SIZE) {
    return 0;
  }

  // Calculate pixel offset and index on framebuffer.
  const offset = y * 40 + x / 4;
  const index = x & 3;

  // Get the byte representing the screen pixels.
  const pixelData: u8 = load<u8>(w4.FRAMEBUFFER + offset);

  // Split byte into pixels. On 2bpp, each byte will represent 4 pixels.
  const pixels: u8[] = [
    (pixelData & 0b00000011),
    (pixelData & 0b00001100) >> 2,
    (pixelData & 0b00110000) >> 4,
    (pixelData & 0b11000000) >> 6
  ];

  return pixels[index];
}
```

</MultiLanguageCode>
