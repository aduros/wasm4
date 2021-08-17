# Distribution

## Bundle to HTML

When you're ready to distribute your game, you can bundle it into a standalone HTML file with `w4 bundle`:

```shell
w4 bundle cart.wasm --html my-awesome-game.html
```

The bundled HTML contains no external dependencies, works offline, and can be easily shared on sites like [itch.io](https://itch.io/).

## Bundle to Windows/Mac/Linux executable

Coming soon!

## Publish on wasm4.org

Send a PR on Github to feature your game on the site!

1. Fork the repository.
2. Edit
   [`/site/carts.js`](https://github.com/aduros/wasm4/blob/main/site/carts.js)
   and add an entry for your game. It should have a unique slug for the URL.
3. Add your `<slug>.wasm` (cart) and `<slug>.png` (160x160 screenshot) to
   [`/site/static/carts`](https://github.com/aduros/wasm4/tree/main/site/static/carts).
4. Open a pull request!

:::tip
You can take a 160x160 screenshot of your game by pressing F9 in the emulator.
:::
