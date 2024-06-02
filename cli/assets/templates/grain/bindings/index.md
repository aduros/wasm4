---
title: Wasm4
---

This module provides Grain bindings to WASM-4, a low-level fantasy game
console for building small games with WebAssembly. For a general overview of
WASM-4, check our their docs at https://wasm4.org/docs/.

## Values

Functions and constants included in the Wasm4 module.

### Wasm4.**_SCREEN_SIZE**

```grain
_SCREEN_SIZE : Uint8
```

### Wasm4.**_BUTTON_1**

```grain
_BUTTON_1 : Uint8
```

### Wasm4.**_BUTTON_2**

```grain
_BUTTON_2 : Uint8
```

### Wasm4.**_BUTTON_LEFT**

```grain
_BUTTON_LEFT : Uint8
```

### Wasm4.**_BUTTON_RIGHT**

```grain
_BUTTON_RIGHT : Uint8
```

### Wasm4.**_BUTTON_UP**

```grain
_BUTTON_UP : Uint8
```

### Wasm4.**_BUTTON_DOWN**

```grain
_BUTTON_DOWN : Uint8
```

### Wasm4.**_MOUSE_LEFT**

```grain
_MOUSE_LEFT : Uint16
```

### Wasm4.**_MOUSE_RIGHT**

```grain
_MOUSE_RIGHT : Uint16
```

### Wasm4.**_MOUSE_MIDDLE**

```grain
_MOUSE_MIDDLE : Uint16
```

### Wasm4.**_SYSTEM_PRESERVE_FRAMEBUFFER**

```grain
_SYSTEM_PRESERVE_FRAMEBUFFER : Uint8
```

### Wasm4.**_SYSTEM_HIDE_GAMEPAD_OVERLAY**

```grain
_SYSTEM_HIDE_GAMEPAD_OVERLAY : Uint8
```

### Wasm4.**_BLIT_1BPP**

```grain
_BLIT_1BPP : Uint8
```

### Wasm4.**_BLIT_2BPP**

```grain
_BLIT_2BPP : Uint8
```

### Wasm4.**_BLIT_FLIP_X**

```grain
_BLIT_FLIP_X : Uint8
```

### Wasm4.**_BLIT_FLIP_Y**

```grain
_BLIT_FLIP_Y : Uint8
```

### Wasm4.**_BLIT_ROTATE**

```grain
_BLIT_ROTATE : Uint8
```

### Wasm4.**_TONE_PULSE1**

```grain
_TONE_PULSE1 : Uint8
```

### Wasm4.**_TONE_PULSE2**

```grain
_TONE_PULSE2 : Uint8
```

### Wasm4.**_TONE_TRIANGLE**

```grain
_TONE_TRIANGLE : Uint8
```

### Wasm4.**_TONE_NOISE**

```grain
_TONE_NOISE : Uint8
```

### Wasm4.**_TONE_MODE1**

```grain
_TONE_MODE1 : Uint8
```

### Wasm4.**_TONE_MODE2**

```grain
_TONE_MODE2 : Uint8
```

### Wasm4.**_TONE_MODE3**

```grain
_TONE_MODE3 : Uint8
```

### Wasm4.**_TONE_MODE4**

```grain
_TONE_MODE4 : Uint8
```

### Wasm4.**gamepad1**

```grain
gamepad1 : () => Uint8
```

Gets the values of the first gamepad.

Examples:

```grain
Wasm4.gamepad1() & Wasm4._BUTTON_LEFT
```

### Wasm4.**gamepad2**

```grain
gamepad2 : () => Uint8
```

Gets the values of the second gamepad.

Examples:

```grain
Wasm4.gamepad2() & Wasm4._BUTTON_LEFT
```

### Wasm4.**gamepad3**

```grain
gamepad3 : () => Uint8
```

Gets the values of the third gamepad.

Examples:

```grain
Wasm4.gamepad3() & Wasm4._BUTTON_LEFT
```

### Wasm4.**gamepad4**

```grain
gamepad4 : () => Uint8
```

Gets the values of the fourth gamepad.

Examples:

```grain
Wasm4.gamepad4() & Wasm4._BUTTON_LEFT
```

### Wasm4.**mouseButtons**

```grain
mouseButtons : () => Uint8
```

Gets the values of the mouse buttons.

Examples:

```grain
Wasm4.mouseButtons() & Wasm4._MOUSE_LEFT
```

### Wasm4.**drawColors**

```grain
drawColors : (colors: Uint16) => Void
```

Set the draw colors. The draw colors are a set of 4 indexes into the palette. Drawing functions use these indexes to decide which colors to use, and what to use them for.

It's a 16 bit value that holds 4 indexes. Bits 0-3 (the least significant bits) hold the first draw color, bits 4-7 hold the second draw color, and so on.

Setting a draw color to 1 means use the palette color 1 for that draw color. The same applies when setting a draw color to 2, 3, or 4.

For example, rect() uses the first draw color for the fill color, and the second draw color as the outline color.

### Wasm4.**setPalette**

```grain
setPalette :
  (color1: Uint32, color2: Uint32, color3: Uint32, color4: Uint32) => Void
```

Set the color palette.

### Wasm4.**blit**

```grain
blit :
  (sprite: Bytes, x: Uint8, y: Uint8, width: Uint8, height: Uint8,
   flags: Uint8) => Void
```

Copies pixels to the framebuffer.

Parameters:

|param|type|description|
|-----|----|-----------|
|`sprite`|`Bytes`|The raw pixel data stored in either 1BPP or 2BPP format.|
|`x`|`Uint8`|X position in the destination framebuffer.|
|`y`|`Uint8`|Y position in the destination framebuffer.|
|`width`|`Uint8`|Width of the sprite.|
|`height`|`Uint8`|Height of the sprite.|
|`flags`|`Uint8`|Flags that modify behavior: _BLIT_2BPP, _BLIT_FLIP_X, _BLIT_FLIP_Y, _BLIT_ROTATE|

### Wasm4.**blitSub**

```grain
blitSub :
  (sprite: Bytes, x: Uint8, y: Uint8, width: Uint8, height: Uint8,
   srcX: Uint16, srcY: Uint16, stride: Uint8, flags: Uint8) => Void
```

Copies a subregion within a larger sprite atlas to the framebuffer. Same as blit, but with 3 additional parameters.

Parameters:

|param|type|description|
|-----|----|-----------|
|`sprite`|`Bytes`|The raw pixel data stored in either 1BPP or 2BPP format.|
|`x`|`Uint8`|X position in the destination framebuffer.|
|`y`|`Uint8`|Y position in the destination framebuffer.|
|`width`|`Uint8`|Width of the sprite.|
|`height`|`Uint8`|Height of the sprite.|
|`srcX`|`Uint16`|Source X position of the sprite region.|
|`srcY`|`Uint16`|Source Y position of the sprite region.|
|`stride`|`Uint8`|Total width of the overall sprite atlas. This is typically larger than width.|
|`flags`|`Uint8`|Flags that modify behavior: _BLIT_2BPP, _BLIT_FLIP_X, _BLIT_FLIP_Y, _BLIT_ROTATE|

### Wasm4.**line**

```grain
line : (x1: Uint8, y1: Uint8, x2: Uint8, y2: Uint8) => Void
```

Draws a line between two points.

### Wasm4.**hline**

```grain
hline : (x: Uint8, y: Uint8, len: Uint8) => Void
```

Draws a horizontal line between (x, y) and (x + len - 1, y).

### Wasm4.**vline**

```grain
vline : (x: Uint8, y: Uint8, len: Uint8) => Void
```

Draws a vertical line between (x, y) and (x, y + len - 1).

### Wasm4.**oval**

```grain
oval : (x: Uint8, y: Uint8, width: Uint8, height: Uint8) => Void
```

Draws an oval (or circle).

### Wasm4.**rect**

```grain
rect : (x: Uint8, y: Uint8, width: Uint8, height: Uint8) => Void
```

Draws a rectangle.

### Wasm4.**text**

```grain
text : (string: String, x: Uint8, y: Uint8) => Void
```

Draws text using the built-in system font. The string may contain new-line (\n) characters.

### Wasm4.**tone**

```grain
tone :
  (frequency: Uint16, ?slideFrequency: Uint16, duration: Uint16,
   volume: Uint8, flags: Uint8) => Void
```

Plays a sound tone. The high bits of frequency can optionally describe a pitch slide effect.

Parameters:

|param|type|description|
|-----|----|-----------|
|`frequency`|`Uint16`|Wave frequency in hertz.|
|`?slideFrequency`|`Uint16`|Wave frequency in hertz to slide up to.|
|`duration`|`Uint16`|Duration of the tone in frames (1/60th of a second), up to 255 frames.|
|`volume`|`Uint8`|Volume of the sustain and attack durations, between 0 and 100.|
|`flags`|`Uint8`|Flags that modify behavior.|

### Wasm4.**diskr**

```grain
diskr : (size: Uint16) => Bytes
```

Reads up to size bytes from persistent storage.

Returns:

|type|description|
|----|-----------|
|`Bytes`|the number of bytes read, which may be less than size.|

### Wasm4.**diskw**

```grain
diskw : (bytes: Bytes) => Uint16
```

Writes up to size bytes into persistent storage.

Any previously saved data on the disk is replaced.

Returns:

|type|description|
|----|-----------|
|`Uint16`|the number of bytes written, which may be less than size.|

### Wasm4.**trace**

```grain
trace : (msg: String) => Void
```

Prints a message to the debug console.

