# wasm4 cli

## Description

This directory contains the `w4` command-line tool.

## Development

Read the [development-guide](/development-guide.md) first.

### Install dependencies

This package is managed by the `wasm4-monorepo`, to install 
set `wasm4/` as working directory then run `npm i`.


### Develop locally

Run `npm link` in this directory to install a `w4` symlink for local development.
You will also want to build the runtime, by running:

```bash
# working directory: wasm4/
npm -w wasm4-runtime run build
```

For quick development you can also run the cli directly:

```bash
# working directory: wasm4/
node cli/cli.js --help
```


We use [pkg](https://www.npmjs.com/package/pkg) to bundle node-free binaries. Make sure that all
file resources that need to be loaded at runtime go in the assets directory in order to be included.
