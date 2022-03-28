type Message = OfferMessage | AnswerMessage | CandidateMessage;

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

// Temporary for WebRTC signaling
class Handshake {
    private channel: BroadcastChannel;

    constructor (private id: string, onMessage: (source: string, message: Message) => void) {
        this.channel = new BroadcastChannel("Handshake");
        this.channel.addEventListener("message", ({data}) => {
            const { target, source, message } = data;
            if (target == id) {
                console.log(`Received ${message.type} message from ${source}`);
                onMessage(source, message as Message);
            }
        });
    }

    addListener (onMessage: (source: string, message: Message) => void) {
    }

    send (target: string, message: Message) {
        console.log(`Sent ${message.type} message to ${target}`);
        this.channel.postMessage({target, source: this.id, message});
    }

    close () {
        this.channel.close();
    }
}

/**
 * Handles brokering P2P connections.
 */
export class PeerManager {
    private handshake: Handshake;

    private readonly connections = new Map<string,RTCPeerConnection>();

    constructor (localPeerId: string, onConnection: (connection: RTCPeerConnection, remotePeerId: string) => void) {
        this.handshake = new Handshake(localPeerId, async (source, message) => {
            switch (message.type) {
            case "OFFER": {
                if (!this.connections.has(source)) {
                    const connection = this.createConnection(source);

                    await connection.setRemoteDescription(message.description);
                    await connection.setLocalDescription(await connection.createAnswer());

                    onConnection(connection, source);

                    this.handshake.send(source, { type: "ANSWER", description: connection.localDescription!.toJSON() });

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
            console.log("[client] onnegotiationneeded");
            await connection.setLocalDescription(await connection.createOffer());
            this.handshake.send(peerId, { type: "OFFER", description: connection.localDescription!.toJSON() });
        });

        connection.addEventListener("icecandidate", ({ candidate }) => {
            if (candidate) {
                this.handshake.send(peerId, { type: "CANDIDATE", candidate: candidate.toJSON() });
            }
        });

        connection.addEventListener("connectionstatechange", () => {
            const state = connection.connectionState;
            console.log("state changed", state);
            if (state == "failed" || state == "closed") {
                console.log("Removing connection", peerId);
                this.connections.delete(peerId);
            }
        });

        return connection;
    }

    connect (remotePeerId: string): RTCPeerConnection {
        return this.connections.get(remotePeerId) || this.createConnection(remotePeerId);
    }

    close () {
        // TODO(2022-03-23): Close all connections
    }
}
