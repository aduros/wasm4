This directory contains the `w4` command-line tool.

## Development

First run `npm install` to install dependencies.

Run `npm link` in this directory to install a `w4` symlink for local development.

You will probably also want to build at least one of the runtimes. Follow the instructions
in /runtimes/*/README.md.

We use [pkg](https://www.npmjs.com/package/pkg) to bundle node-free binaries. Make sure that all
file resources that need to be loaded at runtime go in the assets directory in order to be included.
