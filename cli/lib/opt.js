'use strict';
const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const binaryenPkg = require.resolve('binaryen/package.json');
const wasmOptBinPath = path.join(path.dirname(binaryenPkg), 'bin/wasm-opt');

const { EOL } = require('os');

const logError = (...args) => {
  console.error(`w4 opt error: ${args.join(EOL)}`);
};

const wasmOptFlags = [
  '-Oz',
  '--strip-dwarf',
  '--strip-producers',
  '--zero-filled-memory',
];

/**
 * @type {(bytes: number) => string}
 */
const formatKiB = (bytes) => {
  return (bytes / 1024).toFixed(3) + 'KiB';
};

/**
 * @type {(num: number, den: number) => string}
 */
const formatPercent = (num, den) => {
  return `${((num / den) * 100).toFixed(2)}%`;
};

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

  /**
   * @type {import('fs').Stats | null}
   */
  let inCartStats = null;
  /**
   * @type {import('fs').Stats | null}
   */
  let outCartStats = null;

  try {
    inCartStats = fs.statSync(absoluteInputCartPath);

    if (inCartStats.isDirectory()) {
      logError(`cart "${absoluteInputCartPath}" is a directory.`);
      process.exitCode = 1;
      return;
    }
  } catch (err) {
    if (err?.code === 'ENOENT') {
      logError(`cart "${absoluteInputCartPath}" not found.`);
    } else {
      logError(err);
    }

    process.exitCode = 1;
    return;
  }

  // @see https://nodejs.org/api/child_process.html#child_processspawnsynccommand-args-options
  const wasmOptProcess = spawnSync(wasmOptBinPath, [
    absoluteInputCartPath,
    '-o',
    absoluteOutputCartPath,
    ...wasmOptFlags,
  ]);

  // status is the `exitCode`
  if (wasmOptProcess.status) {
    process.exitCode = wasmOptProcess.status;

    logError(
      `an error has occurred while running wasm-opt. Exit code ${wasmOptProcess.status}`
    );

    process.stderr.write(wasmOptProcess.stderr);
    return;
  }

  // wasmOptProcess.error Error | null: `The error object if the child process failed or timed out.`
  if (wasmOptProcess.error) {
    process.exitCode = 1;
    logError(
      `an error has occurred while running wasm-opt. Error ${wasmOptProcess.error}`
    );
    process.stderr.write(wasmOptProcess.stderr);

    return;
  }

  if (!silent) {
    outCartStats = fs.statSync(absoluteOutputCartPath);

    process.stdout.write(
      [
        'w4 opt',
        `- input:  ${formatKiB(inCartStats.size)} ${absoluteInputCartPath}`,
        `- output: ${formatKiB(outCartStats.size)} ${absoluteOutputCartPath}`,
        `size reduction: ${formatPercent(
          inCartStats.size - outCartStats.size,
          inCartStats.size
        )}`,
      ]
        .join(EOL)
        .concat(EOL)
    );
  }
}

module.exports = {
  optimizeCart,
};
