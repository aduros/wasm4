import { State } from "../state";
import { Runtime } from "./runtime";
import { RollbackManager, HISTORY_LENGTH } from "./rollback-manager";

class Peer {
    public playerIdx: number = -1;

    private channel: BroadcastChannel;

    /** The most recent frame that we've received input for. */
    public mostRecentInputFrame: number;

    // TODO(2022-03-20):
    // - Calculate ping
    // - Calculate frame advantage and a strategy to get back in sync

    constructor (name: string, onMessage: (peer: Peer, message: any) => void) {
        this.channel = new BroadcastChannel(name);
        this.channel.addEventListener("message", event => {
            onMessage(this, event.data);
        });
    }

    send (message: any) {
        this.channel.postMessage(message);
    }

    close () {
        this.channel.close();
    }
}

/**
 * Handles connections and messaging between other players.
 */
export class Netplay {
    private rollbackMgr: RollbackManager = null;

    private peers = new Map<number,Peer>();
    private localPlayerIdx = -1;

    constructor (runtime: Runtime) {
        const host = location.hash == "#host";

        const onMessage = (peer, message) => {
            switch (message.type) {
            case "join":
                // from client to host
                peer.send({
                    type: "start",
                    playerIdx: peer.playerIdx,
                    // TODO(2022-03-19): Send state and cart wasm
                    frame: this.rollbackMgr.currentFrame,
                });
                console.log("[host] Client connected as player", peer.playerIdx);
                break;

            case "start":
                // from host to client
                this.localPlayerIdx = message.playerIdx;
                this.rollbackMgr = new RollbackManager(message.frame, runtime);
                console.log(`[client] Connected as player ${message.playerIdx} on frame ${message.frame}`);
                break;

            case "input":
                peer.mostRecentInputFrame = message.frame + message.inputs.length - 1;
                this.rollbackMgr.addInputs(peer.playerIdx, message.frame, message.inputs);
                break;
            }
        }

        // Temporary scaffolding for testing
        const brokerClientId = Math.random();
        const broker = new Peer("broker", (_, message) => {
            if (host) {
                // Create a new connection to be used to connect to us and only us
                const newChannelName = "channel_"+Math.random();
                broker.send({
                    reply: message,
                    newChannelName: newChannelName,
                });

                const peer = new Peer(newChannelName, onMessage);
                peer.playerIdx = this.peers.size + 1;
                this.peers.set(peer.playerIdx, peer);

            } else if (message.reply == brokerClientId) {
                broker.close();

                const peer = new Peer(message.newChannelName, onMessage);
                peer.playerIdx = 0;
                this.peers.set(peer.playerIdx, peer);
                peer.send({type: "join"});
            }
        });

        if (host) {
            this.rollbackMgr = new RollbackManager(0, runtime);
            this.localPlayerIdx = 0;
        } else {
            broker.send(brokerClientId);
        }
    }

    update (localInput: number) {
        if (this.rollbackMgr == null) {
            return;
        }

        const frame = this.rollbackMgr.currentFrame;

        const stallThreshold = frame - HISTORY_LENGTH;
        for (const [playerIdx, peer] of this.peers) {
            if (peer.mostRecentInputFrame < stallThreshold) {
                console.log("STALL");
                return;
            }
        }

        // TODO(2022-03-20): Prevent flooding a peer if we haven't heard from them in a while?
        const inputs = [ localInput ];
        for (const [playerIdx, peer] of this.peers) {
            peer.send({type: "input", frame, inputs });
        }

        this.rollbackMgr.addInputs(this.localPlayerIdx, this.rollbackMgr.currentFrame, [ localInput ]);

        // Test with input lag
        // this.rollbackMgr.addInputs(this.localPlayerIdx, Math.max(0, this.rollbackMgr.currentFrame-8), [ localInput ]);

        this.rollbackMgr.update();
    }
}
