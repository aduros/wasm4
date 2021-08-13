# Memory Map

WASM-4 uses a fixed memory layout of 64 KB.

| Address | Size (Bytes) | Description                     |
| ---     | ---          | ---                             |
| `$0004` | 16           | [PALETTE](#palette)             |
| `$0014` | 2            | [DRAW_COLORS](#draw_colors)     |
| `$0016` | 4            | [GAMEPADS](#gamepads)           |
| `$001a` | 2            | [MOUSE_X](#mouse_x)             |
| `$001b` | 2            | [MOUSE_Y](#mouse_y)             |
| `$001c` | 1            | [MOUSE_BUTTONS](#mouse_buttons) |
| `$00a0` | 6400         | [FRAMEBUFFER](#framebuffer)     |
| `$19a0` | 58975        | Available program memory        |

### PALETTE

4 colors, with each color represented by a 32 bit integer.

| Bits    | Description           |
| ---     | ---                   |
| 0 - 7   | Blue channel          |
| 8 - 15  | Green channel         |
| 16 - 23 | Red channel           |
| 24 - 31 | -                     |

### DRAW_COLORS

Indexes into the color palette used by all drawing functions.

| Bits    | Description   |
| ---     | ---           |
| 0 - 3   | Draw color 0 |
| 4 - 7   | Draw color 1 |
| 8 - 11  | Draw color 2 |
| 12 - 15 | Draw color 3 |

Each draw color can be a value between 1 and 4 representing a palette color, or 0 to signify
transparency.

Example:

```c
// Set the first draw color to palette color #2, the second to
// transparent, and the third to palette color #4.
*DRAW_COLORS = 0x402;
```

### GAMEPADS

4 gamepads, with each gamepad represented by a single byte.

| Bit | Description   |
| --- | ---           |
| 0   | X button      |
| 1   | Z button      |
| 2   | -             |
| 3   | -             |
| 4   | D-pad left    |
| 5   | D-pad right   |
| 6   | D-pad up      |
| 7   | D-pad down    |

### MOUSE_X

Signed 16 bit integer containing the X position of the mouse.

### MOUSE_Y

Signed 16 bit integer containing the Y position of the mouse.

### MOUSE_BUTTONS

Byte containing the mouse buttons state.

| Bit | Description   |
| --- | ---           |
| 0   | Left button   |
| 1   | Right button  |
| 2   | Middle button |

### FRAMEBUFFER

Array of 160x160 pixels, with each pixel packed into 2 bits (colors 0 to 3).

This region can be freely modified for direct pixel manipulation.
