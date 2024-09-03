import MultiLanguage, {Page} from '@site/src/components/MultiLanguage';

# User Input

With a moving snake, you've done a good part of the game. This part lets you give the control into the players hands. WASM-4 supports both [gamepad](/docs/guides/user-input#gamepad) and [mouse input](/docs/guides/user-input#mouse), but for this tutorial we will only use gamepad input. If the player presses a certain button, you just have to change the values of the "Direction"-Property of your snake.

That's it.

But first, you need to understand how WASM-4 handles user input.

## Gamepad Basics

WASM-4 accepts up to 4 gamepads and provides 4 variables that represent the current state of this gamepads. It contains a value `0` (zero) if nothing has been pressed; otherwise, it contains a sum of the buttons pressed, based on the table below:

| Button   | Value |
|----------|:-----:|
| Button 1 | 1     |
| Button 2 | 2     |
| Left     | 16    |
| Right    | 32    |
| Up       | 64    |
| Down     | 128   |

So if the player presses "Right" and "Button 1", the value would be 33. Now are all values "a power of two", meaning you can set and check them using binary operators.

If you want to check if Button 1 is pressed, simply use the binary AND:

This is true for all other buttons too.

## Keyboard Layout

For the player side of things, WASM-4 tries to cover most keyboard layouts:

- X and Space = Button 1
- Y, C and Z = Button 2

This should cover QWERTY, QWERTZ and Dvorak layouts.

The gamepads for the players 2, 3 and 4 are currently not implemented.

## Detecting `justPressed`

Since the current state of the gamepad is stored in a single variable, you need to compare it to the previous state.

You can achieve this by using the bitwise XOR operator. To make it short, here is the code snippet you can use:

<MultiLanguage>

<Page value="assemblyscript">

```typescript
const gamepad = load<u8>(w4.GAMEPAD1);
const justPressed = gamepad & (gamepad ^ prevState)
```

The constant `justPressed` now holds all buttons that were pressed this frame. You can check the state of a single button like this:

```go
if (justPressed & w4.BUTTON_UP) {
	// Do something
}
```

</Page>

<Page value="c">

```c
const uint8_t just_pressed = *GAMEPAD1 & (*GAMEPAD1 ^ prev_state);
```

The variable `just_pressed` now holds all buttons that were pressed this frame, `prev_state` which we will define in a moment, holds the gamepad state from the previous frame. You can check the state of a single button like this:

```c
if (just_pressed & BUTTON_UP)
{
    //move snake up
} 
```

</Page>

<Page value="d">

// TODO

</Page>

<Page value="go">

```go
justPressed := *w4.GAMEPAD1 & (*w4.GAMEPAD1 ^ prevState)
```

The variable `justPressed` now holds all buttons that were pressed this frame. You can check the state of a single button like this:

```go
if justPressed&w4.BUTTON_UP != 0 {
	// Do something
}
```

</Page>

<Page value="nelua">

```lua
local gamepad = $GAMEPAD1
local just_pressed = gamepad & (gamepad ~ prev_state)
```

The constant `just_pressed` now holds all buttons that were pressed this frame. You can check the state of a single button like this:

```lua
if just_pressed & BUTTON_UP ~= 0 then
  -- Do something
end
```

</Page>

<Page value="nim">

// TODO

</Page>

<Page value="odin">

// TODO

</Page>

<Page value="porth">

// TODO

</Page>

<Page value="rust">

```rust
let gamepad = unsafe { *wasm4::GAMEPAD1 };
let just_pressed = gamepad & (gamepad ^ prev_gamepad);
```

The constant `just_pressed` now holds all buttons that were pressed this frame. You can check the state of a single button like this:

```rust
if just_pressed & wasm4::BUTTON_UP != 0 {
  // Do something
}
```

</Page>

<Page value="wat">

```wasm
(local $gamepad i32)
(local $just-pressed i32)

;; gamepad = *GAMEPAD;
(local.set $gamepad (i32.load8_u (global.get $GAMEPAD1)))

;; just-pressed = gamepad & (gamepad ^ prev-state);
(local.set $just-pressed
  (i32.and
    (local.get $gamepad)
    (i32.xor
      (local.get $gamepad)
      (global.get $prev-state))))

```

The local variable `just-pressed` now holds all buttons that were pressed this frame. You can check the state of a single button like this:

```wasm
(if (i32.and (local.get $just-pressed) (global.get $BUTTON_UP))
  (then
    ;; Do something
  )
)
```

</Page>

<Page value="zig">

```zig
const gamepad = w4.GAMEPAD1.*;
const just_pressed = gamepad & (gamepad ^ prev_state);
```

The constant `just_pressed` now holds all buttons that were pressed this frame. You can check the state of a single button like this:

```zig
if (just_pressed & w4.BUTTON_UP != 0) {
    // Do something
}
```

</Page>

</MultiLanguage>

If you don't care *why* that is, [skip to the next part](#changing-directions).

Like I explained in "Gamepad Basics", the value of Gamepad 1 is a combination of all currently pressed buttons. If we store it and use XOR or later on, we only get the differences.

Let's assume the right button is currently pressed. In that case Gamepad 1 has the value 32 (Right = 32). Now the player presses Button 1. The value changes from 32 to 33 (Button 1 + Right = 1 + 32 = 33). By using XOR, we get 1 as a result.

In the next step, we compare it to the current state. Like: What buttons are *new* this frame.

Here's a "hands-on" example:

```
Frame 0: Gamepad1 = 0 (No buttons are pressed)
Frame 1: Gamepad1 = 32 (Right button is pressed)

Difference between Frame 0 and 1:
  00000000 (0)
^ 00100000 (32)
= 00100000 (32)

What's new:
  00100000 (32)
& 00100000 (32)
= 00100000 (32)

Result: "32" is new

----

Frame 2: Gamepad1 = 33 (Right button and Button 1 are pressed)

Differences between Frame 1 and 2:
  00100000 (32)
^ 00100001 (33)
= 00000001 (1)

What's new:
  00000001 (1)
& 00100001 (33)
= 00000001 (1)

Result: "1" is new

----

Frame 3: Gamepad1 = 1 (Button 1 is pressed, Right button got released)

Difference between Frame 2 and 3:
  00100001 (33)
^ 00000001 (1)
= 00100000 (32)

What's new:
  00100000 (32)
& 00000001 (1)
= 00000000 (0)

Result: No new key was pressed this frame.

```

## Changing Directions

Now that you know how to detect if a key was pressed in the current frame, it's time you let the player change the direction of the snake.

Like most of this tutorial, this is step is rather easy once you've grasped how it works.

For this, you need to change the update function of in the main file. Remember, this is how it currently looks like:

<MultiLanguage>

<Page value="assemblyscript">

```typescript
export function update(): void {
    frameCount++

    if (frameCount % 15 == 0) {
        snake.update()
    }

    snake.draw()
}
```

</Page>

<Page value="c">


```c
void update () 
{
    frame_count++;
    if(frame_count % 15 == 0)
    {
      snake_update(&snake);
    }
    snake_draw(&snake);
}
```



</Page>

<Page value="d">

// TODO

</Page>

<Page value="go">

```go
//go:export update
func update() {
	frameCount++

	if frameCount%15 == 0 {
		snake.Update()
	}

	snake.Draw()
}
```

</Page>

<Page value="nelua">

```lua
local function update()
  frame_count = frame_count + 1

  if frame_count % 15 == 0 then
    snake:update()
  end

  snake:draw()
end
```

</Page>

<Page value="nim">

// TODO

</Page>

<Page value="odin">

// TODO

</Page>

<Page value="porth">

// TODO

</Page>

<Page value="rust">

```rust
// src/game.rs
use crate::snake::{Point, Snake};
use crate::wasm4;

pub struct Game {
    snake: Snake,
    frame_count: u32,
}

impl Game {
    pub fn new() -> Self {
        Self {
            snake: Snake::new(),
            frame_count: 0,
        }
    }

    pub fn update(&mut self) {
        self.frame_count += 1;

        if self.frame_count % 15 == 0 {
            self.snake.update();
        }
        self.snake.draw();
    }
}
```

</Page>

<Page value="wat">

```wasm
(func (export "update")
  ;; frame-count = frame-count + 1;
  (global.set $frame-count (i32.add (global.get $frame-count) (i32.const 1)))

  ;; if ((frame-count % 15) == 0) ...
  (if (i32.eqz (i32.rem_u (global.get $frame-count) (i32.const 15)))
    (then
      (call $snake-update)))

  (call $snake-draw)
)
```

</Page>

<Page value="zig">

```zig
export fn update() void {
    frame_count += 1;

    if (frame_count % 15 == 0) {
        snake.update()
    }

    snake.draw()
}
```

</Page>

</MultiLanguage>

The classic processing loop goes like this: Input, Process the input, output the result. Or in case of most games: User-Input, Update, Render. The last two steps are already in place. Now it's time to add the first part.

<MultiLanguage>

<Page value="assemblyscript">

It's a good idea to handle the input in its own function. Something like this could be on your mind:

```typescript {1-8,13}
function input(): void {
    const gamepad = load<u8>(w4.GAMEPAD1);
    const justPressed = gamepad & (gamepad ^ prevState)

    if (justPressed & w4.BUTTON_UP) {
        // Do something
    }
}

export function update(): void {
    frameCount++

    input()

    if (frameCount % 15 == 0) {
        snake.update()
    }

    snake.draw()
}
```

If you try to compile this, you should get an error: `ERROR TS2304: Cannot find name 'prevState'.`. This is easily fixed. Just place the prevState into the var-section:

```typescript {2}
const snake = new Snake()
let prevState: u8
let frameCount = 0
```

To notice any change in the gamepad, you have to store the *current state* at the end of the input. This will make it the *previous state*. And while you're at it, why not add the other 3 directions along the way:

```typescript {8-18}
function input(): void {
    const gamepad = load<u8>(w4.GAMEPAD1);
    const justPressed = gamepad & (gamepad ^ prevState)

    if (justPressed & w4.BUTTON_LEFT) {
        // Do something
    }
    if (justPressed & w4.BUTTON_RIGHT) {
        // Do something
    }
    if (justPressed & w4.BUTTON_UP) {
        // Do something
    }
    if (justPressed & w4.BUTTON_DOWN) {
        // Do something
    }

    prevState = gamepad
}
```

If you want to check if it works: Use the `trace` function provided by WASM-4. Here's an example:

```typescript
    if (justPressed & w4.BUTTON_DOWN) {
        w4.trace("down")
    }
```

If you use `trace` in each if-statement, you should see the corresponding output in the console.

Now, instead of using `trace` to confirm everything works as intended, you should replace it with something like this:

```typescript
    if (justPressed & w4.BUTTON_DOWN) {
        snake.down()
    }
```

I'll leave it to you, to finish the other 3 directions.

You'll be - once again - rewarded with error messages:

```
ERROR TS2339: Property 'up' does not exist on type 'src/snake/Snake'.
ERROR TS2339: Property 'down' does not exist on type 'src/snake/Snake'.
ERROR TS2339: Property 'left' does not exist on type 'src/snake/Snake'.
ERROR TS2339: Property 'right' does not exist on type 'src/snake/Snake'.
```

To fix this, add those functions to your snake. Here's an example for `down`:

```typescript
    down(): void {
        if (this.direction.y == 0) {
            this.direction.x = 0
            this.direction.y = 1
        }
    }
```

</Page>

<Page value="c">

It's a good idea to handle the input in its own function. Something like this could be on your mind:

```c {1-9,15}
void input()
{
  const uint8_t just_pressed = *GAMEPAD1 & (*GAMEPAD1 ^ prev_state);

  if (just_pressed & BUTTON_UP)
  {
    //move snake up
  } 
}

void update () 
{
  frame_count++;

  input();

  if(frame_count % 15 == 0)
  {
    snake_update(&snake);
  }
  snake_draw(&snake);
}
```

If you try to compile this, you should get an error as `prev_state` is not yet declared. Place `prev_state` at the top of `main.c`:

```c {7}
#include "wasm4.h"
#include "snake.h"
#include <stdlib.h>

struct snake snake;
int frame_count = 0;
uint8_t prev_state = 0;
```

To notice any change in the gamepad, you have to store the *current state* at the end of the input. This will make it the *previous state*. And while you're at it, why not add the other 3 directions along the way:

```c {9-23}
void input()
{
    const uint8_t just_pressed = *GAMEPAD1 & (*GAMEPAD1 ^ prev_state);

    if (just_pressed & BUTTON_UP)
    {
        //move snake up
    } 
    if(just_pressed & BUTTON_DOWN)
    {
        //move snake down
    }
    if(just_pressed & BUTTON_LEFT)
    {
        //move snake left
    }
    if(just_pressed & BUTTON_RIGHT)
    {
        //move snake right
    }
 
    prev_state = *GAMEPAD1;
}
```

If you want to check if it works: Use the `trace` function provided by WASM-4. Here's an example:

```c
    if (just_pressed & BUTTON_UP)
    {
        trace("Button up");
    } 
```

If you use `trace` in each if-statement, you should see the corresponding output in the console.

Now, instead of using `trace` to confirm everything works as intended, you should replace it with something like this:

```c
    if (just_pressed & BUTTON_UP)
    {
        snake_up(&snake);
    } 
```

Fill in equivalent code for the remaining three directions and then add the function declarations to the `snake.h` file:

```c
void snake_up(struct snake *snake);
void snake_down(struct snake *snake);
void snake_left(struct snake *snake);
void snake_right(struct snake *snake);
```

Now add the bodies of these functions to `snake.c`. Here's an example for `snake_down`:

```c
void snake_down(struct snake *snake)
{
    if(snake->direction.y == 0)
    { 
        snake->direction = (struct point){0,1};
    }
}
```

</Page>

<Page value="d">

// TODO

</Page>

<Page value="go">

It's a good idea to handle the input in its own function. Something like this could be on your mind:

```go {1-7,13}
func input() {
	justPressed := *w4.GAMEPAD1 & (*w4.GAMEPAD1 ^ prevState)

	if justPressed&w4.BUTTON_UP != 0 {
		// Do something
	}
}

//go:export update
func update() {
	frameCount++

	input()

	if frameCount%15 == 0 {
		snake.Update()
	}

	snake.Draw()
}
```

If you try to compile this, you should get an error: `undeclared name: prevState`. This is easily fixed. Just place the prevState into the var-section:

```go {11}
var (
	snake = &Snake{
		Body: []Point{
			{X: 2, Y: 0},
			{X: 1, Y: 0},
			{X: 0, Y: 0},
		},
		Direction: Point{X: 1, Y: 0},
	}
	frameCount = 0
	prevState  uint8
)
```

To notice any change in the gamepad, you have to store the *current state* at the end of the input. This will make it the *previous state*. And while you're at it, why not add the other 3 directions along the way:

```go {7-17}
func input() {
	justPressed := *w4.GAMEPAD1 & (*w4.GAMEPAD1 ^ prevState)

	if justPressed&w4.BUTTON_UP != 0 {
		// Do something
	}
	if justPressed&w4.BUTTON_DOWN != 0 {
		// Do something
	}
	if justPressed&w4.BUTTON_LEFT != 0 {
		// Do something
	}
	if justPressed&w4.BUTTON_RIGHT != 0 {
		// Do something
	}

	prevState = *w4.GAMEPAD1
}
```

If you want to check if it works: Use the `Trace` function provided by WASM-4. Here's an example:

```go
	if justPressed&w4.BUTTON_DOWN != 0 {
		w4.Trace("Down")
	}
```

If you use `Trace` in each if-statement, you should see the corresponding output in the console.

Now, instead of using `Trace` to confirm everything works as intended, you should replace it with something like this:

```go
	if justPressed&w4.BUTTON_DOWN != 0 {
		snake.Down()
	}
```

I'll leave it to you, to finish the other 3 directions.

You'll be - once again - rewarded with error messages:

```
snake.Up undefined (type *Snake has no field or method Up)
snake.Down undefined (type *Snake has no field or method Down)
snake.Left undefined (type *Snake has no field or method Left)
snake.Right undefined (type *Snake has no field or method Right)
```

To fix this, add those functions to your snake. Here's an example for `Down`:

```go
func (s *Snake) Down() {
	if s.Direction.Y == 0 {
		s.Direction = Point{X: 0, Y: 1}
	}
}
```

</Page>

<Page value="nelua">

It's a good idea to handle the input in its own function. Something like this could be on your mind:

```lua {1-8,13}
local function input()
  local gamepad = $GAMEPAD1
  local just_pressed = gamepad & (gamepad ~ prev_state)

  if just_pressed & BUTTON_UP ~= 0 then
    -- Do something
  end
end

local function update()
  frame_count = frame_count + 1

  input()

  if frame_count % 15 == 0 then
    snake:update()
  end

  snake:draw()
end
```

If you try to compile this, you should get an error: `error: undeclared symbol 'prev_state'`. This is easily fixed. Just place the prev_state into the var-section:

```lua {3}
local snake = Snake.init()
local frame_count = 0
local prev_state = 0
```

To notice any change in the gamepad, you have to store the *current state* at the end of the input. This will make it the *previous state*. And while you're at it, why not add the other 3 directions along the way:

```lua {5-18}
local function input()
  local gamepad = $GAMEPAD1
  local just_pressed = gamepad & (gamepad ~ prev_state)

  if just_pressed & BUTTON_LEFT ~= 0 then
    -- Do something
  end
  if just_pressed & BUTTON_RIGHT ~= 0 then
    -- Do something
  end
  if just_pressed & BUTTON_UP ~= 0 then
    -- Do something
  end
  if just_pressed & BUTTON_DOWN ~= 0 then
    -- Do something
  end

  prev_state = gamepad
end
```

If you want to check if it works: Use the `trace` function provided by WASM-4. Here's an example:

```lua
if just_pressed & BUTTON_DOWN ~= 0 then
  trace("down")
end
```

If you use `trace` in each if-statement, you should see the corresponding output in the console.

Now, instead of using `trace` to confirm everything works as intended, you should replace it with something like this:

```lua
if just_pressed & BUTTON_DOWN ~= 0 then
  snake:down()
end
```

I'll leave it to you, to finish the other 3 directions.

You'll be - once again - rewarded with an error message:

```
src/main.nelua:1:1: from: AST node Block
require "wasm4"
^~~~~~~~~~~~~~~
src/main.nelua:19:3: from: AST node Block
  local gamepad = $GAMEPAD1
  ^~~~~~~~~~~~~~~~~~~~~~~~~
src/main.nelua:23:5: from: AST node Block
    snake:left()
    ^~~~~~~~~~~~
src/main.nelua:23:10: error: cannot index meta field 'left' for type 'snake.Snake'
    snake:left()
         ^~~~~~~
```

Nelua will only list this first unknown it finds, but you'll get an error for each function as you add them. To fix the errors, add those functions to your snake. Here's an example for `down`:

```lua
function Snake:down()
  if self.direction.y == 0 then
    self.direction = {x = 0, y = 1}
  end
end
```

</Page>

<Page value="nim">

// TODO

</Page>

<Page value="odin">

// TODO

</Page>

<Page value="porth">

// TODO

</Page>

<Page value="rust">

It's a good idea to handle the input in its own function. Something like this could be on your mind:

```rust {21,29-36}
// src/game.rs
use crate::snake::{Point, Snake};
use crate::wasm4;

pub struct Game {
    snake: Snake,
    frame_count: u32,
}

impl Game {
    pub fn new() -> Self {
        Self {
            snake: Snake::new(),
            frame_count: 0,
        }
    }

    pub fn update(&mut self) {
        self.frame_count += 1;

        self.input();

        if self.frame_count % 15 == 0 {
            self.snake.update();
        }
        self.snake.draw();
    }

    pub fn input(&mut self) {
        let gamepad = unsafe { *wasm4::GAMEPAD1 };
        let just_pressed = gamepad & (gamepad ^ prev_gamepad);

        if just_pressed & wasm4::BUTTON_UP != 0 {
          // Do something
        }
    }
}
```

If you try to compile this, you should get an error: `cannot find value prev_gamepad in this scope`.
Just place `prev_gamepad` in `Game`.

```rust {8,16}
// src/game.rs
use crate::snake::{Point, Snake};
use crate::wasm4;

pub struct Game {
    snake: Snake,
    frame_count: u32,
    prev_gamepad: u8,
}

impl Game {
    pub fn new() -> Self {
        Self {
            snake: Snake::new(),
            frame_count: 0,
            prev_gamepad: 0,
        }
    }
}
```

To notice any change in the gamepad, you have to store the *current state* at the end of the input. This will make it the *previous state*. And while you're at it, why not add the other 3 directions along the way:

```rust
// src/game.rs
use crate::snake::{Point, Snake};
use crate::wasm4;

pub struct Game {
    snake: Snake,
    frame_count: u32,
}

impl Game {
    pub fn new() -> Self {
        Self {
            snake: Snake::new(),
            frame_count: 0,
        }
    }

    pub fn update(&mut self) {
        self.frame_count += 1;

        self.input();

        if self.frame_count % 15 == 0 {
            self.snake.update();
        }
        self.snake.draw();
    }

    pub fn input(&mut self) {
        let gamepad = unsafe { *wasm4::GAMEPAD1 };
        let just_pressed = gamepad & (gamepad ^ self.prev_gamepad);

        if just_pressed & wasm4::BUTTON_LEFT != 0 {
            // Do something
        }
        if just_pressed & wasm4::BUTTON_RIGHT != 0 {
            // Do something
        }
        if just_pressed & wasm4::BUTTON_UP != 0 {
            // Do something
        }
        if just_pressed & wasm4::BUTTON_DOWN != 0 {
            // Do something
        }

        self.prev_gamepad = gamepad;
    }
}
```


If you want to check if it works: Use the `trace` function provided by WASM-4. Here's an example:

```rust
// src/game.rs
if just_pressed & wasm4::BUTTON_DOWN != 0 {
    wasm4::trace("down");
}
```

If you use `trace` in each if-statement, you should see the corresponding output in the console.

Now, instead of using `trace` to confirm everything works as intended, you should replace it with something like this:

```rust
// src/game.rs
if just_pressed & wasm4::BUTTON_DOWN != 0 {
   self.snake.down();
}
```

I'll leave it to you, to finish the other 3 directions.

You'll be - once again - rewarded with an error message:

```
no method named `down` found for struct `Snake` in the current scope
method not found in `Snake`
```

To fix the errors, add those functions to your snake. Here's an example for `down`:

```rust
// src/snake.rs
    pub fn down(&mut self) {
        if self.direction.y == 0 {
            self.direction = Point { x: 0, y: 1 };
        }
    }
```

</Page>

<Page value="wat">

It's a good idea to handle the input in its own function. Something like this could be on your mind:

```wasm
(func $input
  (local $gamepad i32)
  (local $just-pressed i32)

  ;; gamepad = *GAMEPAD;
  (local.set $gamepad (i32.load8_u (global.get $GAMEPAD1)))

  ;; just-pressed = gamepad & (gamepad ^ prev-state);
  (local.set $just-pressed
    (i32.and
      (local.get $gamepad)
      (i32.xor
        (local.get $gamepad)
        (global.get $prev-state))))

  (if (i32.and (local.get $just-pressed) (global.get $BUTTON_LEFT))
    (then
      ;; Do something
    )
  )
)

(func (export "update")
  ;; frame-count = frame-count + 1;
  (global.set $frame-count (i32.add (global.get $frame-count) (i32.const 1)))

  (call $input)

  ;; if ((frame-count % 15) == 0) ...
  (if (i32.eqz (i32.rem_u (global.get $frame-count) (i32.const 15)))
    (then
      (call $snake-update)))

  (call $snake-draw)
)
```


If you try to compile this, you should get an error: `error: undefined local variable "$prev-state"`. This is easily fixed. Just create a `$prev-state` global variable:

```wasm
(global $prev-state (mut i32) (i32.const 0))
```

To notice any change in the gamepad, you have to store the *current state* at the end of the input. This will make it the *previous state*. And while you're at it, why not add the other 3 directions along the way:

```wasm
(func $input
  (local $gamepad i32)
  (local $just-pressed i32)

  ;; gamepad = *GAMEPAD;
  (local.set $gamepad (i32.load8_u (global.get $GAMEPAD1)))

  ;; just-pressed = gamepad & (gamepad ^ prev-state);
  (local.set $just-pressed
    (i32.and
      (local.get $gamepad)
      (i32.xor
        (local.get $gamepad)
        (global.get $prev-state))))

  (if (i32.and (local.get $just-pressed) (global.get $BUTTON_LEFT))
    (then
      ;; Do something
    )
  )

  (if (i32.and (local.get $just-pressed) (global.get $BUTTON_RIGHT))
    (then
      ;; Do something
    )
  )

  (if (i32.and (local.get $just-pressed) (global.get $BUTTON_UP))
    (then
      ;; Do something
    )
  )

  (if (i32.and (local.get $just-pressed) (global.get $BUTTON_DOWN))
    (then
      ;; Do something
    )
  )

  (global.set $prev-state (local.get $gamepad))
)
```

If you want to check if it works: Use the `trace` function provided by WASM-4. Here's an example:

```wasm
  (import "env" "trace" (func $trace (param i32)))

  ;; Put the string somewhere unused in memory.
  (data (i32.const 0x3000) "down\00")

  (func $input
    ...

    ;; LEFT
    (if (i32.and (local.get $just-pressed) (global.get $BUTTON_LEFT))
      (then
        (call $trace (i32.const 0x3000))
      )
    )

    ...
  )
```

If you use `trace` in each if-statement, you should see the corresponding output in the console.

Now, instead of using `trace` to confirm everything works as intended, you should replace it with something like this:

```wasm
    (if (i32.and (local.get $just-pressed) (global.get $BUTTON_LEFT))
      (then
        (call $snake-down)))
```

I'll leave it to you, to finish the other 3 directions.

You'll be - once again - rewarded with error messages:

```
main.wat:127:13: error: undefined function variable "$snake-left"
      (call $snake-left)
            ^^^^^^^^^^^
main.wat:134:13: error: undefined function variable "$snake-right"
      (call $snake-right)
            ^^^^^^^^^^^^
main.wat:141:13: error: undefined function variable "$snake-up"
      (call $snake-up)
            ^^^^^^^^^
main.wat:148:13: error: undefined function variable "$snake-down"
      (call $snake-down)
            ^^^^^^^^^^^
```

To fix this, add those functions to your snake. Here's an example for `down`:

```wasm
(func $snake-down
  ;; if (direction.y == 0) {
  ;;   direction.x = 0;
  ;;   direction.y = 1;
  ;; }
  (if (i32.eq (i32.load (i32.const 0x19a4)) (i32.const 0))
    (then
      (i32.store (i32.const 0x19a0) (i32.const 0))
      (i32.store (i32.const 0x19a4) (i32.const 1))))
)
```

</Page>

<Page value="zig">

It's a good idea to handle the input in its own function. Something like this could be on your mind:

```zig {1-8,13}
fn input() void {
    const gamepad = w4.GAMEPAD1.*;
    const just_pressed = gamepad & (gamepad ^ prevState);

    if (just_pressed & w4.BUTTON_UP != 0) {
        // Do something
    }
}

export fn update() void {
    frameCount += 1;
    
    input();

    if (frame_count % 15 == 0) {
        snake.update();
    }

    snake.draw();
}
```

If you try to compile this, you should get an error: `error: use of undeclared identifier 'prevState'`. This is easily fixed. Just place the prevState into the var-section:

```zig {3}
var snake = Snake.init();
var frame_count: u32 = 0;
var prev_state: u8 = 0;
```

To notice any change in the gamepad, you have to store the *current state* at the end of the input. This will make it the *previous state*. And while you're at it, why not add the other 3 directions along the way:

```zig {8-18}
fn input() void {
    const gamepad = w4.GAMEPAD1.*;
    const just_pressed = gamepad & (gamepad ^ prev_state)

    if (just_pressed & w4.BUTTON_LEFT != 0) {
        // Do something
    }
    if (just_pressed & w4.BUTTON_RIGHT != 0) {
        // Do something
    }
    if (just_pressed & w4.BUTTON_UP != 0) {
        // Do something
    }
    if (just_pressed & w4.BUTTON_DOWN != 0) {
        w4.trace("down");
    }

    prev_state = gamepad;
}
```

If you want to check if it works: Use the `trace` function provided by WASM-4. Here's an example:

```zig
    if (just_pressed & w4.BUTTON_DOWN != 0) {
        w4.trace("down");
    }
```

If you use `trace` in each if-statement, you should see the corresponding output in the console.

Now, instead of using `trace` to confirm everything works as intended, you should replace it with something like this:

```zig
    if (just_pressed & w4.BUTTON_DOWN != 0) {
        snake.down();
    }
```

I'll leave it to you, to finish the other 3 directions.

You'll be - once again - rewarded with an error message:

```
./src/main.zig:22:14: error: no member named 'left' in struct 'snake.Snake'
        snake.left();
             ^
cart...The step exited with error code 1
error: the build command failed with exit code 1
```

Zig will only list this first unknown it finds, but you'll get an error for each function as you add them. To fix the errors, add those functions to your snake. Here's an example for `down`:

```zig
    pub fn down(this: *@This()) void {
        if (this.direction.y == 0) {
            this.direction.x = 0;
            this.direction.y = 1;
        }
    }
```

</Page>

</MultiLanguage>

First, it checks if the direction is already changing the Y-Direction. Only if it isn't allow the change. And then change the Y-Direction to 1. The `Up` direction requires a Y-Direction of `-1`. `Left` and `Right` don't check the Y, but the X and change it accordingly (Left: -1, Right: 1).

With this knowledge, you should be able to implement them. If you're unsure, check the source in the repository.

![Controlled Snake](images/snake-move-controlled.webp)
