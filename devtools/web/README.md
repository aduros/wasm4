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

## Developing

### Install dependencies

```bash
npm --prefix devtools/web i
```

This package relies on [lit](https://lit.dev) library to manage custom elements:
docs are available [here](https://lit.dev/docs/).

### Test locally

Starts local server

```bash
npm --prefix devtools/web run dev
```

### Build package & web runtime

```bash
npm --prefix devtools/web/ run build && npm --prefix runtimes/web/ run build
```

### Build package

```bash
npm --prefix devtools/web run build
```

### Run formatter

```bash
npm --prefix devtools/web run prettify
```

## License

[MIT](./License)
