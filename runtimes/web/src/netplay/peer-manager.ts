/** WebRTC signaling messages. */
type Message = WhoAmIRequestMessage | WhoAmIReplyMessage | OfferMessage | AnswerMessage | CandidateMessage | AbortMessage | KeepaliveMessage;

/** Sent by a newly connecting client requesting its peer ID. */
type WhoAmIRequestMessage = {
    type: "WHOAMI_REQUEST";
}

type WhoAmIReplyMessage = {
    type: "WHOAMI_REPLY";
    yourPeerId: string;
    iceServers?: RTCIceServer[];
}

type OfferMessage = {
    type: "OFFER";
    description: RTCSessionDescriptionInit;
}

type AnswerMessage = {
    type: "ANSWER";
    description: RTCSessionDescriptionInit;
}

type CandidateMessage = {
    type: "CANDIDATE";
    candidate: RTCIceCandidateInit;
}

/** Sent by the server when it failed to contact the other peer. */
type AbortMessage = {
    type: "ABORT";
}

type KeepaliveMessage = {
    type: "KEEPALIVE";
}

/**
 * Connects to our websocket server for exchanging the signaling messages needed to establish WebRTC
 * peer-to-peer connections.
 */
class SignalClient {
    private socket?: WebSocket;
    private readonly bufferedOutput: string[] = [];
    private keepaliveInterval: number;

    constructor (private onMessage: (source: string, message: Message) => void) {
        this.connect();

        // Regularly send messages to keep the websocket connection from an idle timeout
        this.keepaliveInterval = window.setInterval(() => {
            this.send("", { type: "KEEPALIVE" }, false);
        }, 15000);
    }

    private async connect (): Promise<void> {
        // Connect to the first available signal server
        const servers = [
            // "ws://localhost:3001",

            "wss://webrtc-signal-server.wasm4.org",
            "wss://ywc2h85cv1.execute-api.us-east-1.amazonaws.com/production",

            "wss://webrtc-signal-server.wasm4.jwq.moe",
            "wss://iyuavuru2h.execute-api.eu-central-1.amazonaws.com/production"
        ];
        for (const server of servers) {
            try {
                this.socket = await new Promise((resolve, reject) => {
                    const socket = new WebSocket(server);
                    socket.addEventListener("open", () => {
                        resolve(socket);
                    });
                    socket.addEventListener("error", () => {
                        reject();
                    });
                });
                break;
            } catch (error) {
                console.error(error)
            }
        }
        if (!this.socket) {
            throw new Error("Unable to connect to signal server");
        }

        this.socket.addEventListener("message", event => {
            const { source, message } = JSON.parse(event.data);
            // console.log(`Received ${message.type} message from ${source}`);
            this.onMessage(source, message);
        });

        // Flush the output queue
        for (const output of this.bufferedOutput) {
            this.socket.send(output);
        }
        this.bufferedOutput.length = 0;
    }

    send (target: string, message: Message, deferIfNotReady = true) {
        // console.log(`Sent ${message.type} message to ${target}`);
        const output = JSON.stringify({ target, message });
        if (this.socket?.readyState == 1) {
            this.socket.send(output);
        } else if (deferIfNotReady) {
            this.bufferedOutput.push(output);
        }
    }

    close () {
        this.socket?.close();
        window.clearInterval(this.keepaliveInterval);
    }
}

/**
 * Handles brokering P2P connections.
 */
export class PeerManager {
    readonly localPeerId: Promise<string>;

    /** Pending P2P connections that haven't been fully established yet. */
    private readonly connections = new Map<string,RTCPeerConnection>();

    /** Our connection to the signaling server. */
    private readonly signalClient: SignalClient;

    /** The ICE servers we should use to setup RTC connections. */
    private iceServers?: RTCIceServer[];

    constructor (onConnection: (connection: RTCPeerConnection, remotePeerId: string) => void) {
        let resolveLocalPeerId: (localPeerId: string) => void;
        this.localPeerId = new Promise((resolve) => {
            resolveLocalPeerId = resolve;
        });

        this.signalClient = new SignalClient(async (source, message) => {
            switch (message.type) {
            case "WHOAMI_REPLY": {
                this.iceServers = message.iceServers;
                resolveLocalPeerId(message.yourPeerId);
            } break;

            case "OFFER": {
                if (!this.connections.has(source)) {
                    const connection = this.createConnection(source);

                    await connection.setRemoteDescription(message.description);
                    await connection.setLocalDescription(await connection.createAnswer());

                    onConnection(connection, source);

                    this.signalClient.send(source, { type: "ANSWER", description: connection.localDescription!.toJSON() });

                } else {
                    throw new Error("Received offer for a connection we already initiated");
                }
            } break;

            case "ANSWER": {
                const connection = this.connections.get(source);
                if (connection) {
                    await connection.setRemoteDescription(message.description);
                }
            } break;

            case "CANDIDATE": {
                const connection = this.connections.get(source);
                if (connection) {
                    await connection.addIceCandidate(new RTCIceCandidate(message.candidate));
                }
            } break;

            case "ABORT": {
                const connection = this.connections.get(source);
                if (connection) {
                    connection.close();
                }
            } break;
            }
        });

        this.signalClient.send("", {
            type: "WHOAMI_REQUEST",
        });
    }

    private createConnection (peerId: string): RTCPeerConnection {
        const connection = new RTCPeerConnection({
            iceServers: this.iceServers,
        });
        this.connections.set(peerId, connection);

        connection.addEventListener("negotiationneeded", async () => {
            await connection.setLocalDescription(await connection.createOffer());
            this.signalClient.send(peerId, { type: "OFFER", description: connection.localDescription!.toJSON() });
        });

        connection.addEventListener("icecandidate", ({ candidate }) => {
            if (candidate) {
                this.signalClient.send(peerId, { type: "CANDIDATE", candidate: candidate.toJSON() });
            }
        });

        connection.addEventListener("connectionstatechange", () => {
            const state = connection.connectionState;
            if (state == "connected" || state == "failed") {
                // After they connected (or failed to connect), we don't need to manage this
                // connection anymore
                this.connections.delete(peerId);
            }
        });

        return connection;
    }

    connect (remotePeerId: string): RTCPeerConnection {
        return this.connections.get(remotePeerId) || this.createConnection(remotePeerId);
    }

    close () {
        this.signalClient.close();
        for (const [peerId, connection] of this.connections) {
            connection.close();
        }
    }
}
