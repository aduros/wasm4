import { State } from "../state";
import { Runtime } from "../runtime";
import { RollbackManager, HISTORY_LENGTH } from "./rollback-manager";
import { PeerManager } from "./peer-manager";
import { ChunkReader, ChunkWriter } from "./chunks";
import { MovingAverage } from "./moving-average";

/**
 * Flag for easier netplay testing. When this is on, open http://localhost:3000 to immediately start
 * hosting netplay, and http://localhost:3000/#?netplay=host in a second window to connect to it.
 */
export const DEV_NETPLAY = false;

const SIMULATE_LAG = false;

const MAX_OUTBOUND_INPUTS = 20;

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

// TODO(2022-04-07): Binary encode these messages instead of JSON
type UnreliableMessage = TickMessage | PingRequestMessage | PingReplyMessage;

type TickMessage = {
    type: "TICK";

    // The frame our local simulation is currently on
    frame: number;

    // The next input frame we need from the other peer
    requestedFrame: number;

    // The frame that the inputs are relative to
    inputFrame: number;
    inputs: number[];
}

type PingRequestMessage = {
    type: "PING_REQUEST";
    timestamp: number;
}

type PingReplyMessage = {
    type: "PING_REPLY";
    timestamp: number;
}

class RemotePlayer {
    playerIdx = -1;

    frame = -1;

    nextNeededFrame = -1;

    outboundFrame = -1;
    readonly outboundInputs: number[] = [];

    /** Estimated round-trip time for this player. */
    ping = new MovingAverage();

    /** Estimated number of frames we are ahead of this player. */
    readonly drift = new MovingAverage();

    readonly chunkReader: ChunkReader;
    readonly chunkWriter: ChunkWriter;

    constructor (public readonly peerId: string, private connection: RTCPeerConnection,
            private reliableChannel: RTCDataChannel, private unreliableChannel: RTCDataChannel) {
        this.chunkReader = new ChunkReader(reliableChannel);
        this.chunkWriter = new ChunkWriter(reliableChannel);
    }

    addOutboundInput (frame: number, input: number) {
        if (this.outboundFrame < 0) {
            this.outboundFrame = frame;
        }

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

    sendUnreliableMessage (message: UnreliableMessage) {
        const json = JSON.stringify(message);

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

    sendPingRequest () {
        this.sendUnreliableMessage({
            type: "PING_REQUEST",
            timestamp: Math.floor(performance.now()),
        });
    }

    sendPingReply (timestamp: number) {
        this.sendUnreliableMessage({
            type: "PING_REPLY",
            timestamp,
        });
    }

    sendTick (currentFrame: number) {
        this.sendUnreliableMessage({
            type: "TICK",
            frame: currentFrame,
            requestedFrame: this.nextNeededFrame,
            inputFrame: this.outboundFrame,
            inputs: this.outboundInputs,
        });
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
                for (const otherPlayer of this.remotePlayers.values()) {
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
            const message = JSON.parse(event.data) as UnreliableMessage;

            switch (message.type) {
            case "TICK":
                // Ignore if we haven't started our local simulation, or we haven't yet received a
                // player index from this peer
                if (this.rollbackMgr && remotePlayer.playerIdx >= 0) {
                    const { frame, requestedFrame, inputFrame, inputs } = message;
                    if (frame > remotePlayer.frame) {
                        remotePlayer.frame = frame;
                        remotePlayer.nextNeededFrame = inputFrame + inputs.length;

                        // Update outboundFrame
                        if (remotePlayer.outboundFrame < 0) {
                            remotePlayer.outboundFrame = requestedFrame;
                        } else if (requestedFrame > remotePlayer.outboundFrame) {
                            // Trim no longer needed inputs
                            const delta = requestedFrame - remotePlayer.outboundFrame;
                            remotePlayer.outboundFrame = requestedFrame;
                            remotePlayer.outboundInputs.splice(0, delta);
                        }

                        // We can estimate the remote frame by offsetting half the ping (RTT)
                        const estimatedRemoteFrame = frame + 0.5*remotePlayer.ping.average*60/1000;
                        // Calculate the difference and update our drift
                        const drift = this.rollbackMgr.currentFrame - estimatedRemoteFrame;
                        remotePlayer.drift.update(drift);

                        // Apply the remote inputs to the local simulation
                        this.rollbackMgr.addInputs(remotePlayer.playerIdx, inputFrame, inputs);
                    }
                }
                break;

            case "PING_REQUEST":
                remotePlayer.sendPingReply(message.timestamp);
                break;

            case "PING_REPLY":
                const ping = Math.floor(performance.now()) - message.timestamp;
                remotePlayer.ping.update(ping);
                break;
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
            for (const remotePlayer of this.remotePlayers.values()) {
                if (remotePlayer.playerIdx == playerIdx) {
                    continue outer;
                }
            }
            return playerIdx;
        }
        return -1;
    }

    update (localInput: number): boolean {
        if (!this.rollbackMgr) {
            return false; // Not joined yet
        }

        // Perform certain actions only once every few ticks
        const every8Ticks = (this.updateCount & 7) == 0;
        const every32Ticks = (this.updateCount & 31) == 0;
        ++this.updateCount;

        const currentFrame = this.rollbackMgr.currentFrame;
        const inputDelay = 2;
        const inputFrame = currentFrame + inputDelay;

        // Add our input to the local simulation
        this.rollbackMgr.addInputs(this.localPlayerIdx, inputFrame, [ localInput ]);

        let stall = false;

        for (const remotePlayer of this.remotePlayers.values()) {
            // Enqueue our input to send to the remote player
            remotePlayer.addOutboundInput(inputFrame, localInput);

            remotePlayer.sendTick(currentFrame);

            // Stall if we're starved for input from this player, or the outbound buffer is full
            if (remotePlayer.nextNeededFrame < currentFrame - HISTORY_LENGTH || remotePlayer.outboundInputs.length >= MAX_OUTBOUND_INPUTS) {
                stall = true;
            }

            if (every32Ticks) {
                remotePlayer.sendPingRequest();
            }
        }

        if (every8Ticks) {
            // If we're more than one frame ahead of everybody else, stall this frame and eventually
            // they'll catch up to us
            let maxDrift = 0;
            for (const remotePlayer of this.remotePlayers.values()) {
                maxDrift = Math.max(remotePlayer.drift.average, maxDrift);
            }
            if (maxDrift >= 1) {
                stall = true;
            }
        }

        if (!stall) {
            this.rollbackMgr.update();
        } else {
            console.log("STALL");
        }

        // Temporary debug info to show in devtools live expressions
        const debug = [];
        debug.push(`frame=${currentFrame} inputDelay=${inputDelay}`);
        for (const remotePlayer of this.remotePlayers.values()) {
            debug.push(`Player #${remotePlayer.playerIdx}: ping=${Math.round(remotePlayer.ping.average)} drift=${remotePlayer.drift.average.toFixed(2)} outboundInputs=${remotePlayer.outboundInputs.length}`);
        }
        (window as any).NETPLAY_DEBUG = debug.join(" / ");

        return !stall;
    }

    /** Get a player summary for UI display. */
    getSummary (): { playerIdx: number, ping: number }[] {
        const summary = [{ playerIdx: this.localPlayerIdx, ping: -1 }];
        for (const remotePlayer of this.remotePlayers.values()) {
            summary.push({ playerIdx: remotePlayer.playerIdx, ping: remotePlayer.ping.average });
        }
        summary.sort((a, b) => a.playerIdx - b.playerIdx);
        return summary;
    }
}
