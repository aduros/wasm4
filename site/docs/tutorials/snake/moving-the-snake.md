import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Moving the Snake

To move the snake, you have to change the X and Y position of every body-part of the snake.

For this, you can start at the end of the body and give this part the values of the part ahead.
Since the final piece to get's it's values "stolen" is the head, the head seems to disappear for very brief moment.

After this is done, you simply move the head in the direction of the snake.
Since all of this happens, before the snake is rendered, it appears as a fluid motion.

This is how the logic looks like:

![](images/snake_move_logic.webp)

Keep in mind: This is not what the player sees. This is:

![](images/snake_move_rendered.webp)


## Moving the Body

<Tabs
    groupId="code-language"
    defaultValue="language-typescript"
    values={[
        {label: 'AssemblyScript', value: 'language-typescript'},
        {label: 'C / C++', value: 'language-cpp'},
        {label: 'Rust', value: 'language-rust'},
        {label: 'Go', value: 'language-go'},
        {label: 'Zig', value: 'language-zig'},
    ]}>

<TabItem value="language-typescript">

To achieve the first step (moving the body, excluding the head), a simple loop is all you need:

```typescript
    update(): void {
        for (let i = this.body.length - 1; i > 0; i--) {
            unchecked(body[i].x = body[i - 1].x)
            unchecked(body[i].y = body[i - 1].y)
        }
    }
```

Don't forget to call the new function in the main-loop:

```typescript {2}
export function update(): void {
    snake.update()
    snake.draw()
}
```

Now if you execute this, you'd notice that you can't see much. In fact, you might see the snake for a short moment before the head is all that's left.

![](images/snake_move_head_only.webp)

</TabItem>

<TabItem value="language-cpp">

// TODO

</TabItem>

<TabItem value="language-rust">

// TODO

</TabItem>

<TabItem value="language-go">

To achieve the first step (moving the body, excluding the head), a simple loop is all you need:

```go
func (s *Snake) Update() {
	for i := len(s.Body) - 1; i > 0; i-- {
		s.Body[i] = s.Body[i-1]
	}
}
```

Don't forget to call the new function in the main-loop:

```go {3}
//go:export update
func update() {
	snake.Update()

	snake.Draw()
}
```

Now if you execute this, you'd notice that you can't see much. In fact, you might see the snake for a short moment before the head is all that's left.

![](images/snake_move_head_only.webp)

</TabItem>

</Tabs>

## Moving the Head

<Tabs
    groupId="code-language"
    defaultValue="language-typescript"
    values={[
        {label: 'AssemblyScript', value: 'language-typescript'},
        {label: 'C / C++', value: 'language-cpp'},
        {label: 'Rust', value: 'language-rust'},
        {label: 'Go', value: 'language-go'},
        {label: 'Zig', value: 'language-zig'},
    ]}>

<TabItem value="language-typescript">

This isn't hard either. Simple add the add the direction to the current head. And then make sure the head stays within the boundaries:

```typescript {7-15}
    update(): void {
        for (let i = this.body.length - 1; i > 0; i--) {
            unchecked(body[i].x = body[i - 1].x)
            unchecked(body[i].y = body[i - 1].y)
        }

        this.body[0].x = (this.body[0].x + this.direction.x) % 20
        this.body[0].y = (this.body[0].y + this.direction.y) % 20

        if (this.body[0].x < 0) {
            this.body[0].x = 19
        }
        if (this.body[0].y < 0) {
            this.body[0].y = 19
        }
    }
```

</TabItem>

<TabItem value="language-cpp">

// TODO

</TabItem>

<TabItem value="language-rust">

// TODO

</TabItem>

<TabItem value="language-go">

This isn't hard either. Simple add the add the direction to the current head. And then make sure the head stays within the boundaries:

```go {6-13}
func (s *Snake) Update() {
	for i := len(s.Body) - 1; i > 0; i-- {
		s.Body[i] = s.Body[i-1]
	}

	s.Body[0].X = (s.Body[0].X + s.Direction.X) % 20
	s.Body[0].Y = (s.Body[0].Y + s.Direction.Y) % 20
	if (s.Body[0].X < 0) {
		s.Body[0].X = 19
	}
	if (s.Body[0].Y < 0) {
		s.Body[0].Y = 19
	}
}
```

</TabItem>

<TabItem value="language-zig">

To achieve the first step (moving the body, excluding the head), a simple loop is all you need:

```zig
    pub fn update(this: *@This()) void {
        const part = this.body.slice();
        var i: usize = part.len - 1;
        while (i > 0) : (i -= 1) {
            part[i].x = part[i - 1].x;
            part[i].y = part[i - 1].y;
        }

        part[0].x = @mod((part[0].x + this.direction.x), 20);
        part[0].y = @mod((part[0].y + this.direction.y), 20);

        if (part[0].x < 0) part[0].x = 19;
        if (part[0].y < 0) part[0].y = 19;
    }
```

Don't forget to call the new function in the main-loop:

```zig {2}
export fn update() void {
    snake.update();
    snake.draw();
}

```

Now if you execute this, you'd notice that you can't see much. In fact, you might see the snake for a short moment before the head is all that's left.

![](images/snake_move_head_only.webp)

</TabItem>

</Tabs>

That's it. Now you should see the snake running from left to right. Maybe a little too fast, though.

![Moving Snake (fast)](images/snake-motion-fast.webp)


## Slowing Down

By default WASM-4 runs at 60 FPS. This means your little snake moves 60 fields in each second. That is 3 times the whole screen.
There are several ways to slow the snake down.

The easiest way is probably to count the frames and update the snake only every X frames.

<Tabs
    groupId="code-language"
    defaultValue="language-typescript"
    values={[
        {label: 'AssemblyScript', value: 'language-typescript'},
        {label: 'C / C++', value: 'language-cpp'},
        {label: 'Rust', value: 'language-rust'},
        {label: 'Go', value: 'language-go'},
        {label: 'Zig', value: 'language-zig'},
    ]}>

<TabItem value="language-typescript">

For this, you'd need a new variable. You can call it whatever you like, just be sure you know what it's purpose is.

```typescript {2}
const snake = new Snake()
let frameCount = 0
```

This variable in main.ts keeps track of all frames so far. Just increase it's value in the main-update function:

```typescript {2}
export function update(): void {
    frameCount++

    snake.update()

    snake.draw()
}
```

Now all you need is to check if the passed frames are dividable by X:

```typescript {4-6}
export function update(): void {
    frameCount++

    if (frameCount % 15 == 0) {
        snake.update()
    }

    snake.draw()
}
```

That's it. Your snake should be quite a bit slower now. This reduces the snake from 60 units per second to 4 units per second (60/15 = 4).

![Moving Snake (slow)](images/snake-motion-slow.webp)

</TabItem>

<TabItem value="language-cpp">

// TODO

</TabItem>

<TabItem value="language-rust">

// TODO

</TabItem>

<TabItem value="language-go">

For this, you'd need a new variable. You can call it whatever you like, just be sure you know what it's purpose is.

```go {10}
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
)
```

This variable in main.go keeps track of all frames so far. Just increase it's value in the main-update function:

```go {3}
//go:export update
func update() {
	frameCount++

	snake.Update()

	snake.Draw()
}
```

Now all you need is to check if the passed frames are dividable by X:

```go {5-7}
//go:export update
func update() {
	frameCount++

	if frameCount%15 == 0 {
		snake.Update()
	}

	snake.Draw()
}
```

That's it. Your snake should be quite a bit slower now. This reduces the snake from 60 units per second to 4 units per second (60/15 = 4).

![Moving Snake (slow)](images/snake-motion-slow.webp)

</TabItem>

<TabItem value="language-zig">

For this, you'd need a new variable. You can call it whatever you like, just be sure you know what it's purpose is.

```zig {2}
var snake: Snake = Snake.init();
var frameCount: u32 = 0;
```

This variable in main.ts keeps track of all frames so far. Just increase it's value in the main-update function:

```zig {2}
export fn update() void {
    frameCount += 1;

    snake.update();

    snake.draw();
}

```

Now all you need is to check if the passed frames are dividable by X:

```zig {4-6}
export function update(): void {
    frameCount++

    if (frameCount % 15 == 0) {
        snake.update()
    }

    snake.draw()
}
```

That's it. Your snake should be quite a bit slower now. This reduces the snake from 60 units per second to 4 units per second (60/15 = 4).

![Moving Snake (slow)](images/snake-motion-slow.webp)

</TabItem>

</Tabs>
