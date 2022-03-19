import { Runtime } from "./runtime";
import { RollbackManager } from "./rollback-manager";

/**
 * Handles connections and messaging between other players.
 */
export class Netplay {
    private localPlayerIdx = 0;
    private rollbackMgr: RollbackManager;

    constructor (runtime: Runtime) {
        this.rollbackMgr = new RollbackManager(runtime);
    }

    update (localInput: number) {
        // this.rollbackMgr.addInputs(this.localPlayerIdx, this.rollbackMgr.currentFrame, [ localInput ]);

        // Test with input lag
        this.rollbackMgr.addInputs(this.localPlayerIdx, Math.max(0, this.rollbackMgr.currentFrame-8), [ localInput ]);

        this.rollbackMgr.update();

        // TODO(2022-03-19):
        // - Broadcast local input to all other players
        // - Process incoming messages from other players and forward inputs to rollbackMgr
    }
}
