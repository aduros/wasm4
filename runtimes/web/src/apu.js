// Created using `npm run build:apu-worklet` and
// is automatically generated in build and start scripts.
import workletRawSource from "./apu-worklet.min.generated.js?raw";

export class APU {
    constructor () {
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)({
            sampleRate: 44100, // must match SAMPLE_RATE in worklet
        });
    }

    async init () {
        const audioCtx = this.audioCtx;
        const blob = new Blob([workletRawSource], {type: "application/javascript"});
        const url = URL.createObjectURL(blob);

        try {
            await audioCtx.audioWorklet.addModule(url);

            const workletNode = new AudioWorkletNode(audioCtx, "wasm4-apu", {
                outputChannelCount: [2],
            });
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

            const scriptNode = audioCtx.createScriptProcessor(1024, 0, 2);
            scriptNode.onaudioprocess = event => {
                const outputLeft = event.outputBuffer.getChannelData(0);
                const outputRight = event.outputBuffer.getChannelData(1);
                processor.process(null, [[outputLeft, outputRight]]);
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
