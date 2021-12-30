
import MultiLanguage, {Page} from '@site/src/components/MultiLanguage';
import MultiLanguageCode from '@site/src/components/MultiLanguageCode';

# Setting Color Palette

## The Default Color Palette

In WASM-4, you can set 4 colors to your liking. The default color palette looks like this:

<div className="row row--no-gutters">
    <div className="col col--2" style={{padding: "1.5rem", background: "#e0f8cf", color: "#000"}}>Color 1: #e0f8cf</div>
    <div className="col col--2" style={{padding: "1.5rem", background: "#86c06c", color: "#000"}}>Color 2: #86c06c</div>
    <div className="col col--2" style={{padding: "1.5rem", background: "#306850", color: "#fff"}}>Color 3: #306850</div>
    <div className="col col--2" style={{padding: "1.5rem", background: "#071821", color: "#fff"}}>Color 4: #071821</div>
</div>

It's inspired by the color palette of the original Gameboy. But you can set your own palette too.

## Picking a Color Palette

There are a lot of different color palettes available. One of the most famous is probably https://lospec.com/palette-list.

You can set the number of colors to 4 and get a lot of palettes presented. For this tutorial, I'll pick the [EN4 Palette](https://lospec.com/palette-list/en4).

<div className="row row--no-gutters">
    <div className="col col--2" style={{padding: "1.5rem", background: "#fbf7f3", color: "#000"}}>Color 1: #fbf7f3</div>
    <div className="col col--2" style={{padding: "1.5rem", background: "#e5b083", color: "#000"}}>Color 2: #e5b083</div>
    <div className="col col--2" style={{padding: "1.5rem", background: "#426e5d", color: "#fff"}}>Color 3: #426e5d</div>
    <div className="col col--2" style={{padding: "1.5rem", background: "#20283d", color: "#fff"}}>Color 4: #20283d</div>
</div>

This palette provides enough "green" for the snake and a "not green" for the fruit. Also the background is fine.

## Setting in source

Unlike most other fantasy consoles, pretty much everything is done in code. Setting the color palette belongs to this category. But before you go and mess with the code, you should remove most of the existing code.

<MultiLanguageCode>

```typescript
import * as w4 from "./wasm4";

export function update(): void {
}
```

```c
// TODO
```

```d
// TODO
```

```go
package main

import "cart/w4"

//go:export update
func update() {
}
```

```lua
require "wasm4"

local function update()
end

## setup_wasm4_callbacks(update)
```

```nim
# TODO
```

```odin
// TODO
```

```rust
#[cfg(feature = "buddy-alloc")]
mod alloc;
mod wasm4;

#[no_mangle]
fn update() {
}
```

```zig
const w4 = @import("wasm4.zig");

export fn update() void {}
```

</MultiLanguageCode>

The update function is required. Or WASM-4 won't be able to show anything. To set up the color palette, it's usually enough to do this once at the start of the game.

So in most cases, you'd add a "start" function and export it too. WASM-4 will execute it once at the start.

<MultiLanguage>

<Page value="assemblyscript">

```typescript
export function start(): void {
    store<u32>(w4.PALETTE, 0xfbf7f3, 0 * sizeof<u32>())
    store<u32>(w4.PALETTE, 0xe5b083, 1 * sizeof<u32>())
    store<u32>(w4.PALETTE, 0x426e5d, 2 * sizeof<u32>())
    store<u32>(w4.PALETTE, 0x20283d, 3 * sizeof<u32>())
}
```
</Page>

<Page value="c">

```c
// TODO
```
</Page>

<Page value="d">
```d
// TODO
```
</Page>

<Page value="go">

```go
//go:export start
func start() {
	w4.PALETTE[0] = 0xfbf7f3
	w4.PALETTE[1] = 0xe5b083
	w4.PALETTE[2] = 0x426e5d
	w4.PALETTE[3] = 0x20283d
}
```
</Page>

<Page value="nelua">

```lua
require "wasm4"

-- in nelua we can place the "start" code at the top of the file
$PALETTE = {
  0xfbf7f3,
  0xe5b083,
  0x426e5d,
  0x20283d
}
```

</Page>

<Page value="nim">

// TODO

</Page>

<Page value="odin">

// TODO

</Page>

<Page value="rust">

Let's create a new file `palette.rs` inside `src/` directory with a helper
function `set_palette`. 


```rust
// src/palette.rs
use crate::wasm4;

pub fn set_palette(palette: [u32; 4]) {
    unsafe {
        *wasm4::PALETTE = palette;
    }
}
```

We'll then use this function to customize the palette in `src/lib.rs`.

```rust
mod palette; // Don't forget to add the module declaration!

#[no_mangle]
fn start() {
    palette::set_palette([0xfbf7f3, 0xe5b083, 0x426e5d, 0x20283d]);
}
```

</Page>

<Page value="zig">

```zig
export fn start() void {
    w4.PALETTE.* = .{
        0xfbf7f3,
        0xe5b083,
        0x426e5d,
        0x20283d,
    };
}
```
</Page>

</MultiLanguage>