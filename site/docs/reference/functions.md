---
sidebar_label: Functions
---

# Functions Reference

All function parameters are 32 bit integers unless otherwise noted.

:::note
Go uses Go-Idiomatic names (PascalCase). Like `Blit` instead of `blit` and `DiskW` instead of `diskw`.
:::

## Drawing

All drawing functions are affected by the [`DRAW_COLORS`](memory#draw_colors) register.

### `blit (spritePtr, x, y, width, height, flags)`

Copies pixels to the framebuffer.

* `spritePtr`: Pointer to raw pixel data stored in either 1BPP or 2BPP format.
* `x`: X position in the destination framebuffer.
* `y`: Y position in the destination framebuffer.
* `width`: Width of the sprite.
* `height`: Height of the sprite.
* `flags`: Flags that modify behavior:

| Flag bits | Description                                      |
| ---       | ---                                              |
| 0         | Sprite pixel format: 2BPP if set, otherwise 1BPP |
| 1         | Flip sprite horizontally                         |
| 2         | Flip sprite vertically                           |
| 3         | Rotate sprite anti-clockwise 90 degrees          |

A 1BPP sprite uses 1 bit for each pixel and can contain up to 2 colors. A 2BPP sprite uses 2 bits per
pixel and can contain up to 4 colors.

### `blitSub (spritePtr, x, y, width, height, srcX, srcY, stride, flags)`

Copies a subregion within a larger sprite atlas to the framebuffer. Same as `blit`, but with 3
additional parameters.

* `srcX`: Source X position of the sprite region.
* `srcY`: Source Y position of the sprite region.
* `stride`: Total width of the overall sprite atlas. This is typically larger than `width`.

For info on other parameters, see `blit()`.

### `line (x1, y1, x2, y2)`

Draws a line between two points.

`DRAW_COLORS` color 1 is used as the line color.

### `oval (x, y, width, height)`

Draws an oval (or circle).

`DRAW_COLORS` color 1 is used as the fill color, `DRAW_COLORS` color 2 is used as the outline color.

:::caution
`oval()` is not yet fully implemented and currently only supports drawing the outline.
:::

### `rect (x, y, width, height)`

Draws a rectangle.

`DRAW_COLORS` color 1 is used as the fill color, `DRAW_COLORS` color 2 is used as the outline color.

### `hline(x, y, len)`

Draws a horizontal line from point `(x; y)`.

Draws forward if `len` is greater than 0, from `(x; y)` to `(x + len; y)` excluded.

Draws backwards if `len` is lower than 0, from `(x; y)` to `(x + len; y)` excluded.

### `vline(x, y, len)`

Draws a vertical line from point `(x; y)`, `(x; y)`

Draws forward if `len` is greater than 0, from `(x; y)` to `(x; y + len)` excluded.

Draws backwards if `len` is lower than 0, from `(x; y)` to `(x; y + len)` excluded.

### `text (str, x, y)`

Draws text using the built-in system font. The string may contain new-line (`\n`) characters.

The font is 8x8 pixels per character.

`DRAW_COLORS` color 1 is used as the text color, `DRAW_COLORS` color 2 is used as the background color.

:::note String Encoding
By default, `str` is expected to be a `\0` terminated ASCII string. There are 2 additional variants
of this function for passing unterminated UTF-8 and UTF-16 strings along with a byte length.

* `textUtf8 (strUtf8, byteLength, x, y)`
* `textUtf16 (strUtf16, byteLength, x, y)`
:::

## Sound

### `tone (frequency, duration, volume, flags)`

Plays a sound tone.

* `frequency`: Wave frequency in hertz.
* `duration`: Duration of the tone in frames (1/60th of a second), up to 255 frames.
* `volume`: Volume between 0 and 100.
* `flags`: Flags that modify behavior:

| Flag bits | Description                                                                                     |
| ---       | ---                                                                                             |
| 0 - 1     | Channel (0-3): 0 = Pulse1, 1 = Pulse2, 2 = Triangle, 3 = Noise                                  |
| 2 - 3     | Mode (0-3): For pulse channels, the pulse wave duty cycle. 0 = 1/8, 1 = 1/4, 2 = 1/2, 3 = 3/4   |

The high bits of `frequency` can optionally describe a pitch slide effect:

| Frequency bits | Description               |
| ---            | ---                       |
| 0 - 15         | Start frequency (0-65535) |
| 16 - 31        | End frequency (0-65535)   |

If the end frequency is non-zero, then the frequency is ramped linearly over the total duration of the tone.

The high bits of `duration` can optionally describe an ADSR volume envelope:

| Duration bits | Description          |
| ---           | ---                  |
| 0 - 7         | Sustain time (0-255) |
| 8 - 15        | Release time (0-255) |
| 16 - 23       | Decay time (0-255)   |
| 24 - 31       | Attack time (0-255)  |

The envelope starts at zero volume, then raises to the peak volume over the attack time, lowers to
the sustain volume during the decay time, remains at the sustain volume during the sustain time, and
finally fades to zero volume during the release time.

## Storage

Games can persist up to 1024 bytes of data.

### `diskr (destPtr, size)`

Reads up to `size` bytes from persistent storage into the pointer `destPtr`.

Returns the number of bytes read, which may be less than `size`.

### `diskw (srcPtr, size)`

Writes up to `size` bytes from the pointer `srcPtr` into persistent storage.

Any previously saved data on the disk is replaced.

Returns the number of bytes written, which may be less than `size`.

## Callbacks

Callback functions are called by WASM-4 and may be implemented by your game.

### `start ()`

Called at the start of the game, before the first update.

### `update ()`

Called every frame, about 60 times per second.

## Other

### `trace (str)`

Prints a message to the debug console.

:::note String Encoding
By default, `str` is expected to be a `\0` terminated ASCII string. There are 2 additional variants
of this function for passing unterminated UTF-8 and UTF-16 strings along with a byte length.

* `traceUtf8 (strUtf8, byteLength)`
* `traceUtf16 (strUtf16, byteLength)`
:::

### `tracef (fmt, stackPtr)`

C/C++ only, works like `printf`. Only these formatting characters are supported:

* `%c`: Character
* `%d`: Decimal
* `%f`: Float
* `%s`: String
* `%x`: Hex
