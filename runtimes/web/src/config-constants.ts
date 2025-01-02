/** True if the runtime is in Game Developer mode, with access to the devtools window. */
// WASM4_GAMEDEV_MODE is defined in vite.config.ts
export const GAMEDEV_MODE = WASM4_GAMEDEV_MODE;

/** True if we're developers of the WASM4 runtime itself, and are running the runtime
    using `npm start` or `vite` etc. */
export const PLATFORM_DEVELOPER_MODE = import.meta.env.MODE === "development";