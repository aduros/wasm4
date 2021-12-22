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

All drawing functions are affected by the `DRAW_COLORS` memory register. `DRAW_COLORS` is a 16 bit value that can store up to 4 colors.

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

```rust
unsafe { *DRAW_COLORS = 0x42 }
rect(10, 10, 32, 32);
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

```rust
text("Hello world!", 10, 10);
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
per pixel). For example, to clear the entire screen to palette color 3:

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


```nim
for i in 0..<len(FRAMEBUFFER[]):
  FRAMEBUFFER[i] = 3 or (3 shl 2) or (3 shl 4) or (3 shl 6)
```

```odin
for _, i in w4.FRAMEBUFFER {
    w4.FRAMEBUFFER[i] = 3 | (3 << 2) | (3 << 4) | (3 << 6)
}
```

```rust
unsafe {
    FRAMEBUFFER
        .as_mut()
        .expect("framebuffer ref")
        .fill(3 | (3 << 2) | (3 << 4) | (3 << 6));
}
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

    // Use the first DRAW_COLOR as the pixel color
    const color = u8(load<u16>(w4.DRAW_COLORS) & 0b11);

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
    int color = *DRAW_COLORS & 0b11;

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
    int color = *w4.drawColors & 0b11;

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
    var color = uint8(*w4.DRAW_COLORS & 0b11)

    // Write to the framebuffer
    w4.FRAMEBUFFER[idx] = (color << shift) | (w4.FRAMEBUFFER[idx] &^ mask)
}
```

```odin
pixel :: proc "c" (x : int, y : int) {
    // The byte index into the framebuffer that contains (x, y)
    idx := (y*160 + x) >> 2

    // Calculate the bits within the byte that corresponds to our position
    shift := u8((x & 0b11) << 1)
    mask := u8(0b11 << shift)

    // Use the first DRAW_COLOR as the pixel color
    color := u8(w4.DRAW_COLORS^ & 0b11)

    // Write to the framebuffer
    w4.FRAMEBUFFER[idx] = (color << shift) | (w4.FRAMEBUFFER[idx] &~ mask)
}
```

```nim
proc pixel(x, y: int32) =
  # The byte index into the framebuffer that contains (x, y)
  let idx = (y * SCREEN_SIZE + x) shr 2

  # Calculate the bits within the byte that corresponds to our position
  let shift = (x and 0b11) shl 1
  let mask = uint8(0b11 shl shift)
  
  # Use the first DRAW_COLOR as the pixel color
  let color = uint8(DRAW_COLORS[] and 0b11)

  # Write to the framebuffer
  FRAMEBUFFER[idx] = uint8((color shl shift) or (FRAMEBUFFER[idx] and not mask))
```

```rust
fn pixel(x: i32, y: i32) {
    // The byte index into the framebuffer that contains (x, y)
    let idx = (y as usize * 160 + x as usize) >> 2;

    // Calculate the bits within the byte that corresponds to our position
    let shift = (x as u8 & 0b11) << 1;
    let mask = 0b11 << shift;

    unsafe {
        let color: u8 = (*DRAW_COLORS & 0x3) as u8;
        let framebuffer = FRAMEBUFFER.as_mut().expect("framebuffer ref");

        framebuffer[idx] = (color << shift) | (framebuffer[idx] & !mask);
    }
}
```

```zig
fn pixel(x: i32, y: i32) void {
    // The byte index into the framebuffer that contains (x, y)
    const idx = (@intCast(usize, y) * 160 + @intCast(usize, x)) >> 2;

    // Calculate the bits within the byte that corresponds to our position
    const shift = @intCast(u3, (x & 0b11) * 2);
    const mask = @as(u8, 0b11) << shift;

    // Use the first DRAW_COLOR as the pixel color
    const color = @intCast(u8, w4.DRAW_COLORS.* & 0b11);

    // Write to the framebuffer
    w4.FRAMEBUFFER[idx] = (color << shift) | (w4.FRAMEBUFFER[idx] & ~mask);
}
```

</MultiLanguageCode>
