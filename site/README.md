# wasm4 site

## Description

This directory contains the website hosted at https://wasm4.org. It's built with
[Docusaurus](https://docusaurus.io/), a static site generator.

## Development

Read the [development-guide](/development-guide.md) first.

### Install dependencies

This package is managed by the `wasm4-monorepo`, to install 
set `wasm4/` as working directory then run `npm i`.

### Develop locally

Starts development server at http://localhost:3000

```bash
# working directory: wasm4/
npm -w site run start
```

### Build site

Creates release build in `site/build`.

```bash
# working directory: wasm4/
npm -w site run build
```
