/* `ENABLE_DEVTOOLS` is a compile-time flag, see `webpack.config.js` */
export const websocket = ENABLE_DEVTOOLS ? new WebSocket("ws://"+location.host) : null;
