import MultiLanguage, {Page} from '@site/src/components/MultiLanguage';

# Creating the Snake

Let's take a look at the main component of the game: The snake. There are several ways to implement one.

<MultiLanguage>

<Page value="assemblyscript">

To keep things tidy, I recommend you'd create a new file called `snake.ts`. This file contains two classes:

- The `Point` - Holding X and Y coordinates
- The `Snake` - The actual snake implementation

The content is rather simple:

```typescript
export class Point {
    constructor(
        public x: i32,
        public y: i32
    ) {}

    equals(other: Point): bool {
        return this.x == other.x && this.y == other.y
    }
}

export class Snake {
    body: Array<Point> = [
        new Point(2, 0),
        new Point(1, 0),
        new Point(0, 0)
    ]
    direction: Point = new Point(1, 0)
}
```

The snake class contains the body and the current direction of the snake instance.
But it lacks any functionality for now.

</Page>

<Page value="c">

In this section we will define a structure to hold our snake.

Create a new file called `snake.h` and fill it with the code-snippet below.

```c
#pragma once

#include <stdint.h>

struct point {
    int16_t x;
    int16_t y;
};

struct snake {
    struct point* body;
    struct point direction;
    uint16_t length;
};
```
The snake type contains the body and the current direction of the snake instance. We also need to define a point struct to hold the x and y coordinates of our snake body parts.

We need to fill out the implementation of the snake. Function declarations will be added to `snake.h` and the definitions to a new file called `snake.c`.

We will work on two functions, one to create the snake, and one to add a body part to the snake.

Add the following declarations to the bottom of the `snake.h` file:

```c
void snake_create(struct snake *snake);
void snake_push(struct snake *snake, struct point p);
```

Then in the `snake.c` file, we need to include our header files:
```c
#include "snake.h"
#include "wasm4.h"
#include <stdlib.h>
```
The file `stdlib.h` is required for `realloc`. The `snake_create` function `free`s any previous snake body that may have been allocated and initializes the snake struct body pointer to `NULL`, and the length to `0`.

```c
void snake_create(struct snake *snake)
{
    if(snake->body != NULL)
    {
            free(snake->body);
            snake->body = NULL;
    }
    snake->length = 0;
}
```

The `snake_push` function will use the `realloc` function to allocate memory for each snake body part and assign the passed point struct value to it. When `realloc` is passed a `NULL` pointer it behaves the same as `malloc` so we can forego a `NULL` pointer check and just use `realloc`. The result of `realloc` is stored in a temporary `body` variable, when it succeeds the `snake->body` pointer is updated and the point value set.

```c
void snake_push(struct snake *snake, struct point p)
{
    struct point* body = realloc(snake->body, sizeof body * (snake->length+1));
    if(body)
    {
        snake->body = body;
        snake->body[snake->length++] = p;
    }
}
```

</Page>

<Page value="d">

// TODO

</Page>

<Page value="go">

If you've used Go in the past, this next section won't be too surprising for you. You'll create a new type for the snake with the required properties.

For this, create a new file an call it `snake.go`. Then fill it with th code-snippet below.

```go
package main

type Point struct {
    X int
    Y int
}

type Snake struct {
	Body      []Point
	Direction Point
}
```

The snake type contains the body and the current direction of the snake instance.
But it lacks any functionality for now.

:::note BuiltIn Type
Go offers a buildIn type for points. It's in `image`.
Creating our own type reduces the size of the cart.
:::

</Page>

<Page value="nelua">

To keep things tidy, I recommend you'd create a new file called `snake.nelua`. This file contains two records:

- The `Point` - Holding X and Y coordinates
- The `Snake` - The actual snake implementation

The content is rather simple:

```lua
require "wasm4"
local sequence = require "sequence"

local snake = @record{}

local snake.Point = @record{
  x: int32,
  y: int32,
}

local Point = snake.Point

local snake.Snake = @record{
  body: sequence(Point),
  direction: Point,
}

local Snake = snake.Snake

function Snake.init(): Snake
  return Snake{
    body = {
      { x = 2, y = 0 },
      { x = 1, y = 0 },
      { x = 0, y = 0 },
    },
    direction = { x = 1, y = 0 },
  }
end

return snake
```

The snake record contains the body and the current direction of the snake instance.
But it lacks any functionality for now.

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

To keep things tidy, I recommend to create a new file called `snake.rs`. 
This file contains two structs:

- The `Point` - Holds `x` and `y` coordinates.
- The `Snake` - The actual snake implementation.

`Snake` has an [associated function](https://doc.rust-lang.org/reference/items/associated-items.html#associated-functions-and-methods) `new` that returns a brand new snake.

We have also defined few derivable traits to `Point`:

- `PartialEq` and `Eq` add the `==` operator to perform an equality checks between `Point` instances.
- `Clone` and `Copy` simplify use of `Point` instance.

You can learn more about these traits in the [rust-book](https://doc.rust-lang.org/stable/book/):

- [PartialEq, Eq](https://doc.rust-lang.org/book/appendix-03-derivable-traits.html?highlight=partialEq#partialeq-and-eq-for-equality-comparisons)
- [Clone, Copy](https://doc.rust-lang.org/book/appendix-03-derivable-traits.html?highlight=partialEq#clone-and-copy-for-duplicating-values) 

```rust
#[derive(Clone, Copy, PartialEq, Eq)]
pub struct Point {
    pub x: i32,
    pub y: i32,
}

pub struct Snake {
    pub body: Vec<Point>,
    pub direction: Point,
}

impl Snake {
    pub fn new() -> Self {
        Self {
            body: vec![
                Point { x: 2, y: 0 },
                Point { x: 1, y: 0 },
                Point { x: 0, y: 0 },
            ],
            direction: Point { x: 1, y: 0 },
        }
    }
}
```

:::note
Don't forget to declare this module in `lib.rs`.

```rust
mod snake;
```
:::

</Page>

<Page value="wat">

Unfortunately, the WebAssembly text format has no way to create classes or structs. The only way to lay out the stack structure is by manually allocating memory for the snake structure.

We'll pretend as though we have the following types. Note that they are not valid WebAssembly text definitions:

```wasm
(;
  = 8 bytes
  typedef struct {
    i32 x;
    i32 y;
  } Point;

  = 3200 bytes
  typedef Point Body[400];

  = 3212 bytes
  typedef {
    Point direction;
    i32 body_length;
    Body body;
  } Snake;
;)
```

We'll place these values in linear memory starting at 0x19a0, which is the start of the region mapped for use by the game:

```wasm
;; snake.direction   = 0x19a0
;; snake.body_length = 0x19a8
;; snake.body        = 0x19ac
```

Let's start the snake with 3 points: `(2, 0), (1, 0), (0, 0)`. The snake's initial direction will be moving left, `(1, 0)`.

```wasm
(data (i32.const 0x19a0)
  "\01\00\00\00" "\00\00\00\00" ;; direction (1, 0)
  "\03\00\00\00"                ;; body_length 3
  "\02\00\00\00" "\00\00\00\00" ;; body[0] = (2, 0)
  "\01\00\00\00" "\00\00\00\00" ;; body[1] = (1, 0)
  "\00\00\00\00" "\00\00\00\00" ;; body[2] = (0, 0)
)
```

</Page>

<Page value="zig">

To keep things tidy, I recommend you'd create a new file called `snake.zig`. This file contains two structs:

- The `Point` - Holding X and Y coordinates
- The `Snake` - The actual snake implementation

The content is rather simple:

```zig
const std = @import("std");
pub const Point = struct {
    x: i32,
    y: i32,
    pub fn init(x: i32, y: i32) @This() {
        return @This() {
            .x = x,
            .y = y,
        };
    }

    pub fn equals(this: @This(), other: @This()) bool {
        return this.x == other.x and this.y == other.y;
    }
};

pub const Snake = struct {
    body: std.BoundedArray(Point, 400),
    direction: Point,

    pub fn init() @This() {
        return @This() {
            .body = std.BoundedArray(Point, 400).fromSlice(&.{
                Point.init(2, 0),
                Point.init(1, 0),
                Point.init(0, 0),
            }) catch @panic("couldn't init snake body"),
            .direction = Point.init(1, 0),
        };
    }
};
```

The snake class contains the body and the current direction of the snake instance.
But it lacks any functionality for now.

</Page>

</MultiLanguage>
