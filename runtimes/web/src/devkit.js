export const ENABLED = (location.port == "4444");

export const websocket = ENABLED ? new WebSocket("ws://"+location.host) : null;
