import { defineConfig } from 'vite';
import minifyHTML from 'rollup-plugin-minify-html-literals';

enum BuildModes {
  DeveloperBuild = 'developer-build',
  Slim = 'slim',
}

function isValidBuildMode(mode: unknown): mode is BuildModes {
  return mode == BuildModes.DeveloperBuild || mode === BuildModes.Slim;
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  if(!isValidBuildMode(mode)) {
    throw new TypeError(`[web-runtime][build]: unknown mode provided: ${mode}`);
  }

  return {
    mode,
    define: {
      DEVELOPER_BUILD: mode === BuildModes.DeveloperBuild
    },
    server: {
      port: 3000,
      open: '/?url=cart.wasm',
    },
    build: {
      sourcemap: mode === BuildModes.DeveloperBuild,
      outDir: `dist/${mode}`,
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
      // terserOptions: {
          // compress: false,
      // },
    },
    plugins: [
        minifyHTML(),
    ],
  };
});
