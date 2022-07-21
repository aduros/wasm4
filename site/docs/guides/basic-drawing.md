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

## Custom Fonts

There is no way to use a custom font with this function. To draw text with
custom fonts, handle the drawing yourself by looping over each character and
drawing a sprite.

The example below will print a text using the [BitScript sprite font](https://opengameart.org/content/bitscript-a-low-res-handwriting-font):

<MultiLanguageCode>

```typescript
import * as w4 from "./wasm4";

const fontWidth = 208;
const fontHeight = 8;
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
function write(text: string, x: i32, y: i32, colors: u16): void {
    // Set draw colors...
    store<u16>(w4.DRAW_COLORS, colors);

    // Line and column counters.
    let line  : i32 = 0;
    let column: i32 = 0;

    // Special characters: "\n" (newline) and " " (space).
    const newline: i32 = 10;
    const space  : i32 = 32;

    // Iterate through each character...
    for(let i = 0; i < text.length; i += 1) {
        const char: string = text.charAt(i);
        const charCode: i32 = char.charCodeAt(0);

        // Break into next line when encounter a "\n" (newline)...
        if(charCode === newline) {
            line  += 1;
            column = 0;
            continue;
        }
        // Advance to next column when encounter a " " (space)...
        else if(charCode === space) {
            column += 1;
            continue;
        }

        // Character index on charset.
        let charIndex: i32 = charset.indexOf(char);

        // Skip invalid characters...
        if(charIndex < 0 || charIndex >= charset.length) {
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

</MultiLanguageCode>

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
For example, to implement a `pixel()` function that draws a single pixel:

<MultiLanguageCode>

```typescript
function pixel (x: i32, y: i32): void {
    // The byte index into the framebuffer that contains (x, y)
    const idx = (y*160 + x) >> 2;

    // Calculate the bits within the byte that corresponds to our position
    const shift = u8((x & 0b11) << 1);
    const mask = u8(0b11 << shift);

    // Use the first DRAW_COLOR as the pixel color.
    const palette_color = u8(load<u16>(w4.DRAW_COLORS) & 0b1111);
    if (color == 0) {
        // Transparent
        return;
    }
    const color = (palette_color - 1) & 0b11;

    // Write to the framebuffer
    store<u8>(w4.FRAMEBUFFER + idx, (color << shift) | (load<u8>(w4.FRAMEBUFFER + idx) & ~mask));
}
```

```c
void pixel (int x, int y) {
    // The byte index into the framebuffer that contains (x, y)
    int idx = (y*160 + x) >> 2;

    // Calculate the bits within the byte that corresponds to our position
    int shift = (x & 0b11) << 1;
    int mask = 0b11 << shift;

    // Use the first DRAW_COLOR as the pixel color
    int palette_color = *DRAW_COLORS & 0b1111;
    if (color == 0) {
        // Transparent
        return;
    }
    int color = (palette_color - 1) & 0b11;

    // Write to the framebuffer
    FRAMEBUFFER[idx] = (color << shift) | (FRAMEBUFFER[idx] & ~mask);
}
```

```d
void pixel(int x, int y) {
    // The byte index into the framebuffer that contains (x, y)
    int idx = (y * w4.screenSize + x) >> 2;

    // Calculate the bits within the byte that corresponds to our position
    int shift = (x & 0b11) << 1;
    int mask = 0b11 << shift;

    // Use the first draw color as the pixel color
    int palette_color = *w4.drawColors & 0b1111;
    if (palette_color == 0) {
        // Transparent
        return;
    }
    int color = (palette_color - 1) & 0b11;

    // Write to the framebuffer
    w4.framebuffer[idx] =
        cast(ubyte)((color << shift) | (w4.framebuffer[idx] & ~mask));
}
```

```go
func pixel (x int, y int) {
    // The byte index into the framebuffer that contains (x, y)
    var idx = (y*160 + x) >> 2

    // Calculate the bits within the byte that corresponds to our position
    var shift = uint8((x & 0b11) << 1)
    var mask = uint8(0b11 << shift)

    // Use the first DRAW_COLOR as the pixel color
    var palette_color = uint8(*w4.DRAW_COLORS & 0b1111)
    if (palette_color == 0) {
        // Transparent
        return;
    }
    var color = uint8((palette_color - 1) & 0b11);

    // Write to the framebuffer
    w4.FRAMEBUFFER[idx] = (color << shift) | (w4.FRAMEBUFFER[idx] &^ mask)
}
```

```lua
local function pixel(x: integer, y: integer)
    -- The byte index into the framebuffer that contains (x, y)
    local idx = (y*160 + x) >> 2

    -- Calculate the bits within the byte that corresponds to our position
    local shift = (x & 0b11) << 1
    local mask = 0b11 << shift

    -- Use the first DRAW_COLOR as the pixel color
    local palette_color = $DRAW_COLORS & 0b1111
    if (palette_color == 0) {
        // Transparent
        return;
    }
    var color = (palette_color - 1) & 0b11;

    -- Write to the framebuffer
    FRAMEBUFFER[idx] = (color << shift) | (FRAMEBUFFER[idx] & ~mask)
end
```

```nim
proc pixel(x, y: int32) =
  # The byte index into the framebuffer that contains (x, y)
  let idx = (y * SCREEN_SIZE + x) shr 2

  # Calculate the bits within the byte that corresponds to our position
  let shift = (x and 0b11) shl 1
  let mask = uint8(0b11 shl shift)

  # Use the first DRAW_COLOR as the pixel color
  let palette_color = uint8(DRAW_COLORS[] and 0b1111)
  if (palette_color == 0) {
      // Transparent
      return;
  }
  let color = (palette_color - 1) & 0b11

  # Write to the framebuffer
  FRAMEBUFFER[idx] = uint8((color shl shift) or (FRAMEBUFFER[idx] and not mask))
```

```odin
pixel :: proc "c" (x : int, y : int) {
    // The byte index into the framebuffer that contains (x, y)
    idx := (y*160 + x) >> 2

    // Calculate the bits within the byte that corresponds to our position
    shift := u8((x & 0b11) << 1)
    mask := u8(0b11 << shift)

    // Use the first DRAW_COLOR as the pixel color
    palette_color := u8(w4.DRAW_COLORS^ & 0b1111)
    if (palette_color == 0) {
        // Transparent
        return
    }
    color := (palette_color - 1) & 0b11;

    // Write to the framebuffer
    w4.FRAMEBUFFER[idx] = (color << shift) | (w4.FRAMEBUFFER[idx] &~ mask)
}
```

```porth
// TODO
```

```roland
proc pixel(x: i32, y: i32) {
   // The byte index into the framebuffer that contains (x, y)
   let idx = (y transmute usize * 160 + x transmute usize) >> 2;

   // Calculate the bits within the byte that corresponds to our position
   let shift = (x truncate u8 & 0b11) << 1;
   let mask = 0b11 << shift;

   let palette_color: u8 = (DRAW_COLORS~ & 0xf) truncate u8;
   if (palette_color == 0) {
      // Transparent
      return;
   }
   let color = (palette_color - 1) & 0b11;

   // Write to the framebuffer
   FRAMEBUFFER~[idx] = (color << shift) | (FRAMEBUFFER~[idx] & !mask);
}
```

```rust
fn pixel(x: i32, y: i32) {
    // The byte index into the framebuffer that contains (x, y)
    let idx = (y as usize * 160 + x as usize) >> 2;

    // Calculate the bits within the byte that corresponds to our position
    let shift = (x as u8 & 0b11) << 1;
    let mask = 0b11 << shift;

    unsafe {
        let palette_color: u8 = (*DRAW_COLORS & 0xf) as u8;
        if (palette_color == 0) {
            // Transparent
            return;
        }
        let color = (palette_color - 1) & 0b11;

        let framebuffer = &mut *FRAMEBUFFER;

        framebuffer[idx] = (color << shift) | (framebuffer[idx] & !mask);
    }
}
```

```wasm
(func $pixel (param $x i32) (param $y i32)
  (local $idx i32)
  (local $shift i32)
  (local $mask i32)
  (local $color i32)

  ;; The byte index into the framebuffer that contains (x, y)
  ;;  idx = (y*160 + x) >> 2;
  (local.set $idx
    (i32.shr_u
      (i32.add
        (i32.mul
          (local.get $y)
          (i32.const 160))
        (local.get $x))
      (i32.const 2)))

  ;; Calculate the bits within the byte that corresponds to our position
  ;; shift = (x & 0b11) << 1;
  (local.set $shift
    (i32.mul
      (i32.and
        (local.get $x)
        (i32.const 3))
      (i32.const 2)))

  ;; mask = 0b11 << shift;
  (local.set $mask
    (i32.shl
      (i32.const 3)
      (local.get $shift)))

  ;; Use the first DRAW_COLOR as the pixel color
  ;; color = *DRAW_COLORS & 0b1111;
  (local.set $color
    (i32.and
      (i32.load16_u (global.get $DRAW_COLORS))
      (i32.const 15)))
  ;; return if $color is zero, then subtract 1 and mask.
  (if (i32.eqz (local.get $color)) (then (return)))
  (local.set $color (i32.and
                      (i32.const 3)
                      (i32.sub (local.get $color) (i32.const 1))))

  ;; Write to the framebuffer:
  ;; FRAMEBUFFER[idx] = (color << shift) | (FRAMEBUFFER[idx] & ~mask);
  ;;
  ;; Note that WebAssembly doesn't have a bitwise not instruction, so
  ;; `~n` becomes `n ^ ~0` (where -1 is used for ~0 below).
  (i32.store8 offset=0xa0
    (local.get $idx)
    (i32.or
      (i32.shl
        (local.get $color)
        (local.get $shift))
      (i32.and
        (i32.load8_u offset=0xa0 (local.get $idx))
        (i32.xor
          (local.get $mask)
          (i32.const -1)))))
)
```

```zig
fn pixel(x: i32, y: i32) void {
    // The byte index into the framebuffer that contains (x, y)
    const idx = (@intCast(usize, y) * 160 + @intCast(usize, x)) >> 2;

    // Calculate the bits within the byte that corresponds to our position
    const shift = @intCast(u3, (x & 0b11) * 2);
    const mask = @as(u8, 0b11) << shift;

    // Use the first DRAW_COLOR as the pixel color
    const palette_color = @intCast(u8, w4.DRAW_COLORS.* & 0b1111);
    if (palette_color == 0) {
        // Transparent
        return;
    }
    const color = (palette_color - 1) & 0b11;

    // Write to the framebuffer
    w4.FRAMEBUFFER[idx] = (color << shift) | (w4.FRAMEBUFFER[idx] & ~mask);
}
```

</MultiLanguageCode>

For better control, we can also write functions to get and set pixels in a more direct way:

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
  // clear color component
  pixelData &= ~(0b11 << offset);
  // set new color component
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
  const offset: i32 = ((y * 40) + (x / 4));
  const index: i32 = Math.abs(x % 4) as i32;

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
