import { State } from "../state";
import { Runtime } from "../runtime";
import { RollbackManager, HISTORY_LENGTH } from "./rollback-manager";
import { Peer, PeerManager } from "./peer-manager";

type Message = JoinRequestMessage | JoinReplyMessage | TickMessage;

type JoinRequestMessage = {
    type: "JOIN_REQUEST";
}

type JoinReplyMessage = {
    type: "JOIN_REPLY";
    myPlayerIdx: number;
    yourPlayerIdx: number;
    frame: number;
    state: Uint8Array;
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

    constructor (public readonly peer: Peer) {
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

    sendMessage (message: Message) {
        this.peer.send(message);
    }
}

/**
 * Handles connections and messaging between other players.
 */
export class Netplay {
    private rollbackMgr?: RollbackManager;

    private remotePlayers = new Map<string,RemotePlayer>();
    private localPlayerIdx = -1;

    constructor (private runtime: Runtime) {
        this.init();
    }

    private async init () {
        const host = location.hash == "#host";
        const peerId = host ? "host" : "client_"+Math.random();

        const peerMgr = new PeerManager(peerId, peer => {
            console.log("Client connected to me: "+peer.peerId);
            this.addRemotePlayer(peer);
        });

        if (host) {
            this.rollbackMgr = new RollbackManager(0, this.runtime);
            this.localPlayerIdx = 0;

        } else {
            const peer = await peerMgr.connect("host");
            const remotePlayer = this.addRemotePlayer(peer);
            remotePlayer.sendMessage({ type: "JOIN_REQUEST" });
        }
    }

    private nextPlayerIdx () {
        // TODO(2022-03-22): Return the next available player index
        // return this.remotePlayers.length + 1;
        return 1;
    }

    private addRemotePlayer (peer: Peer): RemotePlayer {
        const remotePlayer = new RemotePlayer(peer);
        this.remotePlayers.set(peer.peerId, remotePlayer);

        peer.onMessage = (message: Message) => {
            switch (message.type) {
            case "JOIN_REQUEST": {
                remotePlayer.init(this.nextPlayerIdx(), this.rollbackMgr!.currentFrame);

                const saveState = new State();
                saveState.read(this.runtime);

                peer.send({
                    type: "JOIN_REPLY",
                    myPlayerIdx: this.localPlayerIdx,
                    yourPlayerIdx: remotePlayer.playerIdx,
                    frame: this.rollbackMgr!.currentFrame,
                    state: saveState.toBytes(),
                });

                console.log("Client connected as player", remotePlayer.playerIdx);
            } break;

            case "JOIN_REPLY": {
                this.rollbackMgr = new RollbackManager(message.frame, this.runtime);
                this.localPlayerIdx = message.yourPlayerIdx;

                remotePlayer.init(message.myPlayerIdx, message.frame);

                const loadState = new State();
                loadState.fromBytes(message.state);
                loadState.write(this.runtime);

                console.log(`Connected as player ${message.myPlayerIdx} on frame ${message.frame}`);
            } break;

            case "TICK": {
                remotePlayer.nextPong = Math.max(remotePlayer.nextPong, message.ping);
                if (message.pong != 0) {
                    remotePlayer.addPingSample(Date.now() - message.pong);
                }

                if (this.rollbackMgr != null) {
                    const mostRecentFrame = message.frame + message.inputs.length - 1;
                    if (mostRecentFrame > remotePlayer.mostRecentFrame) {
                        // console.log("Updating most recent frame from peer: ", mostRecentFrame);
                        remotePlayer.mostRecentFrame = mostRecentFrame;
                        remotePlayer.syncFrame = message.syncFrame;
                        this.rollbackMgr.addInputs(remotePlayer.playerIdx, message.frame, message.inputs);
                    } else {
                        // console.log("Stale tick received");
                    }
                }
            } break;
            }
        };

        return remotePlayer;
    }

    update (localInput: number) {
        if (this.rollbackMgr == null) {
            return; // Not connected yet
        }

        const currentFrame = this.rollbackMgr.currentFrame;
        const stallThreshold = currentFrame - HISTORY_LENGTH;
        let minFrameDelta = 0;
        for (const [peerId, remotePlayer] of this.remotePlayers) {
            if (remotePlayer.mostRecentFrame < stallThreshold) {
                // Hard pause if we haven't heard from a peer in a while
                console.log("STALL "+remotePlayer.mostRecentFrame+" < "+stallThreshold);
                return;
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
        if ((currentFrame & 7) == 0 && minFrameDelta < -1) {
            console.log("Frame delta stall");
            return;
        }

        // TODO(2022-03-20): Prevent flooding a peer if we haven't heard from them in a while?

        for (const [peerId, remotePlayer] of this.remotePlayers) {
            if (remotePlayer.syncFrame >= remotePlayer.outboundFrame) {
                const delta = remotePlayer.syncFrame + 1 - remotePlayer.outboundFrame;
                remotePlayer.outboundFrame = remotePlayer.syncFrame + 1;
                remotePlayer.outboundInputs.splice(0, delta);
            }
            remotePlayer.outboundInputs.push(localInput);

            const ping = Date.now();
            const pong = remotePlayer.nextPong;
            const frame = remotePlayer.outboundFrame;
            const inputs = remotePlayer.outboundInputs.slice();
            const syncFrame = remotePlayer.mostRecentFrame;
            const message: TickMessage = { type: "TICK", frame, inputs, ping, pong, syncFrame };

            // console.log(`Sending ${inputs.length} inputs from frame ${frame}`);

            const simulateUDP = true;
            if (simulateUDP) {
                // Simulate a UDP-like connection with packet loss and unordered delivery
                if (Math.random() > 0.05) {
                    const simulatedTransmissionDelay = Math.random()*30 + 50;
                    setTimeout(() => {
                        remotePlayer.sendMessage(message);
                    }, simulatedTransmissionDelay);
                }
            } else {
                const simulatedTransmissionDelay = 50;
                setTimeout(() => {
                    remotePlayer.sendMessage(message);
                }, simulatedTransmissionDelay);
            }
        }

        // TODO(2022-03-21): The input lag frame needs to be calculated correctly for outgoing input
        const inputLag = 0;
        this.rollbackMgr.addInputs(this.localPlayerIdx, currentFrame + inputLag, [ localInput ]);

        this.rollbackMgr.update();

        // Temporary debug info to show in devtools live expressions
        const debug = [];
        debug.push(`frame=${currentFrame} inputLag=${inputLag}`);
        for (const [peerId, remotePlayer] of this.remotePlayers) {
            const frameDelta = 0.5 * remotePlayer.ping * 60/1000 + remotePlayer.mostRecentFrame - currentFrame;
            debug.push(`Player #${remotePlayer.playerIdx}: ping=${Math.round(remotePlayer.ping)} frameDelta=${frameDelta.toFixed(2)} outboundInputs=${remotePlayer.outboundInputs.length} mostRecentFrame=${remotePlayer.mostRecentFrame} syncFrame=${remotePlayer.syncFrame}`);
        }
        (window as any).NETPLAY_DEBUG = debug.join(" / ");
    }
}
