import * as constants from "./constants";
export const websocket = constants.GAMEDEV_MODE
    ? new WebSocket((location.protocol == "https:" ? "wss" : "ws") + "://" + location.host)
    : null;
