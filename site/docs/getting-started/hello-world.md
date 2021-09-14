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

```rust
mod wasm4;
use wasm4::*;

#[no_mangle]
fn update () {
    rect(10, 10, 32, 32);
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

```rust
unsafe { *DRAW_COLORS = 2 }

rect(10, 10, 32, 32);
```

```go
*w4.DRAW_COLORS = 2

w4.Rect(10, 10, 32, 32)
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

```rust
trace("Hello world!");
```

```go
w4.Trace("Hello world!")
```

</MultiLanguageCode>
