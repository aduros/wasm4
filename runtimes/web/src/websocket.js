export const websocket = (location.port == "4444") ? new WebSocket("ws://"+location.host) : null;
