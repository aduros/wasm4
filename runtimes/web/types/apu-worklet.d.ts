/// <reference types="audioworklet" />
declare const SAMPLE_RATE = 44100;
declare const MAX_VOLUME = 0.15;
declare const MAX_VOLUME_TRIANGLE = 0.25;
declare class Channel {
    /** Starting frequency. */
    freq1: number;
    /** Ending frequency, or zero for no frequency transition. */
    freq2: number;
    /** Time the tone was started. */
    startTime: number;
    /** Time at the end of the attack period. */
    attackTime: number;
    /** Time at the end of the decay period. */
    decayTime: number;
    /** Time at the end of the sustain period. */
    sustainTime: number;
    /** Time the tone should end. */
    releaseTime: number;
    /** Sustain volume level. */
    sustainVolume: number;
    /** Peak volume level at the end of the attack phase. */
    peakVolume: number;
    /** Used for time tracking. */
    phase: number;
    /** Duty cycle for pulse channels. */
    pulseDutyCycle: number;
    /** Noise generation state. */
    noiseSeed: number;
    /** The last generated random number, either -1 or 1. */
    noiseLastRandom: number;
}
declare function lerp(value1: number, value2: number, t: number): number;
declare function polyblep(phase: number, phaseInc: number): number;
declare class APUProcessor extends AudioWorkletProcessor {
    time: number;
    channels: Channel[];
    constructor();
    ramp(value1: number, value2: number, time1: number, time2: number): number;
    getCurrentFrequency(channel: Channel): number;
    getCurrentVolume(channel: Channel): number;
    tone(frequency: number, duration: number, volume: number, flags: number): void;
    process(inputs: any, [[output]]: number[][][], parameters: any): boolean;
}
