export const websocket = import.meta.env.DEV ? new WebSocket("ws://"+location.host) : null;
