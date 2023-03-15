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

| Flag bits | Name          | Description                                      |
| ---       | ---           | ---                                              |
| 0         | `BLIT_2BPP`   | Sprite pixel format: 2BPP if set, otherwise 1BPP |
| 1         | `BLIT_FLIP_X` | Flip sprite horizontally                         |
| 2         | `BLIT_FLIP_Y` | Flip sprite vertically                           |
| 3         | `BLIT_ROTATE` | Rotate sprite anti-clockwise 90 degrees          |

A 1BPP sprite uses 1 bit for each pixel and can contain 2 colors. A 2BPP sprite uses 2 bits per
pixel and can contain 4 colors.

Rotation is applied after any flipping.

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

### `hline(x, y, len)`

Draws a horizontal line between `(x, y)` and `(x + len - 1, y)`.

`DRAW_COLORS` color 1 is used as the line color.

### `vline(x, y, len)`

Draws a vertical line between `(x, y)` and `(x, y + len - 1)`.

`DRAW_COLORS` color 1 is used as the line color.

### `oval (x, y, width, height)`

Draws an oval (or circle).

`DRAW_COLORS` color 1 is used as the fill color, `DRAW_COLORS` color 2 is used as the outline color.

### `rect (x, y, width, height)`

Draws a rectangle.

`DRAW_COLORS` color 1 is used as the fill color, `DRAW_COLORS` color 2 is used as the outline color.

### `text (str, x, y)`

Draws text using the built-in system font. The string may contain new-line (`\n`) characters.

The font is 8x8 pixels per character.

`DRAW_COLORS` color 1 is used as the text color, `DRAW_COLORS` color 2 is used as the background color.

:::note String Encoding
By default, `str` is expected to be a `\0` terminated ASCII string.
This means bytes `0x80-0xFF` are treated as individual characters, even in programming languages where strings are normally UTF-8 encoded.
No terminating `\0` is needed in those languages.
In languages where all strings are UTF-16, `str` must only contain characters up to U+00FF and no `\0` is needed.
:::

## Sound

### `tone (frequency, duration, volume, flags)`

Plays a sound tone.

* `frequency`: Wave frequency in hertz.
* `duration`: Duration of the tone in frames (1/60th of a second), up to 255 frames.
* `volume`: Volume of the sustain and attack durations, between 0 and 100.
* `flags`: Flags that modify behavior:

| Flag bits | Description                                                                                   |
| ---       | ---                                                                                           |
| 0 - 1     | Channel (0-3): 0 = Pulse1, 1 = Pulse2, 2 = Triangle, 3 = Noise                                |
| 2 - 3     | Mode (0-3): For pulse channels, the pulse wave duty cycle. 0 = 1/8, 1 = 1/4, 2 = 1/2, 3 = 3/4 |
| 4 - 5     | Pan (0-2): 0 = Center, 1 = Left, 2 = Right                                                    |

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

The high bits of `volume` can optionally describe the peak volume used for the attack durations:

| Volume bits | Description                                                           |
| ---         | ---                                                                   |
| 0 - 7       | Volume used for the sustain duration.                                 |
| 8 - 15      | Peak volume reached by the attack duration. Defaults to 100 if zero.  |

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
By default, `str` is expected to be a `\0` terminated ASCII string.
In programming languages with UTF-8 or UTF-16 encoded string literals,
that encoding is used instead and no `\0` is needed.
:::

### `tracef (fmt, stackPtr)`

C/C++ only, works like `printf`. Only these formatting characters are supported:

* `%c`: Character
* `%d`: Decimal
* `%f`: Float
* `%s`: String
* `%x`: Hex
