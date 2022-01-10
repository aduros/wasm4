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

 In our `update` function in `main.c` after calling `snake_update`, an if statement comparing the location of the snake's head with the location of the fruit

```c
if(snake.body[0].x == fruit.x && snake.body[0].y == fruit.y)
{
  //snake's head hits the fruit
}
```

is enough already to check if the snake eats the fruit. To add to the snake we will create a copy of the snake's last body part, and add it to the snake using `snake_push`, and then relocate the fruit:

```c
if(snake.body[0].x == fruit.x && snake.body[0].y == fruit.y)
{
  struct point p = snake.body[snake.length-1];
  snake_push(&snake,p);
  fruit.x = rand()%20;
  fruit.y = rand()%20;
}
```

Now you're almost done. Only "Game Over" is left to finish this game.

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

<Page value="wat">

The following

```wasm
;; if (body[0].x == fruit.x && body[0].y == fruit.y)
(if (i32.and
      (i32.eq (i32.load (i32.const 0x19ac)) (i32.load (i32.const 0x2630)))
      (i32.eq (i32.load (i32.const 0x19b0)) (i32.load (i32.const 0x2634))))
  (then
    ;; Snake's head hits the fruit
  )
)
```

is enough already to check if the snake eats the fruit. And to make the snake "grow", simply increase the length and add a new piece to the body. Now it remains the question what values should this new piece have. The easiest would be to add the current last piece:

```wasm
(local $body-length i32)
(local $tail-offset i32)
(local $tail-x i32)
(local $tail-y i32)

;; tail-offset = (body-length - 1) * 8
(local.set $tail-offset
  (i32.mul
    (i32.sub
      (local.tee $body-length
        (i32.load (i32.const 0x19a8)))
      (i32.const 1))
    (i32.const 8)))

;; Increment body_length
(i32.store
  (i32.const 0x19a8)
  (i32.add
    (local.get $body-length)
    (i32.const 1)))

;; Copy tail to next point in body.
(i32.store offset=0x19b4 (local.get $tail-offset) (i32.load (i32.const 0x19ac)))
(i32.store offset=0x19b8 (local.get $tail-offset) (i32.load (i32.const 0x19b0)))
```

Once this done, simply relocate the fruit:

```wasm
;; fruit.x = rnd(20);
(i32.store (i32.const 0x2630) (call $rnd (i32.const 20)))
;; fruit.y = rnd(20);
(i32.store (i32.const 0x2634) (call $rnd (i32.const 20)))
```

In it's final form, it could look like this:

```wasm
  (local $body-length i32)
  (local $tail-offset i32)
  (local $tail-x i32)
  (local $tail-y i32)

  ...

  (if (i32.eqz (i32.rem_u (global.get $frame-count) (i32.const 15)))
    (then
      (call $snake-update)

      ;; if (body[0].x == fruit.x && body[0].y == fruit.y)
      (if (i32.and
            (i32.eq (i32.load (i32.const 0x19ac)) (i32.load (i32.const 0x2630)))
            (i32.eq (i32.load (i32.const 0x19b0)) (i32.load (i32.const 0x2634))))
        (then
          ;; Snake's head hits the fruit

          ;; tail-offset = (body-length - 1) * 8
          (local.set $tail-offset
            (i32.mul
              (i32.sub
                (local.tee $body-length
                  (i32.load (i32.const 0x19a8)))
                (i32.const 1))
              (i32.const 8)))

          ;; Increment body_length
          (i32.store
            (i32.const 0x19a8)
            (i32.add
              (local.get $body-length)
              (i32.const 1)))

          ;; Copy tail to next point in body.
          (i32.store offset=0x19b4 (local.get $tail-offset)
            (i32.load offset=0x19ac (local.get $tail-offset)))
          (i32.store offset=0x19b8 (local.get $tail-offset)
            (i32.load offset=0x19b0 (local.get $tail-offset)))

          ;; fruit.x = rnd(20);
          (i32.store (i32.const 0x2630) (call $rnd (i32.const 20)))
          ;; fruit.y = rnd(20);
          (i32.store (i32.const 0x2634) (call $rnd (i32.const 20)))
        )
      )
    )
  )
```

Now you're almost done. Only "Game Over" is left to finish this game.

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

```c
int snake_isdead(struct snake *snake)
{
    for(size_t i = 1; i < snake->length; i++)
    {
        if(snake->body[i].x == snake->body[0].x && snake->body[i].y == snake->body[0].y)
        {
            return 1;
        }
    }

    return 0;
}
```

Add the above function to the `snake.c` file and add a corresponding declaration to `snake.h`.

Now you can call this function from `update` in `main.c`to check if the snake died in this frame:

```c {5-8}
    if (frame_count % 15 == 0)
    {
        snake_update(&snake);

        if(snake_isdead(&snake))
        {
          //snake is dead
        }

        if(snake.body[0].x == fruit.x && snake.body[0].y == fruit.y)
        {
            struct point p = snake.body[snake.length-1];
            snake_push(&snake,p);
            fruit.x = rand()%20;
            fruit.y = rand()%20;
        }
    }

```

What you do, is up to you. You could stop the game and show the score. Or you could simply reset the game like so:

```c
    if (frame_count % 15 == 0)
    {
        snake_update(&snake);

        if(snake_isdead(&snake))
        {
            snake_create(&snake);
           
            snake_push(&snake,(struct point){2,0}); 
            snake_push(&snake,(struct point){1,0});
            snake_push(&snake,(struct point){0,0});

            snake.direction = (struct point){1,0};
        }

        if(snake.body[0].x == fruit.x && snake.body[0].y == fruit.y)
        {
            struct point p = snake.body[snake.length-1];
            snake_push(&snake,p);
            fruit.x = rand()%20;
            fruit.y = rand()%20;
        }
    }
```

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

<Page value="wat">

```wasm
(func $snake-is-dead (result i32)
  (local $offset i32)
  (local $offset-end i32)

  ;; offset = 8
  (local.set $offset (i32.const 8))

  ;; offset-end = body_length * 8
  (local.set $offset-end
    (i32.mul
      (i32.load (i32.const 0x19a8))  ;; body_length
      (i32.const 8)))

  ;; loop over all points in the body (except the head)
  (loop $loop
    ;; If the head is at the same place as this piece of the body, then return
    ;; true.
    (if (i32.and
          (i32.eq
            (i32.load (i32.const 0x19ac))
            (i32.load offset=0x19ac (local.get $offset)))
          (i32.eq
            (i32.load (i32.const 0x19b0))
            (i32.load offset=0x19b0 (local.get $offset))))
      (then
        (return (i32.const 1))))

    ;; Add 8 to offset, and loop if offset < offset-end.
    (br_if $loop
      (i32.lt_u
        (local.tee $offset (i32.add (local.get $offset) (i32.const 8)))
        (local.get $offset-end)))
  )

  ;; return false
  (i32.const 0)
)
```

Now you can call this function to check if the snake died in this frame:

```wasm
    (call $snake-update)

    (if (call $snake-is-dead)
      (then
        ;; Do something
      )
    )
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
