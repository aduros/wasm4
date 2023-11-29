import { APIGatewayProxyWebsocketHandlerV2 } from "aws-lambda";
import { ApiGatewayManagementApiClient, PostToConnectionCommand } from "@aws-sdk/client-apigatewaymanagementapi";

export const handler: APIGatewayProxyWebsocketHandlerV2 = async ({ body, requestContext }) => {
  async function sendToPeer (source: string, target: string, message: object) {
    const client = new ApiGatewayManagementApiClient({
      apiVersion: "2018-11-29",
      endpoint: process.env.IS_OFFLINE
        ? "http://localhost:3001"
        : requestContext.domainName.endsWith(".wasm4.org")
        ? `https://${requestContext.apiId}.execute-api.us-east-1.amazonaws.com/${requestContext.stage}`
        : `https://${requestContext.domainName}/${requestContext.stage}`,
      credentials: process.env.IS_OFFLINE
        ? { accessKeyId: "offline", secretAccessKey: "offline" }
        : undefined,
    });
    await client.send(new PostToConnectionCommand({
      Data: JSON.stringify({ source, message }),
      ConnectionId: target,
    }));
  }

  if (body) {
    const { target, message } = JSON.parse(body);

    switch (message.type) {
      case "WHOAMI_REQUEST":
        await sendToPeer("server", requestContext.connectionId, {
          type: "WHOAMI_REPLY",
          yourPeerId: requestContext.connectionId,
          iceServers: [
              {
                  urls: "stun:stun.relay.metered.ca:80",
              },
              {
                  urls: "turn:a.relay.metered.ca:80",
                  username: "f63c9a30d2bfbdb8da7c411b",
                  credential: "XBVS8RKEGvj2Y6ml",
              },
              {
                  urls: "turn:a.relay.metered.ca:80?transport=tcp",
                  username: "f63c9a30d2bfbdb8da7c411b",
                  credential: "XBVS8RKEGvj2Y6ml",
              },
              {
                  urls: "turn:a.relay.metered.ca:443",
                  username: "f63c9a30d2bfbdb8da7c411b",
                  credential: "XBVS8RKEGvj2Y6ml",
              },
              {
                  urls: "turn:a.relay.metered.ca:443?transport=tcp",
                  username: "f63c9a30d2bfbdb8da7c411b",
                  credential: "XBVS8RKEGvj2Y6ml",
              },
              {
                  urls: "stun:stun.l.google.com:19302",
              },
              {
                  urls: "stun:global.stun.twilio.com:3478",
              },
          ],
        });
        break;
      case "KEEPALIVE":
        // Ignore this message, it only exists to keep the connection open
        break;
      default:
        // Route the message to the given target
        try {
          await sendToPeer(requestContext.connectionId, target, message);
        } catch (error) {
          // Peer not found, send an abort message
          await sendToPeer(target, requestContext.connectionId, {
            type: "ABORT",
          });
        }
    }
  }

  return {
    statusCode: 200,
  }
}
