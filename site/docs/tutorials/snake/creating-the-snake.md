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

// TODO

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

<Page value="rust">

To keep things tidy, I recommend to create a new file called `snake.rs`. 
This file contains two structs:

- The `Point` - Holding `x` and `y` coordinates.
- The `Snake` - The actual snake implementation.

`Snake` has an [associated function](https://doc.rust-lang.org/reference/items/associated-items.html#associated-functions-and-methods) `new` that returns a brand new snake.

We have also defined few derivable traits to `Point`:

- `PartialEq` and `Eq` add the `==` operator to perform an equality checks between `Point` instances.
- `Clone` and `Copy` relax the ownership rules when dealing with `Point` instances.

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
