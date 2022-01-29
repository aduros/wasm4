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

        try {
            await audioCtx.audioWorklet.addModule(url);

            const workletNode = new AudioWorkletNode(audioCtx, "wasm4-apu");
            this.processorPort = workletNode.port;
            workletNode.connect(audioCtx.destination);

        } catch (error) {
            console.warn("AudioWorklet loading failed, falling back to slow audio", error);

            // Scoop out the APUProcessor with a simple polyfill
            let processor;
            const registerProcessor = (name, p) => {
                processor = new p();
            }
            const fn = new Function("registerProcessor", "AudioWorkletProcessor", workletRawSource);
            fn(registerProcessor, class {});
            this.processor = processor;

            const scriptNode = audioCtx.createScriptProcessor(1024, 0, 1);
            scriptNode.onaudioprocess = event => {
                const output = event.outputBuffer.getChannelData(0);
                processor.process(null, [[output]]);
            };
            scriptNode.connect(audioCtx.destination);
        }
    }

    tone (frequency, duration, volume, flags) {
        const processorPort = this.processorPort;
        if (processorPort != null) {
            // Send params out to the worker
            processorPort.postMessage([frequency, duration, volume, flags]);

        } else {
            // For the ScriptProcessorNode fallback, just call tone() directly
            this.processor.tone(frequency, duration, volume, flags);
        }
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
