'use strict';
const { spawnSync, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const { EOL } = require('os');

const logError = (...args) => {
  console.error(`w4 opt error: ${args.join(EOL)}`);
}

/**
 * @type{(cart: string, options: { output: string, silent: boolean }) => void}
 */
function optimizeCart(cart, { output, silent }) {
  const absoluteInputCartPath = path.isAbsolute(cart)
    ? cart
    : path.resolve(process.cwd(), cart);

  const absoluteOutputCartPath = path.isAbsolute(output)
  ? output
  : path.resolve(process.cwd(), output);

  if(!fs.existsSync(absoluteInputCartPath)) {
     logError(`cart "${cart}" not found.`);
      process.exitCode = 1;
      return;
  }

   // @see https://nodejs.org/api/child_process.html#child_processspawnsynccommand-args-options
   const wasmOptProcess = spawnSync(
    'npx',
    [
      '-q',
      '--package',
      'binaryen',
      '--',
      'wasm-opt',
      absoluteInputCartPath,
      '-o',
      absoluteOutputCartPath,
      '-Oz',
      '--strip-dwarf',
      '--strip-producers',
      '--zero-filled-memory',
    ]
  );

  // status is the `exitCode`
  if(wasmOptProcess.status) {
    process.exitCode = wasmOptProcess.status;

    logError(`an error has occurred while running wasm-opt: exit code ${wasmOptProcess.status}`);

    process.stderr.write(wasmOptProcess.stderr);
    return;
  } 
  
  // wasmOptProcess.error Error | null: `The error object if the child process failed or timed out.`
  if(wasmOptProcess.error) {
    process.exitCode = 1;
    logError(`an error has occurred while running wasm-opt: ${wasmOptProcess.error}`);
    process.stderr.write(wasmOptProcess.stderr);

    return;
  }

  if(!silent) {
      console.log(`w4 opt${EOL}- input:  ${absoluteInputCartPath}${EOL}- output: ${absoluteOutputCartPath}`);
  }
}

module.exports = {
  optimizeCart,
};
