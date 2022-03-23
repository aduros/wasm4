// TODO(2022-03-22): Remove and replace with RTCPeerConnection
export class Peer {
    readonly peerId: string;

    onMessage?: (message: any) => void;

    private sendChannel: BroadcastChannel;
    private recvChannel: BroadcastChannel;

    constructor (remotePeerId: string, localPeerId: string) {
        this.peerId = remotePeerId;

        this.sendChannel = new BroadcastChannel(remotePeerId+":"+localPeerId);
        this.recvChannel = new BroadcastChannel(localPeerId+":"+remotePeerId);

        this.recvChannel.addEventListener("message", event => {
            if (this.onMessage) {
                this.onMessage(event.data);
            }
        });
    }

    send (message: any) {
        this.sendChannel.postMessage(message);
    }

    close () {
        this.sendChannel.close();
        this.recvChannel.close();
    }
}

/**
 * Handles brokering P2P connections.
 */
export class PeerManager {
    private brokerChannel: BroadcastChannel;

    constructor (public readonly peerId: string, onConnection: (peer: Peer) => void) {
        this.brokerChannel = new BroadcastChannel("broker_"+peerId);

        this.brokerChannel.addEventListener("message", event => {
            const peerId = event.data;
            const peer = new Peer(peerId, this.peerId);

            this.brokerChannel.postMessage(peerId); // reply

            onConnection(peer);
        });
    }

    connect (peerId: string): Promise<Peer> {
        return new Promise(resolve => {
            const channel = new BroadcastChannel("broker_"+peerId);
            channel.addEventListener("message", event => {
                if (event.data == this.peerId) {
                    channel.close();
                    resolve(new Peer(peerId, this.peerId));
                }
            });
            channel.postMessage(this.peerId);
        });
    }
}
