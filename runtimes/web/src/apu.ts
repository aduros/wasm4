// Created using `npm run build:apu-worklet` and
// is automatically generated in build and start scripts.
import workletRawSource from "./apu-worklet.min.generated.js?raw";

declare global {
    interface Window {
      webkitAudioContext: typeof AudioContext
    }
}

export class APU {
    audioCtx: AudioContext;
    processor!: APUProcessor;
    processorPort!: MessagePort;
    paused: boolean = false;

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
            let processor!: APUProcessor;
            const registerProcessor: typeof globalThis.registerProcessor = (name, p) => {
                processor = new p() as APUProcessor;
            }
            const fn = new Function("registerProcessor", "AudioWorkletProcessor", workletRawSource);
            fn(registerProcessor, class {});
            this.processor = processor;

            const scriptNode = audioCtx.createScriptProcessor(1024, 0, 2);
            scriptNode.onaudioprocess = event => {
                const outputLeft = event.outputBuffer.getChannelData(0);
                const outputRight = event.outputBuffer.getChannelData(1);
                processor.process(null, [[outputLeft, outputRight]], null);
            };
            scriptNode.connect(audioCtx.destination);
        }
    }

    tick() {
        if (this.processorPort != null) {
            this.processorPort.postMessage('tick');
        } else {
            this.processor.tick();
        }
    }

    tone (frequency: number, duration: number, volume: number, flags: number) {
        if (this.processorPort != null) {
            // Send params out to the worker
            this.processorPort.postMessage([frequency, duration, volume, flags]);
        } else {
            // For the ScriptProcessorNode fallback, just call tone() directly
            this.processor.tone(frequency, duration, volume, flags);
        }
    }

    unpauseAudio () {
        this.paused = false;
        const audioCtx = this.audioCtx;
        if (audioCtx.state == "suspended") {
            audioCtx.resume();
        }
    }

    pauseAudio () {
        this.paused = true;
        const audioCtx = this.audioCtx;
        if (audioCtx.state == "running") {
            audioCtx.suspend();
        }
    }

    // Most web browsers won't play audio until the user has interacted with the web page.
    // Even if there are already pending Promises from an AudioContext.resume() call when the
    // page gets interaction, apparently the AudioContext still needs to be poked with a
    // resume() call to start playing.
    pokeAudio () {
        if (!this.paused) {
            this.audioCtx.resume();
        }
    }
}
