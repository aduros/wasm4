# Distribution

## Bundle to HTML

When you're ready to distribute your game, you can bundle it into a standalone HTML file with `w4 bundle`:

```shell
w4 bundle cart.wasm --title "My Game" --html my-game.html
```

The bundled HTML contains no external dependencies, works offline, and can be easily shared on sites like [itch.io](https://itch.io/).

## Bundle to Windows/Mac/Linux executable

Native executables for multiple platforms can also be bundled:

```shell
w4 bundle cart.wasm --title "My Game" \
    --windows my-game-windows.exe \
    --mac my-game-mac \
    --linux my-game-linux
```

This creates tiny (~200 KB) executables that run natively, no web browser required!

## Publish on wasm4.org

Send a PR on Github to feature your game on the site!

1. Fork the [wasm4 repository](https://github.com/aduros/wasm4).
2. Choose an unused ID that will be used for your game URL. For example, `my-game` will be playable
   at https://wasm4.org/play/my-game.
3. In the `/site/static/carts` directory, add 3 new files:
    - `my-game.wasm`: The cart file.
    - `my-game.png`: A 160x160 screenshot. You can take a screenshot by pressing F9 in the emulator.
    - `my-game.md`: Your game's manual, contains metadata and other info for your players.

The manual is a
[Markdown](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax)
document that should be in this format:

```md
---
author: (Your name or username)
github: (Your github username, used to show a profile pic)
date: (When the cart was last updated, in YYYY-MM-DD format)
---

# (Your game's title)

Additional info can go here. It will be displayed on your game's page.
```

Now just commit your changes and open a pull request! As soon as it's merged, your game will appear
on the site.
