import MultiLanguage, {Page} from '@site/src/components/MultiLanguage';

# Drawing the Snake

## Drawing the Body

<MultiLanguage>

<Page value="assemblyscript">

To draw the snake, you can take advantage of AssemblyScripts `forEach` function.
To make it a little easier, it's a good idea to use the `rect` function of WASM-4:

```typescript
// rect draws a rectangle. It uses color 1 to fill and color 2 for the outline
function rect(x: i32, y: i32, width: u32, height: u32): void;
```

With that out the way, let's see what a first draft could look like.

```typescript
draw(): void {
    this.body.forEach(part => w4.rect(part.x * 8, part.y * 8, 8, 8))
}
```

Simply loop through the body and draw it at `x * 8` and `y * 8`. 8 is the width and the height of a single part. On a 160x160 screen, it's big enough to fit snake that is 20*20=400 parts long.

:::note Importing w4
Keep in mind you need to import `w4` in case your editor doesn't do this for you.
:::

That's all fine, but since there is no instance of the snake, nothing can be drawn. To fix this, simply create a new variable in main and call it's draw function:

```typescript {1,4,14}
import { Point, Snake } from "./snake"
import * as w4 from "./wasm4"

const snake = new Snake()

export function start(): void {
    store<u32>(w4.PALETTE, 0xfbf7f3, 0 * sizeof<u32>())
    store<u32>(w4.PALETTE, 0xe5b083, 1 * sizeof<u32>())
    store<u32>(w4.PALETTE, 0x426e5d, 2 * sizeof<u32>())
    store<u32>(w4.PALETTE, 0x20283d, 3 * sizeof<u32>())
}

export function update(): void {
    snake.draw()
}
```

Creating a global instance of a snake with some default values.

After that, simply call the `draw` function of the snake.

You should see some green blocks at the top.

![Snake Body](images/draw-body.webp)

</Page>

<Page value="c">

// TODO

</Page>

<Page value="d">

// TODO

</Page>

<Page value="go">

To draw the snake, you can take advantage of Go's `range` keyword to loop through the body.
To make it a little easier, it's a good idea to use the `Rect` function of WASM-4:

```go
// Rect draws a rectangle. It uses color 1 to fill and color 2 for the outline
func Rect(x, y, width, height int)
```

With that out the way, let's see what a first draft could look like.

```go
func (s *Snake) Draw() {
	for _, part := range s.Body {
		w4.Rect(part.X*8, part.Y*8, 8, 8)
	}
}
```

Simply loop through the body and draw it at `X*8` and `Y*8`. 8 is the width and the height of a single part. On a 160x160 screen, it's big enough to fit snake that is 20*20=400 parts long.

:::note Importing cart/w4
Keep in mind you need to import `cart/w4` in case your editor doesn't do this for you.
:::

That's all fine, but since there is no instance of the snake, nothing can be drawn. To fix this, simply create a new variable in main and call it's draw function:

```go {9-18,30}
package main

import (
	"image"

	"cart/w4"
)

var (
	snake = &Snake{
		Body: []Point{
			{X: 2, Y: 0},
			{X: 1, Y: 0},
			{X: 0, Y: 0},
		},
		Direction: Point{X: 1, Y: 0},
	}
)

//go:export start
func start() {
	w4.PALETTE[0] = 0xfbf7f3
	w4.PALETTE[1] = 0xe5b083
	w4.PALETTE[2] = 0x426e5d
	w4.PALETTE[3] = 0x20283d
}

//go:export update
func update() {
	snake.Draw()
}
```

Creating a global instance of a snake with some default values.

After that, simply call the "Draw" function of the snake.

You should see some green blocks at the top.

![Snake Body](images/draw-body.webp)

</Page>

<Page value="nelua">

To draw the snake, you can take advantage of nelua's `for` syntax.
To make it a little easier, it's a good idea to use the `rect` function of WASM-4:

```lua
// rect draws a rectangle. It uses color 1 to fill and color 2 for the outline
global function rect(x: int32, y: int32, width: uint32, height: uint32)
```

With that out the way, let's see what a first draft could look like.

```lua
function Snake:draw()
  for i = 1, #self.body do
    rect(self.body[i].x * 8, self.body[i].y * 8, 8, 8)
  end
end
```

Simply loop through the body and draw it at `x * 8` and `y * 8`. 8 is the width and the height of a single part. On a 160x160 screen, it's big enough to fit snake that is 20*20=400 parts long.

That's all fine, but since we haven't initialized the snake, nothing can be drawn. To fix this, simply create a new variable in main and call it's draw function:

```lua {2-5, 17}
require "wasm4"
local Snake = require "snake"
local Point, Snake = Snake.Point, Snake.Snake

local snake = Snake.init()

$PALETTE = {
  0xfbf7f3,
  0xe5b083,
  0x426e5d,
  0x20283d
}

local function update()
  snake:draw()
end

## setup_wasm4_callbacks(update)
```

Creating a global variable of a snake with some default values.

After that, simply call the `draw` function of the snake.

You should see some green blocks at the top.

![Snake Body](images/draw-body.webp)

</Page>

<Page value="nim">

// TODO

</Page>

<Page value="odin">

// TODO

</Page>

<Page value="rust">

We'll add a new function `draw` inside `Snake` implementation.

To make it a little easier, it's a good idea to use the `rect` function of WASM-4 
that is already defined in `src/lib/wasm4.rs`:

```rust
// rect draws a rectangle. It uses color 1 to fill and color 2 for the outline
pub fn rect(x: i32, y: i32, width: u32, height: u32);
```

Simply loop through the body and draw it at `x * 8` and `y * 8` because our snake is made of 8x8 squares.

```rust
// `src/lib/snake.rs` inside `impl Snake {}` block
pub fn draw(&self) {
    for &Point { x, y } in self.body.iter() {
        wasm4::rect(x * 8, y * 8, 8, 8);
    }
}
```

:::note Importing wasm4
Keep in mind you need to import `wasm4`, in case your editor doesn't do this for you.

```rust
use crate::wasm4;
```
:::

---

That's all fine, but since there is no instance of the snake, nothing can be drawn. To fix this we are going to define a `Game` struct
inside `src/lib/game.rs`.

```rust
// src/lib/game.rs
use crate::snake::{Point, Snake};
use crate::wasm4;

pub struct Game {
    snake: Snake,
}

impl Game {
    pub fn new() -> Self {
      Self {
          snake: Snake::new(),
      }
    }

    pub fn update(&self) {
        self.snake.draw();
    }
}
```

We'll store a global `Game` instance using [`Mutex`](https://doc.rust-lang.org/std/sync/struct.Mutex.html), provided by the standard library, and the macro [`lazy_static`](https://crates.io/crates/lazy_static) from [crates.io](https://crates.io/).

```rust
// src/lib.rs
#[cfg(feature = "buddy-alloc")]
mod alloc;
mod game;
mod palette;
mod snake;
mod wasm4;
use game::Game;
use lazy_static::lazy_static;
use std::sync::Mutex;

lazy_static! {
    static ref SNAKE_GAME: Mutex<Game> = Mutex::new(Game::new());
}

#[no_mangle]
fn start() {
    palette::set_palette([0xfff6d3, 0xf9a875, 0xeb6b6f, 0x7c3f58]);
}

#[no_mangle]
fn update() {
    SNAKE_GAME.lock().expect("game_state").update();
}
```

:::note Using external libraries
[`lazy_static`](https://crates.io/crates/lazy_static) is an external library:

we have to declare inside the `dependencies` section of `Cargo.toml`, otherwise `rustc` does not know how to resolve it and will
not compile our game.

```toml
[dependencies]
buddy-alloc = { version = "0.4.1", optional = true }
lazy_static = "1.4.0"
```

See also:
- [using crates(rustbook)](https://doc.rust-lang.org/book/ch02-00-guessing-game-tutorial.html?highlight=dependencies#using-a-crate-to-get-more-functionality)
- [add a dependency(cargobook)](https://doc.rust-lang.org/cargo/guide/dependencies.html#adding-a-dependency)
:::

</Page>

<Page value="zig">

To draw the snake, you can take advantage of zig's `for` syntax.
To make it a little easier, it's a good idea to use the `rect` function of WASM-4:

```zig
// rect draws a rectangle. It uses color 1 to fill and color 2 for the outline
fn rect(x: i32, y: i32, width: u32, height: u32) void;
```

With that out the way, let's see what a first draft could look like.

```zig {2,9-13}
// Add this to the top of the file
const w4 = @import("wasm4.zig");

// ...

pub const Snake = struct {
    // ...

    pub fn draw(this: @This()) void {
        for(this.body.constSlice()) |part| {
            w4.rect(part.x * 8, part.y * 8, 8, 8);
        }
    }
}
```

Simply loop through the body and draw it at `x * 8` and `y * 8`. 8 is the width and the height of a single part. On a 160x160 screen, it's big enough to fit snake that is 20*20=400 parts long. This is where the 400 in the BoundedArray declaration comes from: we cap the number of elements to 400 at comptime so we don't have to deal with dynamically allocating memory for the points.

That's all fine, but since we haven't initialized the snake, nothing can be drawn. To fix this, simply create a new variable in main and call it's draw function:

```zig {2,4,16}
const w4 = @import("wasm4.zig");
const Snake = @import("snake.zig").Snake;

var snake = Snake.init();

export fn start() void {
    w4.PALETTE.* = .{
        0xfbf7f3,
        0xe5b083,
        0x426e5d,
        0x20283d,
    };
}

export fn update() void {
    snake.draw();
}
```

This creating a global variable of a snake with some default values.

After that, simply call the `draw` function of the snake.

You should see some green blocks at the top.

![Snake Body](images/draw-body.webp)

</Page>

</MultiLanguage>

## Drawing the Head

<MultiLanguage>

<Page value="assemblyscript">

But where is the head? You can pick a side. Either position `[0]` or position `[this.body.length - 1]`.

I think it's easier to pick `[0]`.

Since the body is drawn, head is not much of a problem. Simply use the `rect` function again. But use a specific part instead:

```typescript
    w4.rect(this.body[0].x * 8, this.body[0].y * 8, 8, 8)
```

The draw function should now look like this:

```typescript {3}
draw(): void {
    this.body.forEach(part => w4.rect(part.x * 8, part.y * 8, 8, 8))
    w4.rect(this.body[0].x * 8, this.body[0].y * 8, 8, 8)
}
```

Notice the difference? Me neither.

The head should stand out a little. For this, you can use a different color:

```typescript
store<u16>(w4.DRAW_COLORS, 0x0004)
```

You can set the colors with this variable. You can look at this variable like a table that is read from right to left.

The value for each digit can be  0 up to 4:

- 0 = Use transparency
- 1 = Use the 1st color from the color palette
- 2 = Use the 2nd color from the color palette
- 3 = Use the 3rd color from the color palette
- 4 = Use the 4th color from the color palette

The snippet above reads like this: "Color 1 uses Color 4 of the color palette, Color 2 to Color 4 don't use any color." The basic drawing functions use "Color 1" to fill the shape and "Color 2" for the border.

If you change the source to

```typescript {4}
draw(): void {
    this.body.forEach(part => w4.rect(part.x * 8, part.y * 8, 8, 8))

    store<u16>(w4.DRAW_COLORS, 0x0004)
    w4.rect(this.body[0].x * 8, this.body[0].y * 8, 8, 8)
}
```

Result:

![Changing Color](images/draw-body-2.webp)

You'll see a change. The snake changed color. Not only the head, but the complete snake! Once you've set a color, it stays that way. So if you want to change only the head, you have to change Color 1 again. Right before you draw the body.

```typescript {2}
draw(): void {
    store<u16>(w4.DRAW_COLORS, 0x0043)
    this.body.forEach(part => w4.rect(part.x * 8, part.y * 8, 8, 8))

    store<u16>(w4.DRAW_COLORS, 0x0004)
    w4.rect(this.body[0].x * 8, this.body[0].y * 8, 8, 8)
}
```

This changes the color back and adds the darker green as it's outline.

![Snake with outline](images/draw-body-3.webp)

</Page>

<Page value="c">

// TODO

</Page>

<Page value="d">

// TODO

</Page>

<Page value="go">

But where is the head? You can pick a side. Either position `[0]` or position `[len(snake)-1]`.

I think it's easier to pick `[0]`.

Since the body is drawn, head is not much of a problem. Simply use the `Rect` function again. But use a specific part instead:

```go
	w4.Rect(s.Body[0].X*8, s.Body[0].Y*8, 8, 8)
```

The draw function should now look like this:

```go {6}
func (s *Snake) Draw() {
	for _, part := range s.Body {
		w4.Rect(part.X*8, part.Y*8, 8, 8)
	}

	w4.Rect(s.Body[0].X*8, s.Body[0].Y*8, 8, 8)
}
```

Notice the difference? Me neither.

The head should stand out a little. For this, you can use a different color:

```go
*w4.DRAW_COLORS = 0x0004
```

You can set the colors with this variable. You can look at this variable like a table that is read from right to left.

The value for each digit can be  0 up to 4:

- 0 = Use transparency
- 1 = Use the 1st color from the color palette
- 2 = Use the 2nd color from the color palette
- 3 = Use the 3rd color from the color palette
- 4 = Use the 4th color from the color palette

The snippet above reads like this: "Color 1 uses Color 4 of the color palette, Color 2 to Color 4 don't use any color." The basic drawing functions use "Color 1" to fill the shape and "Color 2" for the border.

If you change the source to

```go {6}
func (s *Snake) Draw() {
	for _, part := range s.Body {
		w4.Rect(part.X*8, part.Y*8, 8, 8)
	}

	*w4.DRAW_COLORS = 0x0004
	w4.Rect(s.Body[0].X*8, s.Body[0].Y*8, 8, 8)
}
```

Result:

![Changing Color](images/draw-body-2.webp)

You'll see a change. The snake changed color. Not only the head, but the complete snake! Once you've set a color, it stays that way. So if you want to change only the head, you have to change Color 1 again. Right before you draw the body.

```go {2}
func (s *Snake) Draw() {
	*w4.DRAW_COLORS = 0x0043
	for _, part := range s.Body {
		w4.Rect(part.X*8, part.Y*8, 8, 8)
	}

	*w4.DRAW_COLORS = 0x0004
	w4.Rect(s.Body[0].X*8, s.Body[0].Y*8, 8, 8)
}
```

This changes the color back and adds the darker green as it's outline.

![Snake with outline](images/draw-body-3.webp)

</Page>

<Page value="nelua">

But where is the head? You can pick a side. Either position `[1]` or position `[#self.body]`.

I think it's easier to pick `[1]`.

Since the body is drawn, head is not much of a problem. Simply use the `rect` function again. But use a specific part instead:

```lua
  rect(self.body[1].x * 8, self.body[1].y * 8, 8, 8)
```

The draw function should now look like this:

```lua {7}
function Snake:draw()
  for i = 1, #self.body do
    rect(self.body[i].x * 8, self.body[i].y * 8, 8, 8)
  end

  rect(self.body[1].x * 8, self.body[1].y * 8, 8, 8)
end
```

Notice the difference? Me neither.

The head should stand out a little. For this, you can use a different color:

```lua
$DRAW_COLORS = 0x0004;
```

You can set the colors with this variable. You can look at this variable like a table that is read from right to left.

The value for each digit can be  0 up to 4:

- 0 = Use transparency
- 1 = Use the 1st color from the color palette
- 2 = Use the 2nd color from the color palette
- 3 = Use the 3rd color from the color palette
- 4 = Use the 4th color from the color palette

The snippet above reads like this: "Color 1 uses Color 4 of the color palette, Color 2 to Color 4 don't use any color." The basic drawing functions use "Color 1" to fill the shape and "Color 2" for the border.

If you change the source to

```lua {7}
function Snake:draw()
  for i = 1, #self.body do
    rect(self.body[i].x * 8, self.body[i].y * 8, 8, 8)
  end

  $DRAW_COLORS = 0x0004;
  rect(self.body[1].x * 8, self.body[1].y * 8, 8, 8)
end
```

Result:

![Changing Color](images/draw-body-2.webp)

You'll see a change. The snake changed color. Not only the head, but the complete snake! Once you've set a color, it stays that way. So if you want to change only the head, you have to change Color 1 again. Right before you draw the body.

```lua {2}
function Snake:draw()
  $DRAW_COLORS = 0x0043;
  for i = 1, #self.body do
    rect(self.body[i].x * 8, self.body[i].y * 8, 8, 8)
  end

  $DRAW_COLORS = 0x0004;
  rect(self.body[1].x * 8, self.body[1].y * 8, 8, 8)
end
```

This changes the color back and adds the darker green as it's outline.

![Snake with outline](images/draw-body-3.webp)

</Page>

<Page value="nim">

// TODO

</Page>

<Page value="odin">

// TODO

</Page>

<Page value="rust">

But where is the head? You can pick a side. Either position `0` or position `self.body.len() - 1`.
I think it's easier to pick `0`.

Since the body is drawn, head is not much of a problem. Simply use the `rect` function again. But use a specific part instead:

```rust {8}
// `src/lib/palette.rs` inside `impl Snake {}` block
pub fn draw(&self) {
    for &Point { x, y } in self.body.iter() {
        wasm4::rect(x * 8, y * 8, 8, 8);
    }

    wasm4::rect(self.body[0].x * 8, self.body[0].y * 8, 8, 8);
}
```

Notice the difference? Me neither.
The head should stand out a little. For this, you can use a different color.

We'll create a helper function inside `src/lib/palette.rs` to confine the `unsafe` code.

```rust
// src/lib/palette.rs
pub fn set_draw_color<T: Into<u16>>(idx: T) {
    unsafe { *wasm4::DRAW_COLORS = idx.into() }
}
```

Then we'll invoke `draw_color` inside `src/lib/snake.rs`:

```rust {7}
// src/lib/snake.rs
pub fn draw(&self) {
    for &Point { x, y } in self.body.iter() {
        wasm4::rect(x * 8, y * 8, 8, 8);
    }

    set_draw_color(0x4u16);
    wasm4::rect(self.body[0].x * 8, self.body[0].y * 8, 8, 8);
}
```

Result:

![Changing Color](images/draw-body-2.webp)

You'll see a change. The snake changed color. Not only the head, but the complete snake! Once you've set a color, it stays that way. So if you want to change only the head, you have to change color 1 again. Right before you draw the body.

```rust {3}
// src/lib/snake.rs
pub fn draw(&self) {
    set_draw_color(0x43u16);

    for &Point { x, y } in self.body.iter() {
        wasm4::rect(x * 8, y * 8, 8, 8);
    }

    set_draw_color(0x4u16);
    wasm4::rect(self.body[0].x * 8, self.body[0].y * 8, 8, 8);
}
```

This changes the color back and adds the darker green as it's outline.

![Snake with outline](images/draw-body-3.webp)

</Page>

<Page value="zig">

But where is the head? You can pick a side. Either position `[0]` or position `[this.body.length - 1]`.

I think it's easier to pick `[0]`.

Since the body is drawn, head is not much of a problem. Simply use the `rect` function again. But use a specific part instead:

```zig
    w4.rect(this.body[0].x * 8, this.body[0].y * 8, 8, 8)
```

The draw function should now look like this:

```zig {6}
pub fn draw(this: @This()) void {
    for(this.body.constSlice()) |part| {
        w4.rect(part.x * 8, part.y * 8, 8, 8);
    }

    w4.rect(this.body.get(0).x * 8, this.body.get(0).y * 8, 8, 8);
}
```

Notice the difference? Me neither.

The head should stand out a little. For this, you can use a different color:

```zig
w4.DRAW_COLORS.* = 0x0004;
```

You can set the colors with this variable. You can look at this variable like a table that is read from right to left.

The value for each digit can be  0 up to 4:

- 0 = Use transparency
- 1 = Use the 1st color from the color palette
- 2 = Use the 2nd color from the color palette
- 3 = Use the 3rd color from the color palette
- 4 = Use the 4th color from the color palette

The snippet above reads like this: "Color 1 uses Color 4 of the color palette, Color 2 to Color 4 don't use any color." The basic drawing functions use "Color 1" to fill the shape and "Color 2" for the border.

If you change the source to

```zig {6}
pub fn draw(this: @This()) void {
    for(this.body.constSlice()) |part| {
        w4.rect(part.x * 8, part.y * 8, 8, 8);
    }

    w4.DRAW_COLORS.* = 0x0004;
    w4.rect(this.body.get(0).x * 8, this.body.get(0).y * 8, 8, 8);
}
```

Result:

![Changing Color](images/draw-body-2.webp)

You'll see a change. The snake changed color. Not only the head, but the complete snake! Once you've set a color, it stays that way. So if you want to change only the head, you have to change Color 1 again. Right before you draw the body.

```zig {2}
pub fn draw(this: @This()) void {
    w4.DRAW_COLORS.* = 0x0043;
    for(this.body.constSlice()) |part| {
        w4.rect(part.x * 8, part.y * 8, 8, 8);
    }

    w4.DRAW_COLORS.* = 0x0004;
    w4.rect(this.body.get(0).x * 8, this.body.get(0).y * 8, 8, 8);
}
```

This changes the color back and adds the darker green as it's outline.

![Snake with outline](images/draw-body-3.webp)

</Page>

</MultiLanguage>
