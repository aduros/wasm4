import { State } from "../state";
import { Runtime } from "../runtime";
import { RollbackManager, HISTORY_LENGTH } from "./rollback-manager";
import { PeerManager } from "./peer-manager";
import { ChunkReader, ChunkWriter } from "./chunks";

/**
 * Flag for easier netplay testing. When this is on, open http://localhost:3000 to immediately start
 * hosting netplay, and http://localhost:3000/#?netplay=host in a second window to connect to it.
 */
export const DEV_NETPLAY = false;

const SIMULATE_LAG = false;

/**
 * Control messages sent over the reliable data channel.
 *
 * The initial handshake when peer A connects to peer B goes like this:
 *
 * 1. B → WELCOME → A
 * 2. A → JOIN_REQUEST → B
 * 3. B → (binary payload containing the cart and game state) → A
 * 4. B → JOIN_REPLY → A
 *
 * At any point, a peer can send a PLAYER_INFO to another to inform them of their player index.
 */
type Message =
    WelcomeMessage |
    JoinRequestMessage |
    JoinReplyMessage |
    PlayerInfoMessage;

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

    // The offset to the state data in the binary payload
    stateOffset: number;
}

type PlayerInfoMessage = {
    type: "PLAYER_INFO";
    playerIdx: number;
}

// TODO(2022-03-22): Binary encode this
type TickPayload = {
    ping: number;
    pong: number;

    frame: number;
    syncFrame: number;

    inputs: number[];
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

    readonly chunkReader: ChunkReader;
    readonly chunkWriter: ChunkWriter;

    constructor (public readonly peerId: string, private connection: RTCPeerConnection,
            private reliableChannel: RTCDataChannel, private unreliableChannel: RTCDataChannel) {
        this.chunkReader = new ChunkReader(reliableChannel);
        this.chunkWriter = new ChunkWriter(reliableChannel);
    }

    addPingSample (sample: number) {
        const factor = 0.125;
        this.ping = (this.ping > 0)
            ? (1 - factor) * this.ping + factor * sample
            : sample;
    }

    addOutboundInput (frame: number, input: number) {
        if (frame < this.outboundFrame) {
            // Prepend inputs so that our outbound inputs are based on the new frame
            for (let count = this.outboundFrame - frame; count > 0; --count) {
                this.outboundInputs.unshift(input);
            }
            this.outboundFrame = frame;

        } else {
            const frameIdx = frame - this.outboundFrame;

            // Ensure we never overwrite a frame we already queued input for
            if (frameIdx >= this.outboundInputs.length) {
                // Pad out any intermediate frames we don't have by repeating the last input
                for (let ii = this.outboundInputs.length; ii < frameIdx; ++ii) {
                    this.outboundInputs[ii] = (ii > 0) ? this.outboundInputs[ii-1] : 0;
                }
                this.outboundInputs[frameIdx] = input;
            }
        }
    }

    sendMessage (message: Message) {
        console.log(`Sending ${message.type} message to ${this.peerId}`, message);
        const json = JSON.stringify(message);

        // Simulate connection lag
        if (SIMULATE_LAG) {
            const simulatedTransmissionDelay = 50;
            setTimeout(() => {
                if (this.reliableChannel.readyState == "open") {
                    this.reliableChannel.send(json);
                }
            }, simulatedTransmissionDelay);
        } else {
            this.reliableChannel.send(json);
        }
    }

    sendTick () {
        const payload: TickPayload = {
            ping: Math.floor(performance.now()),
            pong: this.nextPong,
            frame: this.outboundFrame,
            syncFrame: this.mostRecentFrame,
            inputs: this.outboundInputs,
        };
        const json = JSON.stringify(payload);

        // Simulate a bad connection with packet loss and unordered delivery
        if (SIMULATE_LAG) {
            if (Math.random() > 0.05) {
                const simulatedTransmissionDelay = Math.random()*30 + 50;
                setTimeout(() => {
                    if (this.unreliableChannel.readyState == "open") {
                        this.unreliableChannel.send(json);
                    }
                }, simulatedTransmissionDelay);
            }
        } else {
            if (this.unreliableChannel.readyState == "open") {
                this.unreliableChannel.send(json);
            }
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

    // Callbacks for showing UI notifications
    onstart?: (playerIdx: number) => void;
    onjoin?: (playerIdx: number) => void;
    onleave?: (playerIdx: number) => void;

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
            if (this.localPlayerIdx >= 0) {
                remotePlayer.sendMessage({
                    type: "PLAYER_INFO",
                    playerIdx: this.localPlayerIdx,
                });
            }
        });
    }

    host () {
        this.rollbackMgr = new RollbackManager(0, this.runtime);
        this.localPlayerIdx = 0;
    }

    join (peerId: string) {
        const connection = this.peerMgr.connect(peerId);
        this.createRemotePlayer(connection, peerId).then(remotePlayer => {
            remotePlayer.sendMessage({ type: "JOIN_REQUEST" });
        }, error => {
            this.runtime.blueScreen(new Error("Failed to connect\nto peer. They may\nbe offline?"));
        });
    }

    getInviteLink (): string {
        return `https://wasm4.org/netplay/#${this.peerMgr.localPeerId}`;
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

        const remotePlayer = new RemotePlayer(peerId, connection, reliableChannel, unreliableChannel);
        this.remotePlayers.set(peerId, remotePlayer);

        connection.addEventListener("connectionstatechange", () => {
            console.log(`Peer ${peerId} connection state changed to ${connection.connectionState}`);
            if (connection.connectionState != "connected" && this.remotePlayers.has(peerId)) {
                console.log(`Peer ${peerId} left`);
                this.remotePlayers.delete(peerId);

                if (this.onleave && remotePlayer.playerIdx >= 0) {
                    this.onleave(remotePlayer.playerIdx);
                }
            }
        });

        reliableChannel.addEventListener("message", async event => {
            if (typeof event.data != "string") {
                return; // Ignore binary data
            }

            const message = JSON.parse(event.data) as Message;
            console.log(`Received ${message.type} message from ${peerId}`, message);

            switch (message.type) {
            case "WELCOME": {
                for (const peerId of message.otherPeers) {
                    if (!this.remotePlayers.has(peerId)) {
                        const connection = this.peerMgr.connect(peerId);
                        const remotePlayer = await this.createRemotePlayer(connection, peerId);

                        if (this.localPlayerIdx >= 0) {
                            remotePlayer.sendMessage({
                                type: "PLAYER_INFO",
                                playerIdx: this.localPlayerIdx,
                            });
                        }
                    }
                }
            } break;

            case "JOIN_REQUEST": {
                // Assign them a player index
                remotePlayer.playerIdx = this.nextPlayerIdx();

                // Send the cart data
                remotePlayer.chunkWriter.write(this.runtime.wasmBuffer!);

                // And the game state
                const state = new State();
                state.read(this.runtime);
                remotePlayer.chunkWriter.write(state.toBytes());

                remotePlayer.chunkWriter.flush();

                remotePlayer.sendMessage({
                    type: "JOIN_REPLY",
                    yourPlayerIdx: remotePlayer.playerIdx,
                    frame: this.rollbackMgr!.currentFrame,
                    stateOffset: this.runtime.wasmBuffer!.byteLength,
                });

                if (this.onjoin) {
                    this.onjoin(remotePlayer.playerIdx);
                }
            } break;

            case "JOIN_REPLY": {
                // Tell all other peers about our new player info
                for (const [peerId, otherPlayer] of this.remotePlayers) {
                    if (otherPlayer != remotePlayer) {
                        otherPlayer.sendMessage({
                            type: "PLAYER_INFO",
                            playerIdx: this.localPlayerIdx,
                        });
                    }
                }

                const bytes = remotePlayer.chunkReader.read();
                const cartBytes = bytes.subarray(0, message.stateOffset);
                const stateBytes = bytes.subarray(message.stateOffset);

                // Load the cart, ignoring file size limits so netplay works even during development
                await this.runtime.load(cartBytes, false);

                const state = new State();
                state.fromBytes(stateBytes);
                state.write(this.runtime);

                this.rollbackMgr = new RollbackManager(message.frame, this.runtime);
                this.localPlayerIdx = message.yourPlayerIdx;

                if (this.onstart) {
                    this.onstart(this.localPlayerIdx);
                }
            } break;

            case "PLAYER_INFO": {
                if (remotePlayer.playerIdx == -1) {
                    remotePlayer.playerIdx = message.playerIdx;

                    // TODO(2022-04-03): Don't send this for initially joining clients
                    if (this.onjoin) {
                        this.onjoin(remotePlayer.playerIdx);
                    }
                }
            } break;
            }
        });

        unreliableChannel.addEventListener("message", async event => {
            const payload = JSON.parse(event.data) as TickPayload;

            remotePlayer.nextPong = Math.max(remotePlayer.nextPong, payload.ping);
            if (payload.pong != 0) {
                remotePlayer.addPingSample(Math.floor(performance.now()) - payload.pong);
            }

            // Ignore if we haven't started our local simulation, or we haven't yet received a
            // player index from this peer
            if (this.rollbackMgr && remotePlayer.playerIdx >= 0) {
                const mostRecentFrame = payload.frame + payload.inputs.length - 1;
                if (mostRecentFrame > remotePlayer.mostRecentFrame) {
                    remotePlayer.mostRecentFrame = mostRecentFrame;
                    remotePlayer.syncFrame = payload.syncFrame;
                    this.rollbackMgr.addInputs(remotePlayer.playerIdx, payload.frame, payload.inputs);
                }
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
        if (!this.rollbackMgr) {
            return; // Not joined yet
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
            console.log("Stall frame for catch-up");
            skipFrame = true;
        }

        const inputDelay = 2;
        const inputFrame = currentFrame + inputDelay;

        for (const [peerId, remotePlayer] of this.remotePlayers) {
            if (remotePlayer.outboundFrame < 0) {
                remotePlayer.outboundFrame = inputFrame;
            }
            if (remotePlayer.syncFrame >= remotePlayer.outboundFrame) {
                const delta = remotePlayer.syncFrame + 1 - remotePlayer.outboundFrame;
                remotePlayer.outboundFrame = remotePlayer.syncFrame + 1;
                remotePlayer.outboundInputs.splice(0, delta);
            }
            if (!skipFrame) {
                remotePlayer.addOutboundInput(inputFrame, localInput);
            }

            remotePlayer.sendTick();
        }

        if (!skipFrame) {
            this.rollbackMgr.addInputs(this.localPlayerIdx, inputFrame, [ localInput ]);

            this.rollbackMgr.update();
        }

        // Temporary debug info to show in devtools live expressions
        const debug = [];
        debug.push(`frame=${currentFrame} inputDelay=${inputDelay}`);
        for (const [peerId, remotePlayer] of this.remotePlayers) {
            const frameDelta = 0.5 * remotePlayer.ping * 60/1000 + remotePlayer.mostRecentFrame - currentFrame;
            debug.push(`Player #${remotePlayer.playerIdx}: ping=${Math.round(remotePlayer.ping)} frameDelta=${frameDelta.toFixed(2)} outboundInputs=${remotePlayer.outboundInputs.length} mostRecentFrame=${remotePlayer.mostRecentFrame} syncFrame=${remotePlayer.syncFrame}`);
        }
        (window as any).NETPLAY_DEBUG = debug.join(" / ");
    }

    /** Get a player summary for UI display. */
    getSummary (): { playerIdx: number, ping: number }[] {
        const summary = [{ playerIdx: this.localPlayerIdx, ping: -1 }];
        for (const [peerId, remotePlayer] of this.remotePlayers) {
            summary.push({ playerIdx: remotePlayer.playerIdx, ping: remotePlayer.ping });
        }
        summary.sort((a, b) => a.playerIdx - b.playerIdx);
        return summary;
    }
}
