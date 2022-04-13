import { defineConfig } from 'vite';
import minifyHTML from 'rollup-plugin-minify-html-literals';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    server: {
      port: 3000,
      open: '/?url=cart.wasm',
    },
    build: {
      sourcemap: mode != 'production',
      outDir: `dist/${mode == 'production' ? 'slim' : 'developer-build'}`,
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
