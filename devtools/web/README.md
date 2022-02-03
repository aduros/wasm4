# @wasm4/web-devtools

## Description

A collection of custom elements that provides information about [wasm4](https://wasm4.org/) web runtime.

## Usage

```js
import { wasm4DevtoolsTagName } from '@wasm4/web-devtools';

const elem = document.createElement(wasm4DevtoolsTagName);
document.body.appendChild(elem);
```

## Themeing

All exported components can be customized using the following css variables:

```css
:root {
  --wasm4-devtools-bg-primary: pink; /* color */
  --wasm4-devtools-bg-secondary: cornflowerblue; /* color */
  --wasm4-devtools-text-primary: black; /* color */
  --wasm4-devtools-text-secondary: gray; /* color */
  --wasm4-devtools-text-text-size: 18px; /* dimension */
  --wasm4-devtools-window-z-index: 15; /* unitless number */
}
```

## Development

Read the [development-guide](/development-guide.md) first.

### Install dependencies

This package is managed by the `wasm4-monorepo`, to install 
set `wasm4/` as working directory then run `npm i`.


### Develop locally

Starts local server

```bash
# working directory: wasm4/
npm -w @wasm4/web-devtools run start
```

### Build package

```bash
# working directory: wasm4/
npm -w @wasm4/web-devtools run build
```

### Build devtools and web runtime

```bash
# working directory: wasm4/
npm -w @wasm4/web-devtools -w wasm4-runtime run build
```

### Run formatter

```bash
# working directory: wasm4/
npm -w @wasm4/web-devtools run prettify
```

### Dependencies

This package relies on [lit](https://lit.dev) library to manage custom elements:
docs are available [here](https://lit.dev/docs/).

## License

[MIT](./License)
