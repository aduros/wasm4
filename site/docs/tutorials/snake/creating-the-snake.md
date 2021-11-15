import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Creating the Snake

Let's take a look at the main component of the game: The snake. There are several ways to implement one.

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


To keep things tidy, I recommend you'd create a new file called `snake.ts`. This file contains two classes:

- The `Point` - Holding X and Y coordinates
- The `Snake` - The actual snake implementation

The content is rather simple:

```typescript
export class Point {
    public X : i16
    public Y : i16

    constructor(X : i16, Y : i16) {
        this.X = X
        this.Y = Y
    }
}

export class Snake {
    public body : Array<Point>
    public direction : Point

    constructor () {
        this.parts = new Array<Point>()
        this.direction = new Point(1, 0)
    }
}
```

The snake class contains the body and the current direction of the snake instance.
But it lacks any functionality for now.

</TabItem>

<TabItem value="language-cpp">

// TODO

</TabItem>

<TabItem value="language-rust">

// TODO

</TabItem>

<TabItem value="language-go">

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

</TabItem>

</Tabs>