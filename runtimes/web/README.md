This directory contains the web runtime.

## Development

First run `npm run install-devtools` to build `@wasm4/web-devtool`.
Then run `npm install` to install dependencies.

For quick development run `npm start` and navigate to http://localhost:3000.
You will also need to place a test cartridge in public/cart.wasm.

You can create a cartridge with the `w4` tool. You can build that in the `cli`
directory with `npm install`, then just run the `cli.js` file.

Run `npm run build` to build a release build, which is used by the website and the `w4` CLI.
