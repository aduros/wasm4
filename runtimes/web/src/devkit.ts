import { GAMEDEV_MODE, PLATFORM_DEVELOPER_MODE } from "./config-constants";

// The w4 CLI web socket only exists for gamedev mode.
// But if we're running `npm start` or `vite` there is no w4 CLI to connect to,
// but there is a vite websocket we may be fighting for, causing issues with vite.
export const cli_websocket = GAMEDEV_MODE && !PLATFORM_DEVELOPER_MODE
    ? new WebSocket((location.protocol == "https:" ? "wss" : "ws") + "://" + location.host)
    : null;
