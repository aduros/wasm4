---
sidebar_label: Placing the fruit
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Placing the fruit

A freely moving snake is nice. But it get's a bit dull if that's all there is. To make it a bit more of a challenge, you'd need to add something to change the snake. The classic approach is to let the snake "eat" fruits. That's a good place to start.

<Tabs
    groupId="code-language"
    defaultValue="language-typescript"
    values={[
        {label: 'AssemblyScript', value: 'language-typescript'},
        {label: 'C / C++', value: 'language-cpp'},
        {label: 'Rust', value: 'language-rust'},
        {label: 'Go', value: 'language-go'},
    ]}>

<TabItem value="language-typescript">
</TabItem>

<TabItem value="language-cpp">
</TabItem>

<TabItem value="language-rust">
</TabItem>

<TabItem value="language-go">

To place (and eat) a fruit, you first need to make a variable for this. Since it's simply a point on the grid, `image.Point` will do:

```diff
	frameCount = 0
	prevState  uint8
+	fruit      image.Point
```

</TabItem>

</Tabs>

## Random numbers

<Tabs
    groupId="code-language"
    defaultValue="language-typescript"
    values={[
        {label: 'AssemblyScript', value: 'language-typescript'},
        {label: 'C / C++', value: 'language-cpp'},
        {label: 'Rust', value: 'language-rust'},
        {label: 'Go', value: 'language-go'},
    ]}>

<TabItem value="language-typescript">
</TabItem>

<TabItem value="language-cpp">
</TabItem>

<TabItem value="language-rust">
</TabItem>

<TabItem value="language-go">

Go provides us with pretty much everything we could need to create random numbers. The package `math"rand` contains a handy function: `Intn(n int) int`. It takes an integer and returns a random value between 0 and n-1. If you think, placing something like this in `start` would be a good idea:

```go
	fruit.X = rand.Intn(20)
	fruit.Y = rand.Intn(20)
```

You'd be surprised that this pretty much crashes. So we can't use the standard random-functions of Go? No, we can. We just have to make our own instance of the number generator:

```diff
	frameCount = 0
	prevState  uint8
	fruit      image.Point
+	rnd        func(int) int
```

Now you can use it like this:
```go
	rnd = rand.New(rand.NewSource(1)).Intn
	fruit.X = rnd.Intn(20)
	fruit.Y = rnd.Intn(20)
```

The `1` is the seed. But having a fixed seed is not a good idea. You might be tempted to use `time.Now().Unix()`. But this will crash the came with a nice `field 'runtime.ticks' is not a Function`.

Since the standard `time` is not an option, how about you use something that is time related and is already in your project? Like `frameCount`?

```go
	rnd = rand.New(rand.NewSource(int64(frameCount))).Intn
	fruit.X = rnd.Intn(20)
	fruit.Y = rnd.Intn(20)
```

Works. But since this is the `start`-function, `frameCount` is pretty much always `0`. That's why here's a small exercise for you: change the seed after the first key was pressed.

:::note Check the for nil
Keep in mind, that the value of `rnd` is `nil` if it wasn't initialized yet.
:::

</TabItem>

</Tabs>

## Importing PNG files

<Tabs
    groupId="code-language"
    defaultValue="language-typescript"
    values={[
        {label: 'AssemblyScript', value: 'language-typescript'},
        {label: 'C / C++', value: 'language-cpp'},
        {label: 'Rust', value: 'language-rust'},
        {label: 'Go', value: 'language-go'},
    ]}>

<TabItem value="language-typescript">
</TabItem>

<TabItem value="language-cpp">
</TabItem>

<TabItem value="language-rust">
</TabItem>

<TabItem value="language-go">

Importing images in WASM-4 works a bit different compared to other game engines and Fantasy Consoles. Images have to meet certain criteria:

- PNG only
- Index only
- 4 colors max

Indexed PNG files can be created by several image apps like [Aseprite](https://www.aseprite.org/) or [GIMP](https://www.gimp.org/).

The image we import is a 8x8 PNG file with exactly 4 colors. And it's this image here:

![Zoomed Fruit](images/fruit-zoomed.webp)

This image is zoomed by 800%.

Now you need to import the image. For this, the WASM-4 CLI tool `w4` comes with another tool: `png2src`. You can use it like this:

`w4 png2src --go fruit.png`

This will output the following content in the terminal:

```go
const fruitWidth = 8
const fruitHeight = 8
const fruitFlags = 1 // BLIT_2BPP
var fruit = [16]byte { 0x00,0xa0,0x02,0x00,0x0e,0xf0,0x36,0x5c,0xd6,0x57,0xd5,0x57,0x35,0x5c,0x0f,0xf0 }
```

To get it into a an existing file, use the `>>` operator. Like this:

`w4 png2src --go fruit.png >> main.go`

This will add the previous lines to your `main.go` and causes an error because "fruit" already exists. Just rename the new fruit to `fruitSprite` and move it somewhere else. Also: You can remove the other stuff added, you won't need it for this project:

```diff
	frameCount  = 0
	prevState   uint8
	fruit       image.Point
	rnd         *rand.Rand
+	fruitSprite = [16]byte{0x00, 0xa0, 0x02, 0x00, 0x0e, 0xf0, 0x36, 0x5c, 0xd6, 0x57, 0xd5, 0x57, 0x35, 0x5c, 0x0f, 0xf0}
```

With that out of the way, it's time to actually render the newly imported sprite.

</TabItem>

</Tabs>

## Rendering a PNG file

<Tabs
    groupId="code-language"
    defaultValue="language-typescript"
    values={[
        {label: 'AssemblyScript', value: 'language-typescript'},
        {label: 'C / C++', value: 'language-cpp'},
        {label: 'Rust', value: 'language-rust'},
        {label: 'Go', value: 'language-go'},
    ]}>

<TabItem value="language-typescript">
</TabItem>

<TabItem value="language-cpp">
</TabItem>

<TabItem value="language-rust">
</TabItem>

<TabItem value="language-go">

Rendering the sprite is rather simple. Just call the `Blit` function of w4:

```go
// Blit draws a sprite at position X, Y and uses DRAW_COLORS accordingly
func Blit(sprite *byte, x, y int, width, height, flags uint)
```

In practice it looks like this:

```go
//go:export update
func update() {
	frameCount++

	input()

	if frameCount%15 == 0 {
		snake.Update()
	}
	snake.Draw()
	w4.Blit(&fruitSprite[0], fruit.X*8, fruit.Y*8, 8, 8, w4.BLIT_2BPP)
}
```

But since you set our drawing colors, you need to change the drawing colors too:

```diff
	snake.Draw()
+	*w4.DRAW_COLORS = 0x4320
	w4.Blit(&fruitSprite[0], fruit.X*8, fruit.Y*8, 8, 8, w4.BLIT_2BPP)
```

This way, w4 uses the color palette in it's default configuration. Except for one thing: The background will be transparent.

</TabItem>

</Tabs>
