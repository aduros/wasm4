import { State } from "../state";
import { Runtime } from "./runtime";

const PLAYER_COUNT = 4;
const HISTORY_LENGTH = 10;

// A gamepad input byte
type InputData = number;

class HistoryFrame {
    frame: number = -1;
    readonly inputs: InputData[];

    // The state at the beginning of this frame
    readonly state: State;

    constructor () {
        this.state = new State();

        this.inputs = new Array(PLAYER_COUNT);
        for (let ii = 0; ii < PLAYER_COUNT; ++ii) {
            this.inputs[ii] = 0;
        }
    }
}

class Player {
    readonly futureInputs = new Map<number,InputData>();
}

/**
 * Collects gamepad inputs from all players and handles rollbacks.
 */
export class RollbackManager {
    currentFrame: number = 0;

    private history: HistoryFrame[];
    private players: Player[];

    private rollbackFromFrame: number;

    constructor (private runtime: Runtime) {
        this.history = new Array(HISTORY_LENGTH);
        for (let ii = 0; ii < HISTORY_LENGTH; ++ii) {
            this.history[ii] = new HistoryFrame();
        }

        this.players = new Array(PLAYER_COUNT);
        for (let ii = 0; ii < PLAYER_COUNT; ++ii) {
            this.players[ii] = new Player();
        }
    }

    private getHistoryFrame (frame: number): HistoryFrame {
        for (const nextHistoryFrame of this.history) {
            if (nextHistoryFrame.frame == frame) {
                return nextHistoryFrame;
            }
        }
        throw new Error("Missing history frame");
    }

    addInputs (playerIdx: number, frame: number, inputs: InputData[]) {
        const player = this.players[playerIdx];

        for (const input of inputs) {
            if (frame >= this.currentFrame) {
                // We haven't simulated this frame locally yet, schedule the input for later
                player.futureInputs.set(frame, input);

            } else {
                // Search our history for this frame
                const nextHistoryFrame = this.getHistoryFrame(frame);
                if (nextHistoryFrame.inputs[playerIdx] != input) {
                    // If the input changed, schedule a rollback
                    nextHistoryFrame.inputs[playerIdx] = input;
                    this.rollbackFromFrame = Math.min(this.rollbackFromFrame, frame);
                }
            }

            ++frame;
        }
    }

    update () {
        // TODO(2022-03-19):
        // - perform scheduled rollbacks if necessary
        // - stall if we haven't received input from one of the players in a while

        const lastHistoryFrame = this.history[HISTORY_LENGTH-1];

        const nextHistoryFrame = this.history.shift();
        this.history.push(nextHistoryFrame);

        nextHistoryFrame.frame = this.currentFrame;

        // Save state before executing the frame
        nextHistoryFrame.state.read(this.runtime);

        // Copy inputs into the next frame
        for (let playerIdx = 0; playerIdx < PLAYER_COUNT; ++playerIdx) {
            const player = this.players[playerIdx];
            let input = player.futureInputs.get(this.currentFrame);
            if (input != null) {
                player.futureInputs.delete(this.currentFrame);
            } else {
                // No known input for this player, repeat the input from the last frame
                input = lastHistoryFrame.inputs[playerIdx];
            }
            nextHistoryFrame.inputs[playerIdx] = input;

            // Also poke runtime memory
            this.runtime.setGamepad(playerIdx, input);
        }

        this.runtime.update();

        ++this.currentFrame;
    }
}
