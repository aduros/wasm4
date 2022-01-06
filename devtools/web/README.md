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

This package is part of the `wasm4-monorepo`:
Do not run `npm i` from `runtimes/web`, run instead:

```bash
# working directory is repository root (`wasm4`)
npm i
```

### Dependencies

This package relies on [lit](https://lit.dev) library to manage custom elements:
docs are available [here](https://lit.dev/docs/).

### Develop locally

Starts local server

```bash
npm -w @wasm4/web-devtools run start
```

### Build devtools then web runtime

```bash
npm -w @wasm4/web-devtools -w wasm4-runtime run build
```

### Build package

```bash
npm -w @wasm4/web-devtools run build
```

### Run formatter

```bash
npm -w @wasm4/web-devtools run prettify
```

## License

[MIT](./License)
