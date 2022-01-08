# wasm4-runtime

## Description

This workspace contains the web runtime.

## Development

Read the [development-guide](/development-guide.md) first.

### Install dependencies

This package is managed by the `wasm4-monorepo`, to install 
set `wasm4/` as working directory then run `npm i`.


### Develop locally

For quick development run the following command and navigate to http://localhost:8080. 

```bash
# working directory: wasm4/
npm -w wasm4-runtime run start
```

Note: You will also need to place a test cart in `dist/cart.wasm`.

### Build web runtime

Generates compiled version in `dist` folder.

```bash
# working directory: wasm4/
npm -w wasm4-runtime run build
```

### Build devtools and web runtime

```bash
# working directory: wasm4/
npm -w @wasm4/web-devtools -w wasm4-runtime run build
```


### Clean build artifacts

```bash
# working directory: wasm4/
npm -w wasm4-runtime run clean
```
