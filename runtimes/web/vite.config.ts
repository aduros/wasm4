import { UserConfig, defineConfig } from 'vite';
import minifyHTML from 'rollup-plugin-minify-html-literals-v3';
import cliPackageJSON from '../../cli/package.json';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const gamedev_build = process.env.VITE_WASM4_GAMEDEV_MODE !== "false";

  let user_config: UserConfig = {
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
          assetFileNames: (assetInfo): string => {
            if (assetInfo.name) {
              if(/styles?\.css$/i.test(assetInfo.name)) {
                return 'wasm4.css';
              } else {
                return assetInfo.name;
              }
            } else {
              throw new Error("Unexpected condition, assetInfo had no name");
            }
          },
        },
      },
      minify: "terser",
    },
    plugins: [
        minifyHTML(),
    ],
    define: {
      WASM4_GAMEDEV_MODE: gamedev_build,
      WASM4_VERSION: JSON.stringify(cliPackageJSON.version),
    },
  };

  return user_config;
});
