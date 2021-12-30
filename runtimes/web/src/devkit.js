/* `DEVELOPER_BUILD` is a compile-time flag, see `webpack.config.js` */
export const websocket = DEVELOPER_BUILD ? new WebSocket("ws://"+location.host) : null;
