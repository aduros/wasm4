import { State } from "../state";
import { Runtime } from "../runtime";
import { RollbackManager, HISTORY_LENGTH } from "./rollback-manager";
import { PeerManager } from "./peer-manager";

type Message = WelcomeMessage | PlayerInfoMessage | JoinRequestMessage | JoinReplyMessage | TickMessage;

type WelcomeMessage = {
    type: "WELCOME";
    otherPeers: string[];
}

type JoinRequestMessage = {
    type: "JOIN_REQUEST";
}

type JoinReplyMessage = {
    type: "JOIN_REPLY";
    yourPlayerIdx: number;
    frame: number;

    // TODO(2022-03-28): Need to split this into multiple binary chunks
    // state: Uint8Array;
}

type PlayerInfoMessage = {
    type: "PLAYER_INFO";
    playerIdx: number;
    frame: number;
}

// TODO(2022-03-22): Binary encode this in preparation for RTC
type TickMessage = {
    type: "TICK";

    frame: number;
    syncFrame: number;

    inputs: number[];

    ping: number;
    pong: number;
}

class RemotePlayer {
    playerIdx = -1;

    /** The most recent frame that we've received input for. */
    mostRecentFrame = -1;

    /** Estimated round-trip time for this peer. */
    ping = 0;

    /** The ping reply to send in the next message to this peer, for ping time calculation. */
    nextPong = 0;

    /** The most recent frame where both we and this peer were in perfect sync. */
    syncFrame = -1;

    outboundFrame = -1;
    readonly outboundInputs: number[] = [];

    constructor (public readonly peerId: string, private connection: RTCPeerConnection,
            private reliableChannel: RTCDataChannel, private unreliableChannel: RTCDataChannel) {
    }

    addPingSample (sample: number) {
        const factor = 0.125;
        this.ping = (this.ping > 0)
            ? (1 - factor) * this.ping + factor * sample
            : sample;
    }

    init (playerIdx: number, currentFrame: number) {
        this.playerIdx = playerIdx;
        this.mostRecentFrame = currentFrame;
        // this.syncFrame = -1;
        this.outboundFrame = currentFrame;
    }

    sendMessage (message: Message, simulateUDP = false) {
        console.log("Sending message: "+message.type);
        const json = JSON.stringify(message);

        if (simulateUDP) {
            // Simulate a UDP-like connection with packet loss and unordered delivery
            if (Math.random() > 0.05) {
                const simulatedTransmissionDelay = Math.random()*30 + 50;
                setTimeout(() => {
                    if (this.reliableChannel.readyState == "open") {
                        this.reliableChannel.send(json);
                    }
                }, simulatedTransmissionDelay);
            }
        } else {
            const simulatedTransmissionDelay = 50;
            setTimeout(() => {
                if (this.reliableChannel.readyState == "open") {
                    this.reliableChannel.send(json);
                }
            }, simulatedTransmissionDelay);
        }
    }
}

/**
 * Handles connections and messaging between other players.
 */
export class Netplay {
    private rollbackMgr?: RollbackManager;
    private peerMgr: PeerManager;

    private remotePlayers = new Map<string,RemotePlayer>();
    private localPlayerIdx = -1;

    private updateCount = 0;

    constructor (private runtime: Runtime) {
        this.peerMgr = new PeerManager(async (connection, peerId) => {
            const otherPeers = Array.from(this.remotePlayers.keys());

            // When a peer connects to us, send them a welcome message containing all other peer IDs
            // so they can connect to the entire mesh
            const remotePlayer = await this.createRemotePlayer(connection, peerId);
            remotePlayer.sendMessage({
                type: "WELCOME",
                otherPeers,
            });

            // Also inform them of our own player state
            remotePlayer.sendMessage({
                type: "PLAYER_INFO",
                playerIdx: this.localPlayerIdx,
                frame: this.rollbackMgr!.currentFrame,
            });
        });
    }

    host () {
        this.rollbackMgr = new RollbackManager(0, this.runtime);
        this.localPlayerIdx = 0;
    }

    async join (peerId: string) {
        const connection = this.peerMgr.connect(peerId);
        const remotePlayer = await this.createRemotePlayer(connection, peerId);

        remotePlayer.sendMessage({ type: "JOIN_REQUEST" });
    }

    getInviteLink (): string {
        return `http://localhost:3000/#${this.peerMgr.localPeerId}`;
    }

    close () {
        this.peerMgr.close();
    }

    private async createRemotePlayer (connection: RTCPeerConnection, peerId: string): Promise<RemotePlayer> {
        function createDataChannel (config: RTCDataChannelInit): Promise<RTCDataChannel> {
            return new Promise((resolve, reject) => {
                const channel = connection.createDataChannel("WASM-4", config);
                channel.binaryType = "arraybuffer";

                channel.onopen = () => { resolve(channel) };
                channel.onerror = reject;
            });
        }

        const [ reliableChannel, unreliableChannel ] = await Promise.all([
            createDataChannel({ negotiated: true, id: 0 }),
            createDataChannel({ negotiated: true, id: 1, ordered: false, maxRetransmits: 0 }),
            // TODO(2022-03-24): Add connection timeout
        ]);

        console.log("Connected to "+peerId+" :)");

        const remotePlayer = new RemotePlayer(peerId, connection, reliableChannel, unreliableChannel);
        this.remotePlayers.set(peerId, remotePlayer);

        reliableChannel.addEventListener("close", () => {
            this.remotePlayers.delete(peerId);
        });

        reliableChannel.addEventListener("message", async event => {
            const message: Message = JSON.parse(event.data);
            console.log("Received game message: "+message.type);

            switch (message.type) {
            case "WELCOME": {
                for (const peerId of message.otherPeers) {
                    if (!this.remotePlayers.has(peerId)) {
                        const connection = this.peerMgr.connect(peerId);
                        const remotePlayer = await this.createRemotePlayer(connection, peerId);
                        remotePlayer.sendMessage({
                            type: "PLAYER_INFO",
                            playerIdx: this.localPlayerIdx,
                            frame: this.rollbackMgr!.currentFrame,
                        });
                    }
                }
            } break;

            case "JOIN_REQUEST": {
                remotePlayer.init(this.nextPlayerIdx(), this.rollbackMgr!.currentFrame);

                const state = new State();
                state.read(this.runtime);

                remotePlayer.sendMessage({
                    type: "JOIN_REPLY",
                    yourPlayerIdx: remotePlayer.playerIdx,
                    frame: this.rollbackMgr!.currentFrame,
                    // state: state.toBytes(),
                });

                console.log("Client joined as player", remotePlayer.playerIdx);
            } break;

            case "JOIN_REPLY": {
                this.rollbackMgr = new RollbackManager(message.frame, this.runtime);
                this.localPlayerIdx = message.yourPlayerIdx;

                remotePlayer.init(remotePlayer.playerIdx, message.frame);

                // Tell all other peers about our new player info
                for (const [peerId, otherPlayer] of this.remotePlayers) {
                    if (otherPlayer != remotePlayer) {
                        otherPlayer.sendMessage({
                            type: "PLAYER_INFO",
                            playerIdx: this.localPlayerIdx,
                            frame: message.frame,
                        });
                    }
                }

                // const state = new State();
                // state.fromBytes(message.state);
                // state.write(this.runtime);

                console.log(`Joined as player ${this.localPlayerIdx} on frame ${message.frame}`);
            } break;

            case "PLAYER_INFO": {
                remotePlayer.init(message.playerIdx, message.frame);
            } break;

            case "TICK": {
                remotePlayer.nextPong = Math.max(remotePlayer.nextPong, message.ping);
                if (message.pong != 0) {
                    remotePlayer.addPingSample(Date.now() - message.pong);
                }

                if (this.rollbackMgr != null && remotePlayer.playerIdx >= 0) {
                    const mostRecentFrame = message.frame + message.inputs.length - 1;
                    if (mostRecentFrame > remotePlayer.mostRecentFrame) {
                        remotePlayer.mostRecentFrame = mostRecentFrame;
                        remotePlayer.syncFrame = message.syncFrame;
                        this.rollbackMgr.addInputs(remotePlayer.playerIdx, message.frame, message.inputs);
                    } else {
                        // console.log("Stale tick received");
                    }
                } else {
                    throw new Error("Received inputs before we could process them?");
                }
            } break;
            }
        });

        return remotePlayer;
    }

    /** Returns the next available player index, or -1. */
    private nextPlayerIdx () {
        outer: for (let playerIdx = 0; playerIdx < 4; ++playerIdx) {
            if (this.localPlayerIdx == playerIdx) {
                continue;
            }
            for (const [peerId, remotePlayer] of this.remotePlayers) {
                if (remotePlayer.playerIdx == playerIdx) {
                    continue outer;
                }
            }
            return playerIdx;
        }
        return -1;
    }

    update (localInput: number) {
        if (this.rollbackMgr == null) {
            return; // Not connected yet
        }

        let skipFrame = false;
        ++this.updateCount;

        const currentFrame = this.rollbackMgr.currentFrame;
        const stallThreshold = currentFrame - HISTORY_LENGTH;
        let minFrameDelta = 0;
        for (const [peerId, remotePlayer] of this.remotePlayers) {
            if (remotePlayer.mostRecentFrame < stallThreshold) {
                // Hard pause if we haven't heard from a peer in a while
                console.log("STALL", remotePlayer.playerIdx, remotePlayer.mostRecentFrame+" < "+stallThreshold);
                skipFrame = true;
                break;
            }

            // TODO(2022-03-22): If we have too many inputs, keep networking them, but skip this
            // frame locally
            // if (remotePlayer.outboundInputs.length > 10) {
            //     return;
            // }

            // The estimated difference that this peer's simulation is running compared to our local
            const frameDelta = 0.5 * remotePlayer.ping * 60/1000 + remotePlayer.mostRecentFrame - currentFrame;
            minFrameDelta = Math.min(minFrameDelta, frameDelta);
        }

        // If we're running ahead of all other peers, gradually slow down by stalling every 8th frame
        if ((this.updateCount & 7) == 0 && minFrameDelta < -1) {
            skipFrame = true;
        }

        for (const [peerId, remotePlayer] of this.remotePlayers) {
            if (remotePlayer.syncFrame >= remotePlayer.outboundFrame) {
                const delta = remotePlayer.syncFrame + 1 - remotePlayer.outboundFrame;
                remotePlayer.outboundFrame = remotePlayer.syncFrame + 1;
                remotePlayer.outboundInputs.splice(0, delta);
            }
            if (!skipFrame) {
                remotePlayer.outboundInputs.push(localInput);
            }

            // TODO(2022-03-20): Prevent flooding a peer if we haven't heard from them in a while?
            const message: TickMessage = {
                type: "TICK",
                frame: remotePlayer.outboundFrame,
                inputs: remotePlayer.outboundInputs,
                ping: Date.now(),
                pong: remotePlayer.nextPong,
                syncFrame: remotePlayer.mostRecentFrame,
            };
            remotePlayer.sendMessage(message, true);
        }

        if (!skipFrame) {
            // TODO(2022-03-21): The input lag frame needs to be calculated correctly for outgoing input
            const inputLag = 0;
            this.rollbackMgr.addInputs(this.localPlayerIdx, currentFrame + inputLag, [ localInput ]);

            this.rollbackMgr.update();
        }

        // Temporary debug info to show in devtools live expressions
        const debug = [];
        debug.push(`frame=${currentFrame}`);
        for (const [peerId, remotePlayer] of this.remotePlayers) {
            const frameDelta = 0.5 * remotePlayer.ping * 60/1000 + remotePlayer.mostRecentFrame - currentFrame;
            debug.push(`Player #${remotePlayer.playerIdx}: ping=${Math.round(remotePlayer.ping)} frameDelta=${frameDelta.toFixed(2)} outboundInputs=${remotePlayer.outboundInputs.length} mostRecentFrame=${remotePlayer.mostRecentFrame} syncFrame=${remotePlayer.syncFrame}`);
        }
        (window as any).NETPLAY_DEBUG = debug.join(" / ");
    }
}
