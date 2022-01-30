# Distribution

## Bundle to HTML

When you're ready to distribute your game, you can bundle it into a standalone HTML file with `w4 bundle`:

```shell
w4 bundle cart.wasm --title "My Game" --html my-game.html
```

The bundled HTML contains no external dependencies, works offline, and can be easily shared on sites like [itch.io](https://itch.io/).

For saving disks, the localStorage key used will be based on the game title you supply.
Alternatively, you can specifiy a localStorage key prefix manually with `--html-disk-prefix <prefix>`.
This is useful to prevent disk conflicts between games.

## Bundle to Windows/Mac/Linux executable

Native executables for multiple platforms can also be bundled:

```shell
w4 bundle cart.wasm --title "My Game" \
    --windows my-game-windows.exe \
    --mac my-game-mac \
    --linux my-game-linux
```

This creates tiny (~200 KB) executables that run natively, no web browser required!

The disk file (in case your game uses them) will be saved as `<game>.disk` in the same directory as your game.

## Publish on wasm4.org

Send a PR on Github to feature your game on the site!

1. Fork the [wasm4 repository](https://github.com/aduros/wasm4).
2. In your fork, edit [`/site/carts.js`](https://github.com/aduros/wasm4/blob/main/site/carts.js) and insert an entry
   for your game at the top of the list. It should have a unique slug for the URL.
3. Copy your `<slug>.wasm` (cart) and `<slug>.png` (160x160 screenshot) to the
   [`/site/static/carts`](https://github.com/aduros/wasm4/tree/main/site/static/carts) directory.
4. Commit your changes and open a pull request!

:::tip
You can take a 160x160 screenshot of your game by pressing F9 in the emulator.
:::
