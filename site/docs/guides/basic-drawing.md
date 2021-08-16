import MultiLanguageCode from '@site/src/components/MultiLanguageCode';

# Basic Drawing

## The `PALETTE` Register

WASM-4 can only display 4 colors on screen at a time. This palette's RGB values are stored in the `PALETTE` memory register, and can be modified.

For example, to change the palette to [Ice Cream GB](https://lospec.com/palette-list/ice-cream-gb):

<MultiLanguageCode>

```typescript
store<u32>(w4.PALETTE, 0xfff6d3, 0);
store<u32>(w4.PALETTE, 0xf9a875, 1);
store<u32>(w4.PALETTE, 0xeb6b6f, 2);
store<u32>(w4.PALETTE, 0x7c3f58, 3);
```

```c
PALETTE[0] = 0xfff6d3;
PALETTE[1] = 0xf9a875;
PALETTE[2] = 0xeb6b6f;
PALETTE[3] = 0x7c3f58;
```

```rust
let mut palette = unsafe { *PALETTE };
palette[0] = 0xfff6d3;
palette[1] = 0xf9a875;
palette[2] = 0xeb6b6f;
palette[3] = 0x7c3f58;
```

```go
PALETTE[0] = 0xfff6d3;
PALETTE[1] = 0xf9a875;
PALETTE[2] = 0xeb6b6f;
PALETTE[3] = 0x7c3f58;
```

</MultiLanguageCode>

The default Gameboy-ish palette looks like this:

<div className="row row--no-gutters">
    <div className="col col--2" style={{padding: "1.5rem", background: "#e0f8cf", color: "#000"}}>Color 1</div>
    <div className="col col--2" style={{padding: "1.5rem", background: "#86c06c", color: "#000"}}>Color 2</div>
    <div className="col col--2" style={{padding: "1.5rem", background: "#306850", color: "#fff"}}>Color 3</div>
    <div className="col col--2" style={{padding: "1.5rem", background: "#071821", color: "#fff"}}>Color 4</div>
</div>

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

```rust
unsafe { *DRAW_COLORS = 0x42 }
rect(10, 10, 32, 32);
```

```go
*DRAW_COLORS = 0x42;
rect(10, 10, 32, 32);
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

```rust
text("Hello world!", 10, 10);
```

```go
text("Hello world!", 10, 10);
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
