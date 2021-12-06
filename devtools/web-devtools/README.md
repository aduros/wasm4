# @wasm4/web-devtools

## Description

A collection of custom elements that provides information regarding wasm4 web runtime.

## Developing

### Install dependencies

```bash
npm --prefix devtools/web-devtools i
```

### Test locally

Starts local server

```bash
npm --prefix devtools/web-devtools run dev
```

### Build package & web runtime

Starts local server

```bash
npm --prefix devtools/web-devtools/ run build && npm --prefix runtimes/web/ run build
```

### Build package

```bash
npm --prefix devtools/web-devtools run build
```

### Run formatter

```bash
npm --prefix devtools/web-devtools run prettify
```


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
--wasm4-devtools-bg-primary: pink;  /* color */
--wasm4-devtools-bg-secondary: cornflowerblue; /* color */
--wasm4-devtools-text-primary: black; /* color */
--wasm4-devtools-text-secondary: gray; /* color */
--wasm4-devtools-text-text-size: 18px; /* dimension */
}
```
