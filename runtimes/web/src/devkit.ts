import * as constants from "./constants";
// True if we're developers of the WASM4 runtime itself, and are running the runtime
// using `npm start` or `vite` etc. In this case, there's no wasm4 CLI web socket to
// connect to, but we might be fighting for the Vite websocket.
const PLATFORM_DEVELOPER_MODE = import.meta.env.MODE === "development";

export const websocket = constants.GAMEDEV_MODE && !PLATFORM_DEVELOPER_MODE
    ? new WebSocket((location.protocol == "https:" ? "wss" : "ws") + "://" + location.host)
    : null;
