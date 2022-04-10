import { DEV_NETPLAY } from "./index";

/** WebRTC signaling messages. */
type Message = OfferMessage | AnswerMessage | CandidateMessage | AbortMessage;

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

function createRandomPeerId () {
    const base62 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    let peerId = "";
    for (let ii = 0; ii < 22; ++ii) {
        peerId += base62.charAt(Math.random() * 62 >>> 0);
    }
    return peerId;
}

/**
 * Connects to our websocket server for exchanging the signaling messages needed to establish WebRTC
 * peer-to-peer connections.
 */
class SignalClient {
    private readonly socket: WebSocket;
    private readonly bufferedOutput: string[] = [];

    constructor (localPeerId: string, onMessage: (source: string, message: Message) => void) {
        this.socket = new WebSocket(`wss://aduros.com/webrtc-signal-server/?peerId=${encodeURIComponent(localPeerId)}`);
        this.socket.addEventListener("message", event => {
            const { source, message } = JSON.parse(event.data);
            // console.log(`Received ${message.type} message from ${source}`);
            onMessage(source, message);
        });

        this.socket.addEventListener("open", event => {
            // Flush the output queue
            for (const output of this.bufferedOutput) {
                this.socket.send(output);
            }
            this.bufferedOutput.length = 0;
        });
    }

    send (target: string, message: Message) {
        // console.log(`Sent ${message.type} message to ${target}`);
        const output = JSON.stringify({ target, message });
        if (this.socket.readyState == 1) {
            this.socket.send(output);
        } else {
            this.bufferedOutput.push(output);
        }
    }

    close () {
        this.socket.close();
    }
}

/**
 * Handles brokering P2P connections.
 */
export class PeerManager {
    readonly localPeerId: string;

    /** Pending P2P connections that haven't been fully established yet. */
    private readonly connections = new Map<string,RTCPeerConnection>();

    /** Our connection to the signaling server. */
    private readonly signalClient: SignalClient;

    constructor (onConnection: (connection: RTCPeerConnection, remotePeerId: string) => void) {
        if (DEV_NETPLAY) {
            const host = !location.hash; // Temporary
            this.localPeerId = host ? "host" : createRandomPeerId();
        } else {
            this.localPeerId = createRandomPeerId();
        }

        this.signalClient = new SignalClient(this.localPeerId, async (source, message) => {
            switch (message.type) {
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
    }

    private createConnection (peerId: string): RTCPeerConnection {
        const connection = new RTCPeerConnection({
            iceServers: [
                {
                    urls: "stun:openrelay.metered.ca:80",
                },
                {
                    urls: "turn:openrelay.metered.ca:80",
                    username: "openrelayproject",
                    credential: "openrelayproject",
                },
                {
                    urls: "turn:openrelay.metered.ca:443",
                    username: "openrelayproject",
                    credential: "openrelayproject",
                },
                {
                    urls: "turn:openrelay.metered.ca:443?transport=tcp",
                    username: "openrelayproject",
                    credential: "openrelayproject",
                },
                {
                    urls: "stun:stun.l.google.com:19302",
                },
            ],
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
