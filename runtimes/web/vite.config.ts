import { defineConfig } from 'vite';
import minifyHTML from 'rollup-plugin-minify-html-literals';

function isGamedevBuild(): boolean {
  // If you update this definition, make sure to also update the definition
  // in src/constants.ts to match.
  return process.env.VITE_WASM4_GAMEDEV_MODE !== "false";
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const gamedev_build = isGamedevBuild();

  return {
    server: {
      port: 3000,
      open: '/?url=cart.wasm',
    },
    build: {
      sourcemap: gamedev_build,
      outDir: `dist/${gamedev_build ? 'developer-build' : 'slim'}`,
      lib: {
        entry: 'src/index.ts',
        formats: ['iife'],
        name: "wasm4",
        fileName: () => `wasm4.js`,
      },
      rollupOptions: {
        output: {
          inlineDynamicImports: true,
          assetFileNames(assetInfo) {
            if(/styles?\.css$/i.test(assetInfo.name)) {
              return 'wasm4.css';
            }

            return assetInfo.name;
          },
        },
      },
      minify: "terser",
    },
    plugins: [
        minifyHTML(),
    ],
  };
});
