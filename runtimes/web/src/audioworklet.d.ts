// Provides some of the missing types from the WebAudio API.
// This puts these declarations in the global scope, even though they only exist in
// the AudioWorklet Global Scope, so we'll just have to be careful not to use them.
// We can't use @types/audioworklet, because it conflicts with normal DOM types.
// https://github.com/microsoft/TypeScript/issues/28308
interface AudioWorkletProcessor {
    readonly port: MessagePort;
}

interface AudioWorkletProcessorImpl extends AudioWorkletProcessor {
    process(
        inputs: Float32Array[][],
        outputs: Float32Array[][],
        parameters: Record<string, Float32Array>
    ): boolean;
}

declare var AudioWorkletProcessor: {
    prototype: AudioWorkletProcessor;
    new (options?: AudioWorkletNodeOptions): AudioWorkletProcessor;
};

type AudioParamDescriptor = {
    name: string,
    automationRate: AutomationRate,
    minValue: number,
    maxValue: number,
    defaultValue: number
}

interface AudioWorkletProcessorConstructor {
    new (options?: AudioWorkletNodeOptions): AudioWorkletProcessorImpl;
    parameterDescriptors?: AudioParamDescriptor[];
}

declare function registerProcessor(
    name: string,
    processorCtor: AudioWorkletProcessorConstructor,
): void;
