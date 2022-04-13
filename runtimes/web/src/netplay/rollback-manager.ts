import { State } from "../state";
import { Runtime } from "../runtime";

export const HISTORY_LENGTH = 20;

const PLAYER_COUNT = 4;

// A gamepad input byte
type InputData = number;

// A single frame of input history
class History {
    frame = -1;

    // Inputs for each player
    readonly inputs: InputData[];

    // For each input, whether it was a prediction
    readonly predicted: boolean[];

    // The state at the beginning of this frame
    readonly state: State;

    constructor () {
        this.state = new State();

        this.inputs = new Array(PLAYER_COUNT);
        this.predicted = new Array(PLAYER_COUNT);
        for (let ii = 0; ii < PLAYER_COUNT; ++ii) {
            this.inputs[ii] = 0;
            this.predicted[ii] = true;
        }
    }
}

class Player {
    /** Inputs queued for frames that we haven't simulated locally yet. */
    readonly futureInputs = new Map<number,InputData>();
}

/**
 * Collects gamepad inputs from all players and handles rollbacks.
 */
export class RollbackManager {
    private history: History[];
    private players: Player[];

    private rollbackIdx: number = HISTORY_LENGTH;

    constructor (public currentFrame: number, private runtime: Runtime) {
        this.history = new Array(HISTORY_LENGTH);
        for (let ii = 0; ii < HISTORY_LENGTH; ++ii) {
            this.history[ii] = new History();
        }

        this.players = new Array(PLAYER_COUNT);
        for (let ii = 0; ii < PLAYER_COUNT; ++ii) {
            this.players[ii] = new Player();
        }
    }

    addInputs (playerIdx: number, frame: number, inputs: InputData[]) {
        const player = this.players[playerIdx];

        // console.log(`${playerIdx} frame ${frame} -> ${inputs.join(", ")}`);

        // TODO(2022-04-09): Optimize

        for (const input of inputs) {
            if (frame >= this.currentFrame) {
                // Never overwrite a previously added input
                if (!player.futureInputs.has(frame)) {
                    // We haven't simulated this frame locally yet, schedule the input for later
                    player.futureInputs.set(frame, input);
                }

            } else {
                // Search our history for this frame
                for (let ii = 0, ll = HISTORY_LENGTH; ii < ll; ++ii) {
                    const history = this.history[ii];
                    if (history.frame == frame) {
                        // We only consider frames that have been predicted
                        if (history.predicted[playerIdx]) {
                            history.predicted[playerIdx] = false;

                            // If the input is different than we predicted, schedule a rollback
                            if (history.inputs[playerIdx] != input) {
                                history.inputs[playerIdx] = input;
                                this.rollbackIdx = Math.min(ii, this.rollbackIdx);
                            }
                        }
                        break;
                    }
                }
            }

            ++frame;
        }
    }

    update () {
        // Apply any rollbacks
        if (this.rollbackIdx < HISTORY_LENGTH) {
            // console.log(`Rolling back ${HISTORY_LENGTH - this.rollbackIdx} frames`);

            // Update predicted inputs, propagating them forward
            for (let ii = this.rollbackIdx+1; ii < HISTORY_LENGTH; ++ii) {
                const history = this.history[ii];
                for (let playerIdx = 0; playerIdx < PLAYER_COUNT; ++playerIdx) {
                    if (history.predicted[playerIdx]) {
                        const prevHistory = this.history[ii-1];
                        history.inputs[playerIdx] = prevHistory.inputs[playerIdx];
                    }
                }
            }

            let first = true;

            while (this.rollbackIdx < HISTORY_LENGTH) {
                const history = this.history[this.rollbackIdx++];

                if (first) {
                    first = false;

                    // Restore runtime state to the beginning of the rollback
                    history.state.write(this.runtime);

                } else {
                    // Update the saved state for this frame
                    history.state.read(this.runtime);
                }

                for (let playerIdx = 0; playerIdx < PLAYER_COUNT; ++playerIdx) {
                    this.runtime.setGamepad(playerIdx, history.inputs[playerIdx]);
                }
                this.runtime.update();
            }
        }

        const prevHistory = this.history[HISTORY_LENGTH-1];

        const nextHistory = this.history.shift()!;
        this.history.push(nextHistory);

        nextHistory.frame = this.currentFrame;

        // Save state before executing the frame
        nextHistory.state.read(this.runtime);

        // Copy inputs into the next frame
        for (let playerIdx = 0; playerIdx < PLAYER_COUNT; ++playerIdx) {
            const player = this.players[playerIdx];

            let input = player.futureInputs.get(this.currentFrame);
            if (input != null) {
                nextHistory.predicted[playerIdx] = false;
                player.futureInputs.delete(this.currentFrame);
            } else {
                // No known input for this player, repeat the input from the last frame
                nextHistory.predicted[playerIdx] = true;
                input = prevHistory.inputs[playerIdx];
            }

            nextHistory.inputs[playerIdx] = input;

            // Also poke runtime memory
            this.runtime.setGamepad(playerIdx, input);
        }

        this.runtime.update();

        ++this.currentFrame;
    }
}
