# Distribution

## Bundle to HTML

When you're ready to distribute your game, you can bundle it into a standalone HTML file with `w4 bundle`:

```shell
w4 bundle cart.wasm --title "My Game" --html my-game.html
```

The bundled HTML contains no external dependencies, works offline, and can be easily shared on sites like [itch.io](https://itch.io/).

For saving disks, the localStorage key used will be based on the game title you supply.
Alternatively, you can specify a localStorage key prefix manually with `--html-disk-prefix <prefix>`.
This is useful to prevent disk conflicts between games.

You can customize the generated HTML file by giving a [Mustache](https://mustache.github.io/) template file with option `--html-template <file>`.
Example of a template file:
```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no">
  {{#html.metadata}}
  <meta name="{{name}}" content="{{content}}">
  {{/html.metadata}}
  {{#html.description}}
  <meta name="description" content="{{html.description}}">
  {{/html.description}}
  {{#html.iconUrl}}
  <link rel="shortcut icon" href="{{html.iconUrl}}">
  {{/html.iconUrl}}
  {{#html.diskPrefix}}
  <script id="wasm4-disk-prefix" type="text/plain">{{{html.diskPrefix}}}</script>
  {{/html.diskPrefix}}
  <title>{{html.title}}</title>
  <style>{{{html.wasm4Css}}}</style>
</head>
<body>
  <script id="wasm4-cart-json" type="application/json">{{{html.wasmCartJson}}}</script>
  <script>{{{html.wasm4js}}}</script>
  <wasm4-app></wasm4-app>
</body>
</html>
```

## Bundle to Windows/Mac/Linux executable

Native executables for multiple platforms can also be bundled:

```shell
w4 bundle cart.wasm --title "My Game" \
    --windows my-game-windows.exe \
    --mac my-game-mac \
    --linux my-game-linux
```

This creates tiny (~200 KB) executables that run natively, no web browser required! The disk
file (in case your game uses them) will be saved as `<game>.disk` in the same directory as your game.

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

```markdown
---
author: Your Name <your_github_username>
date: (When the cart was last updated, in YYYY-MM-DD format)
---

# (Your game's title)

Additional info can go here. It will be displayed on your game's page.
```

### Author Format

The `author` field uses the format `Name <contact>` where contact can be:
- A GitHub username (shows profile picture): `Alice <alice>`
- An email address: `Alice <alice@example.com>`
- A website URL: `Alice <https://alice.dev>`

For multiple authors, separate them with commas:

```yaml
author: Alice <alice>, Bob <bob@example.com>, Chris <https://chris.dev>
```

Now just commit your changes and open a pull request! As soon as it's merged, your game will appear
on the site.

:::info Licensing
Carts on wasm4.org are protected under [Creative Commons BY-NC-SA](https://creativecommons.org/licenses/by-nc-sa/4.0/). As the license holder, you can also release your cart elsewhere under a different license, such as open source on GitHub.
:::
