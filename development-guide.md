# wasm4 development guide

## Project structure

```
├── cli         # `w4` command-line tool.
├── devtools    #
│   └── web     # web devtools
├── examples    # wasm4 cart examples
├── runtimes    #
│   ├── native  # native runtime
│   └── web     # web runtime
├── scripts     # misc. scripts (e.g. netlify-ci)
└── site        # website hosted at https://wasm4.org.
```

## Requirements

### node/npm

This project requires specific [node](https://nodejs.org/en/) and [`npm`](https://docs.npmjs.com/about-npm) versions defined in [package.json.engines](./package.json).

If you are using [nvm](https://github.com/nvm-sh/nvm) run `nvm use`.

## Monorepo

This project is organized as a monorepo managed by [`npm`](https://docs.npmjs.com/about-npm).

When you run `npm i` in `wasm4/` `npm` automatically installs all [workspaces](https://docs.npmjs.com/cli/v8/using-npm/workspaces) dependencies 
and symlinks, if necessary, the local packages.

When you develop in a monorepo the working directory should always be `wasm4/`.

### Common actions

#### Install dependency inside a workspace

```bash
# working directory is wasm4/
# workspace-name is <package.json>.name
npm i -w <workspace-name> <package-name>
```

#### Run script

```bash
# working directory is wasm4/
# workspace-name is <package.json>.name
npm i -w <workspace-name> run <script-name>
```

#### Run script in all workspaces

```bash
# working directory is wasm4/
npm i -ws --if-present run <script-name>
```

#### More info

- [using-npm/workspaces](https://docs.npmjs.com/cli/v8/using-npm/workspaces)
- [simple-monorepos](https://2ality.com/2021/07/simple-monorepos.html)
