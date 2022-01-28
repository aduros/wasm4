import workletRawSource from "../dist/apu-worklet.js?raw"; // RELEASE
// import workletRawSource from "./apu-worklet.js?raw"; // DEBUG

export class APU {
    async init () {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)({
            sampleRate: 44100, // must match SAMPLE_RATE in worklet
        });
        this.audioCtx = audioCtx;

        const blob = new Blob([workletRawSource], {type: "application/javascript"});
        const url = URL.createObjectURL(blob);
        await audioCtx.audioWorklet.addModule(url);

        const workletNode = new AudioWorkletNode(audioCtx, "wasm4-apu");
        workletNode.connect(audioCtx.destination);
        this.workletNode = workletNode;
    }

    tone (frequency, duration, volume, flags) {
        this.workletNode.port.postMessage([frequency, duration, volume, flags]);
    }

    unlockAudio () {
        const audioCtx = this.audioCtx;
        if (audioCtx.state == "suspended") {
            audioCtx.resume();
        }
    }

    pauseAudio () {
        const audioCtx = this.audioCtx;
        if (audioCtx.state == "running") {
            audioCtx.suspend();
        }
    }
}
