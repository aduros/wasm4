export const websocket = import.meta.env.DEV
    ? new WebSocket((location.protocol == "https:" ? "wss" : "ws") + "://" + location.host)
    : null;
