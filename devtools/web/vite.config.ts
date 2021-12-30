import { defineConfig } from 'vite';
import postcssLit from 'rollup-plugin-postcss-lit';
import path from 'path';
import pkg from './package.json';

function createIsExternal(pkgJson) {
  const externalSet = new Set(
    Object.keys(pkgJson.peerDependencies || {}).concat(
      Object.keys(pkgJson.dependencies || {})
    )
  );

  return function external(id) {
    return externalSet.has(id) || (!id.startsWith('.') && !path.isAbsolute(id));
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: createIsExternal(pkg),
    },
    minify: true,
  },
  plugins: [postcssLit()],
});
