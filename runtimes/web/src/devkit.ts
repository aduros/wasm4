export const websocket = DEVELOPER_BUILD ? new WebSocket("ws://"+location.host) : null;
