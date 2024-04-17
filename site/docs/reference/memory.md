# Memory Layout

### Endianness
WebAssembly is, in general, a little-endian system.

### Memory Map

WASM-4 uses a fixed memory layout of 64 KB.

| Address | Size (Bytes) | Description                     |
| ---     | ---          | ---                             |
| `$0000` | 4            | *Unused*                        |
| `$0004` | 16           | [PALETTE](#palette)             |
| `$0014` | 2            | [DRAW_COLORS](#draw_colors)     |
| `$0016` | 4            | [GAMEPADS](#gamepads)           |
| `$001a` | 2            | [MOUSE_X](#mouse_x)             |
| `$001c` | 2            | [MOUSE_Y](#mouse_y)             |
| `$001e` | 1            | [MOUSE_BUTTONS](#mouse_buttons) |
| `$001f` | 1            | [SYSTEM_FLAGS](#system_flags)   |
| `$0020` | 1            | [NETPLAY](#netplay)             |
| `$0021` | 127          | Reserved for future use         |
| `$00a0` | 6400         | [FRAMEBUFFER](#framebuffer)     |
| `$19a0` | 58976        | Available program memory        |

### PALETTE

An array of 4 colors, each represented by a 32 bit integer.
Each color is laid out in memory like this:

| Bits    | Description           |
| ---     | ---                   |
| 0 - 7   | Blue channel          |
| 8 - 15  | Green channel         |
| 16 - 23 | Red channel           |
| 24 - 31 | *Unused*              |

Example:

```c
PALETTE[0] = 0xff0000; // Set the first palette color to red,
PALETTE[1] = 0x00ff00; // the second to green,
PALETTE[2] = 0x0000ff; // the third to blue,
PALETTE[3] = 0xffffff; // and the fourth to white.
```

### DRAW_COLORS

Indexes into the color palette used by all drawing functions.

| Bits    | Description   |
| ---     | ---           |
| 0 - 3   | Draw color 1 |
| 4 - 7   | Draw color 2 |
| 8 - 11  | Draw color 3 |
| 12 - 15 | Draw color 4 |

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

| Bit | Name           | Description |
| --- | ---            | ---         |
| 0   | `BUTTON_1`     | X button    |
| 1   | `BUTTON_2`     | Z button    |
| 2   |                | *Unused*    |
| 3   |                | *Unused*    |
| 4   | `BUTTON_LEFT`  | D-pad left  |
| 5   | `BUTTON_RIGHT` | D-pad right |
| 6   | `BUTTON_UP`    | D-pad up    |
| 7   | `BUTTON_DOWN`  | D-pad down  |

### MOUSE_X

Signed 16 bit integer containing the X position of the mouse. Can contain positions outside of the game window.

### MOUSE_Y

Signed 16 bit integer containing the Y position of the mouse. Can contain positions outside of the game window.

### MOUSE_BUTTONS

Byte containing the mouse buttons state.

| Bit | Name           | Description         |
| --- | ---            | ---                 |
| 0   | `MOUSE_LEFT`   | Left mouse button   |
| 1   | `MOUSE_RIGHT`  | Right mouse button  |
| 2   | `MOUSE_MIDDLE` | Middle mouse button |

### SYSTEM_FLAGS

Byte containing flags that modify WASM-4's operation. By default all flags are off.

| Bit | Name                          | Description                                       |
| --- | ---                           | ---                                               |
| 0   | `SYSTEM_PRESERVE_FRAMEBUFFER` | Prevent clearing the framebuffer between frames.  |
| 1   | `SYSTEM_HIDE_GAMEPAD_OVERLAY` | Hide the gamepad UI overlay on mobile.            |

### NETPLAY

Byte containing netplay multiplayer state.

| Bits  | Description                         |
| ---   | ---                                 |
| 0 - 1 | Local player index (0 to 3).        |
| 2     | Set if netplay is currently active. |

### FRAMEBUFFER

Array of 160x160 pixels, with each pixel packed into 2 bits (colors 0 to 3).

This region can be freely modified for direct pixel manipulation.
