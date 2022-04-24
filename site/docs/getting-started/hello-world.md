import MultiLanguageCode from '@site/src/components/MultiLanguageCode';

# Hello World

Let's take a look at an example of a basic program: Drawing a rectangle.

<MultiLanguageCode>

```typescript
import * as w4 from "./wasm4";

export function update (): void {
    w4.rect(10, 10, 32, 32);
}
```

```c
#include "wasm4.h"

void update () {
    rect(10, 10, 32, 32);
}
```

```d
import w4 = wasm4;

extern(C) void update() {
    w4.rect(10, 10, 32, 32);
}
```

```go
package main

import "cart/w4"

//go:export update
func update () {
    w4.Rect(10, 10, 32, 32)
}
```

```lua
require "wasm4"

local function update ()
    rect(10, 10, 32, 32)
end

## setup_wasm4_callbacks(update)
```

```nim
import cart/wasm4

proc update {.exportWasm.} = 
  rect(10, 10, 32, 32)
```

```odin
package main

import "w4"

@export
update :: proc "c" () {
    w4.rect(10, 10, 32, 32)
}
```

```rust
mod wasm4;
use wasm4::*;

#[no_mangle]
fn update () {
    rect(10, 10, 32, 32);
}
```

```wasm
(import "env" "rect" (func $rect (param i32 i32 i32 i32)))

(func (export "update")
  ;; Draw a rectangle at (10, 10) with size (32, 32).
  (call $rect (i32.const 10) (i32.const 10) (i32.const 32) (i32.const 32))
)
```

```zig
const w4 = @import("wasm4.zig");

export fn update() void {
    w4.rect(10, 10, 32, 32);
}
```

```porth
import proc rect int int int int in end

proc update in
  ;; Draw a rectangle at (10, 10) with size (32, 32).
  32 32 10 10 rect
end
```

</MultiLanguageCode>

The first line imports the WASM-4 API definitions. This is a stub source file included with all
projects that describes which functions are available.

One of those functions is `rect()`, which we use to draw a 32x32 rectangle at position (10, 10).

We place this in a callback function called `update()` which is marked for export to WebAssembly
(exact syntax varies by language). The WASM-4 runtime calls the `update()` callback every frame, at
60 frames per second.

## Accessing Memory

Memory in WebAssembly is a contiguous, linear block that can be randomly accessed. WASM-4 reserves a
region of that memory to map its state registers.

One of those registers is `DRAW_COLORS` at address $14. Its value affects the color of all drawing
functions. Let's draw a different color rectangle by setting `DRAW_COLORS` to 2 (the second color in
the palette).

<MultiLanguageCode>

```typescript
store<u16>(w4.DRAW_COLORS, 2);

w4.rect(10, 10, 32, 32);
```

```c
*DRAW_COLORS = 2;

rect(10, 10, 32, 32);
```

```d
*w4.drawColors = 2;

w4.rect(10, 10, 32, 32)
```

```go
*w4.DRAW_COLORS = 2

w4.Rect(10, 10, 32, 32)
```

```lua
$DRAW_COLORS = 2

rect(10, 10, 32, 32)
```

```nim
DRAW_COLORS[] = 2

rect(10, 10, 32, 32)
```

```odin
w4.DRAW_COLORS^ = 2

w4.rect(10, 10, 32, 32)
```

```rust
unsafe { *DRAW_COLORS = 2 }

rect(10, 10, 32, 32);
```

```wasm
;; Set DRAW_COLORS to 2.
(i32.store16 (global.get $DRAW_COLORS) (i32.const 2))

;; Draw a rectangle at (10, 10) with size (32, 32).
(call $rect (i32.const 10) (i32.const 10) (i32.const 32) (i32.const 32))
```

```zig
w4.DRAW_COLORS.* = 2;

w4.rect(10, 10, 32, 32);
```

```porth
;; Set DRAW_COLORS to 2.
2 $DRAW_COLORS !16

;; Draw a rectangle at (10, 10) with size (32, 32).
32 32 10 10 rect
```

</MultiLanguageCode>

## Debugging

Use `trace()` to output a message to the console, which can be very useful for quick debugging.

<MultiLanguageCode>

```typescript
w4.trace("Hello world!");
```

```c
trace("Hello world!");
```

```d
w4.trace("Hello world!");
```

```go
w4.Trace("Hello world!")
```

```lua
trace("Hello World!")
```

```nim
trace("Hello world!")
```

```odin
w4.trace("Hello world!")
```

```rust
trace("Hello world!");
```

```wasm
(import "env" "trace" (func $trace (param i32)))

;; Put the string at address 0x2000 in memory.
(data (i32.const 0x2000) "Hello world!\00")

(call $trace (i32.const 0x2000))
```

```zig
w4.trace("Hello world!");
```

```porth
import proc trace ptr in end

"Hello world!"c trace
```

</MultiLanguageCode>

:::tip
Press `F8` to toggle the WASM-4 developer tools, which displays system state, memory usage, and more.
:::
