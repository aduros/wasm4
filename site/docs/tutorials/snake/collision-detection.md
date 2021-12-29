import MultiLanguage, {Page} from '@site/src/components/MultiLanguage';

# Collision Detection

Your game is progressing nicely. Only two more things and you're done: Growing the snake and "Game Over". For the first, you need to check if the snake collides with the fruit. For the second, you need to check if the snake collides with itself.

## Collision Detection with the Fruit

Collision detection can be one of the harder to understand concepts of game development. Lucky for you, this is not the case this time. This game is using a 20x20 grid. Each cell can either be occupied or free. To check this, you can compare the X and Y values of the 2 entities that are checked.

<MultiLanguage>

<Page value="assemblyscript">

A simple

```typescript
if (snake.body[0].equals(fruit)) {
    // Snake's head hits the fruit
}
```

is enough already to check if the snake eats the fruit. And to make the snake "grow", simply increase the length of the snake using the `push` function of the array. Now it remains the question what values should this new piece have. The easiest would be to add the current last piece:

```typescript
let tail = snake.body[snake.body.length - 1]
snake.body.push(new Point(tail.x, tail.y))
```

Once this done, simply relocate the fruit:

```go
fruit.X = rnd(20)
fruit.Y = rnd(20)
```

In its final form, it could look like this:

```typescript {4-9}
    if (frameCount % 15 == 0) {
        snake.update()

        if (snake.body[0].equals(fruit)) {
            let tail = snake.body[snake.body.length - 1]
            snake.body.push(new Point(tail.x, tail.y))
            fruit.x = rnd(20)
            fruit.y = rnd(20)
        }
    }
```

Now you're almost done. Only "Game Over" is left to finish this game.

</Page>

<Page value="c">

// TODO

</Page>

<Page value="d">

// TODO

</Page>

<Page value="go">

 A simple

```go
if snake.Body[0].X == fruit.X && snake.Body[0].Y == fruit.Y {
	// Snake's head hits the fruit
}
```

is enough already to check if the snake eats the fruit. And to make the snake "grow", simply increase the length of the snake using the `append` function of Go. Now it remains the question what values should this new piece have. The easiest would be to add the current last piece:

```go
snake.Body = append(snake.Body, snake.Body[len(snake.Body)-1])
```

Once this done, simply relocate the fruit:

```go
fruit.X = rnd(20)
fruit.Y = rnd(20)
```

In its final form, it could look like this:

```go {4-8}
	if frameCount%15 == 0 {
		snake.Update()

		if snake.Body[0].X == fruit.X && snake.Body[0].Y == fruit.Y {
			snake.Body = append(snake.Body, snake.Body[len(snake.Body)-1])
			fruit.X = rnd(20)
			fruit.Y = rnd(20)
		}
	}
```

Now you're almost done. Only "Game Over" is left to finish this game.

</Page>

<Page value="nelua">

A simple

```lua
if snake.body[1] == fruit then
  -- Snake's head hits the fruit
end
```

is enough already to check if the snake eats the fruit. And to make the snake "grow", simply increase the length of the snake using the `push` function of the sequence. Now it remains the question what values should this new piece have. The easiest would be to add the current last piece:

```lua
local tail = snake.body[#snake.body]
snake.body:push({ x = tail.x, y = tail.y })
```

Once this done, simply relocate the fruit:

```lua
fruit = { x = math.random(0, 19), y = math.random(0,19) }
```

Just this however will realocate the fruit in the same places for every run because it uses always the same seed, to generate a random seed we need to call `math.randomseed` function with at least one argument, which can be `frame_count`:

```lua
math.randomseed(frame_count)
```

In its final form, it could look like this:

```lua {4-9}
  if frame_count % 15 == 0 then
    snake:update()

    if snake.body[1] == fruit then
      local tail = snake.body[#snake.body]
      snake.body:push({ x = tail.x, y = tail.y })
      math.randomseed(frame_count)
      fruit = { x = math.random(0, 19), y = math.random(0,19) }
    end
  end
```

Now you're almost done. Only "Game Over" is left to finish this game.

</Page>

<Page value="nim">

// TODO

</Page>

<Page value="odin">

// TODO

</Page>

<Page value="rust">

A simple

```rust
if self.snake.body[0] == fruit {
    // Snake's head hits the fruit
}
```

is enough already to check if the snake eats the fruit. And to make the snake "grow", simply increase the length of the snake using the [`push`](https://doc.rust-lang.org/std/vec/struct.Vec.html#method.push) method. Now it remains the question what values should this new piece have. The easiest would be to add the current last piece:

```rust
// src/game.rs
let dropped_pos = self.snake.update();

if self.snake.body[0] == self.fruit {
    if let Some(last_pos) = dropped_pos {
        self.snake.body.push(last_pos);
    }
}
```

Once this done, simply relocate the fruit:

```rust
// src/game.rs
self.fruit.x = self.rng.i32(0..20);
self.fruit.y = self.rng.i32(0..20);
```

In its final form, it could look like this:

```rust
// src/game.rs inside impl Game {} block
    pub fn update(&mut self) {
        self.frame_count += 1;

        self.input();

        if self.frame_count % 15 == 0 {
            let dropped_pos = self.snake.update();

            if self.snake.body[0] == self.fruit {
                if let Some(last_pos) = dropped_pos {
                    self.snake.body.push(last_pos);
                }

                self.fruit.x = self.rng.i32(0..20);
                self.fruit.y = self.rng.i32(0..20);
            }
        }
    }
```

</Page>

<Page value="zig">

A simple

```zig
if (snake.body.get(0).equals(fruit)) {
    // Snake's head hits the fruit
}
```

is enough already to check if the snake eats the fruit. And to make the snake "grow", simply increase the length of the snake using the `push` function of the array. Now it remains the question what values should this new piece have. The easiest would be to add the current last piece:

```zig
const tail = snake.body.get(snake.body.len-1);
snake.body.append(Point.init(tail.x, tail.y)) catch @panic("couldn't grow snake");
```

Once this done, simply relocate the fruit:

```zig
fruit.x = rnd(20);
fruit.y = rnd(20);
```

In its final form, it could look like this:

```zig {4-9}
    if (frame_count % 15 == 0) {
        snake.update();

        if (snake.body.get(0).equals(fruit)) {
            const tail = snake.body.get(snake.body.len - 1);
            snake.body.append(Point.init(tail.x, tail.y)) catch @panic("couldn't grow snake");
            fruit.x = rnd(20);
            fruit.y = rnd(20);
        }
    }
```

Now you're almost done. Only "Game Over" is left to finish this game.

</Page>

</MultiLanguage>

## Collision Detection with Itself

For the player to have any sense of "danger", the game needs a possibility for the player to lose. Usually the snake can't touch itself or it dies. For this, just loop through the body and check if the piece and the head have the same coordinates. Just like with the fruit. But it might be a good idea to move this to its own function:

<MultiLanguage>

<Page value="assemblyscript">

```typescript
    isDead(): bool {
        const head = this.body[0]
        for (let i = 1, len = this.body.length; i < len; i++) {
            if (this.body[i].equals(head)) {
                return true
            }
        }

        return false
    }
```

Now you can call this function to check if the snake died in this frame:

```typescript {4-6}
    if (frameCount % 15 == 0) {
        snake.update()

        if (snake.isDead()) {
            // Do something
        }

        if (snake.body[0].equals(fruit)) {
            let tail = snake.body[snake.body.length - 1]
            snake.body.push(new Point(tail.x, tail.y))
            fruit.x = rnd(20)
            fruit.y = rnd(20)
        }
    }
```

What you do, is up to you. You could stop the game and show the score. Or you could simply reset the game. Up to you.

</Page>

<Page value="c">

// TODO

</Page>

<Page value="d">

// TODO

</Page>

<Page value="go">

```go
func (s *Snake) IsDead() bool {
	for index := 1; index < len(s.Body)-1; index++ {
		if s.Body[0].X == s.Body[index].X && s.Body[0].Y == s.Body[index].Y {
			return true
		}
	}

	return false
}
```

Now you can call this function to check if the snake died in this frame:

```go {4-6}
	if frameCount%15 == 0 {
		snake.Update()

		if snake.IsDead() {
			// Do something
		}

		if snake.Body[0].X == fruit.X && snake.Body[0].Y == fruit.Y {
			snake.Body = append(snake.Body, snake.Body[len(snake.Body)-1])
			fruit.X = rnd(20)
			fruit.Y = rnd(20)
		}
	}
```

What you do, is up to you. You could stop the game and show the score. Or you could simply reset the game. Up to you.

</Page>

<Page value="nelua">

```lua
function Snake:is_dead(): boolean
  local head = self.body[1]

  for i = 2, #self.body do
    if self.body[i] == head then
      return true
    end
  end

  return false
end
```

Now you can call this function to check if the snake died in this frame:

```lua {4-6}
  if frame_count % 15 == 0 then
    snake:update()

    if snake:is_dead() then
      -- Do something
    end

    if snake.body[1] == fruit then
      local tail = snake.body[#snake.body]
      snake.body:push({ x = tail.x, y = tail.y })
      math.randomseed(frame_count)
      fruit = { x = math.random(0, 19), y = math.random(0,19) }
    end
  end
```

What you do, is up to you. You could stop the game and show the score. Or you could simply reset the game. Up to you.

</Page>

<Page value="nim">

// TODO

</Page>

<Page value="odin">

// TODO

</Page>

<Page value="rust">

```rust
// src/snake.rs inside impl Snake {} block
    pub fn is_dead(&self) -> bool {
        self.body
            .iter()
            .skip(1)
            .any(|&body_section| body_section == self.body[0])
    }
```

Now you can call this function to check if the snake died in this frame:

```rust
// src/game.rs inside impl Game {} block
    pub fn update(&mut self) {
        self.frame_count += 1;

        self.input();

        if (self.snake.is_dead()) {
            // Do something
        }

        if self.frame_count % 15 == 0 {
            let dropped_pos = self.snake.update();

            if self.snake.body[0] == self.fruit {
                if let Some(last_pos) = dropped_pos {
                    self.snake.body.push(last_pos);
                }

                self.fruit.x = self.rng.i32(0..20);
                self.fruit.y = self.rng.i32(0..20);
            }
        }
    }
```

What you do, is up to you. You could stop the game and show the score. Or you could simply reset the game. Up to you.

</Page>

<Page value="zig">

```zig
    pub fn isDead(this: @This()) bool {
        const head = this.body.get(0);
        for (this.body.constSlice()) |part, i| {
            if (i == 0) continue;
            if (part.equals(head)) return true;
        }

        return false;
    }
```

Now you can call this function to check if the snake died in this frame:

```zig {4-6}
    if (frame_count % 15 == 0) {
        snake.update();

        if (snake.isDead()) {
            // Do something
        }

        if (snake.body.get(0).equals(fruit)) {
            const tail = snake.body.get(snake.body.len - 1);
            snake.body.append(Point.init(tail.x, tail.y)) catch @panic("couldn't grow snake");
            fruit.x = rnd(20);
            fruit.y = rnd(20);
        }
    }
```

What you do, is up to you. You could stop the game and show the score. Or you could simply reset the game. Up to you.

</Page>

</MultiLanguage>
