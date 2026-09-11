"use strict";

// Audio worklet file: do not export anything directly.
const SAMPLE_RATE = 44100;
const MAX_VOLUME = 0.15;
// The triangle channel sounds a bit quieter than the others, so give it higher amplitude
const MAX_VOLUME_TRIANGLE = 0.25;
// Also for the triangle channel, prevent popping on hard stops by adding a 1 ms release
const RELEASE_TIME_TRIANGLE = Math.floor(SAMPLE_RATE / 1000);

class Channel {
    /** Starting frequency. */
    freq1 = 0;

    /** Ending frequency, or zero for no frequency transition. */
    freq2 = 0;

    /** Time the tone was started. */
    startTime = 0;

    /** Time at the end of the attack period. */
    attackTime = 0;

    /** Time at the end of the decay period. */
    decayTime = 0;

    /** Time at the end of the sustain period, with adjustments due to tick-sample drift. */
    sustainTime = 0;

    /** Time at the end of the release period, with adjustments due to tick-sample drift. */
    releaseTime = 0;

    /** Time at the end of the release period, without adjustments due to tick-sample drift. */
    estReleaseTime = 0;

    /** Tick at the end of the sustain period where the tone switches over to release. */
    sustainTick = 0;

    /** Sustain volume level. */
    sustainVolume = 0;

    /** Peak volume level at the end of the attack phase. */
    peakVolume = 0;

    /** Used for time tracking. */
    phase = 0;

    /** Tone panning. 0 = center, 1 = only left, 2 = only right. */
    pan = 0;

    /** Duty cycle for pulse channels. */
    pulseDutyCycle = 0;

    /** Noise generation state. */
    noiseSeed = 0x0001;

    /** The last generated random number, either -1 or 1. */
    noiseLastRandom = 0;
}

function lerp (value1: number, value2: number, t: number) {
    return value1 + t * (value2 - value1);
}

function polyblep (phase: number, phaseInc: number) {
    if (phase < phaseInc) {
        const t = phase / phaseInc;
        return t+t - t*t;
    } else if (phase > 1 - phaseInc) {
        const t = (phase - (1 - phaseInc)) / phaseInc;
        return 1 - (t+t - t*t);
    } else {
        return 1;
    }
}

function midiFreq (note: number, bend: number) {
    return Math.pow(2, (note - 69 + bend / 256) / 12) * 440;
}

class APUProcessor extends AudioWorkletProcessor {
    time: number;
    ticks: number;
    channels: Channel[];

    constructor () {
        super();

        this.time = 0;
        this.ticks = 0;
        this.channels = new Array(4);
        for (let ii = 0; ii < 4; ++ii) {
            this.channels[ii] = new Channel();
        }

        if (this.port != null) {
            this.port.onmessage = (event: MessageEvent<'tick' | [number, number, number, number]>) => {
                if (event.data === 'tick') {
                    this.tick();
                } else {
                    this.tone(...event.data);
                }
            };
        }
    }

    ramp (value1: number, value2: number, time1: number, time2: number) {
        if (this.time >= time2) return value2;
        const t = (this.time - time1) / (time2 - time1);
        return lerp(value1, value2, t);
    }

    getCurrentFrequency (channel: Channel) {
        if (channel.freq2 > 0) {
            return this.ramp(channel.freq1, channel.freq2, channel.startTime, channel.estReleaseTime);
        } else {
            return channel.freq1;
        }
    }

    getCurrentVolume (channel: Channel) {
        const time = this.time;
        if (this.ticks > channel.sustainTick) {
            // Release
            return this.ramp(channel.sustainVolume, 0, channel.sustainTime, channel.releaseTime);
        } else if (time >= channel.decayTime) {
            // Sustain
            return channel.sustainVolume;
        } else if (time >= channel.attackTime) {
            // Decay
            return this.ramp(channel.peakVolume, channel.sustainVolume, channel.attackTime, channel.decayTime);
        } else {
            // Attack
            return this.ramp(0, channel.peakVolume, channel.startTime, channel.attackTime);
        }
    }

    tick () {
        // Update releaseTime for channels that should begin their release period this tick.
        // This fixes drift drift between ticks and samples.
        for (let channelIdx = 0; channelIdx < 4; ++channelIdx) {
            const channel = this.channels[channelIdx];
            if (this.ticks == channel.sustainTick) {
                const delta = this.time - channel.sustainTime;
                channel.sustainTime = this.time;
                channel.releaseTime += delta;
            }
        }

        this.ticks++;
    }

    tone (frequency: number, duration: number, volume: number, flags: number) {
        const freq1 = frequency & 0xffff;
        const freq2 = (frequency >> 16) & 0xffff;
        const sustain = (duration & 0xff);
        const release = ((duration >> 8) & 0xff);
        const decay = ((duration >> 16) & 0xff);
        const attack = ((duration >> 24) & 0xff);

        const sustainVolume = Math.min(volume & 0xff, 100);
        const peakVolume = Math.min((volume >> 8) & 0xff, 100);

        const channelIdx = flags & 0x3;
        const mode = (flags >> 2) & 0x3;
        const pan = (flags >> 4) & 0x3;
        const noteMode = flags & 0x40;

        const channel = this.channels[channelIdx];

        // Restart the phase if this channel wasn't already playing
        if (this.time > channel.releaseTime && this.ticks > channel.sustainTick) {
            channel.phase = (channelIdx == 2) ? 0.25 : 0;
        }
        if (noteMode) {
            channel.freq1 = midiFreq(freq1 & 0xff, freq1 >> 8);
            channel.freq2 = (freq2 == 0) ? 0 : midiFreq(freq2 & 0xff, freq2 >> 8);
        } else {
            channel.freq1 = freq1;
            channel.freq2 = freq2;
        }
        channel.startTime = this.time;
        channel.attackTime = channel.startTime + ((SAMPLE_RATE*attack/60) >>> 0);
        channel.decayTime = channel.attackTime + ((SAMPLE_RATE*decay/60) >>> 0);
        channel.sustainTime = channel.decayTime + ((SAMPLE_RATE*sustain/60) >>> 0);
        channel.estReleaseTime = channel.sustainTime + ((SAMPLE_RATE*release/60) >>> 0);
        channel.sustainTick = this.ticks + attack + decay + sustain;
        channel.pan = pan;

        const maxVolume = (channelIdx == 2) ? MAX_VOLUME_TRIANGLE : MAX_VOLUME;
        channel.sustainVolume = maxVolume * sustainVolume/100;
        channel.peakVolume = peakVolume ? maxVolume * peakVolume/100 : maxVolume;

        if (channelIdx == 0 || channelIdx == 1) {
            switch (mode) {
            case 0:
                channel.pulseDutyCycle = 0.125;
                break;
            case 1: case 3: default:
                channel.pulseDutyCycle = 0.25;
                break;
            case 2:
                channel.pulseDutyCycle = 0.5;
                break;
            }

        } else if (channelIdx == 2) {
            if (release == 0) {
                channel.estReleaseTime += RELEASE_TIME_TRIANGLE;
            }
        }

        channel.releaseTime = channel.estReleaseTime;
    }

    process (_inputs: Float32Array[][] | null, [[ outputLeft, outputRight ]]: Float32Array[][], _parameters: Record<string, Float32Array> | null) {
        for (let ii = 0, frames = outputLeft.length; ii < frames; ++ii, ++this.time) {
            let mixLeft = 0, mixRight = 0;

            for (let channelIdx = 0; channelIdx < 4; ++channelIdx) {
                const channel = this.channels[channelIdx];

                if (this.time < channel.releaseTime || this.ticks <= channel.sustainTick) {
                    const freq = this.getCurrentFrequency(channel);
                    const volume = this.getCurrentVolume(channel);
                    let sample;

                    if (channelIdx == 3) {
                        // Noise channel
                        channel.phase += freq * freq / (1000000/44100 * SAMPLE_RATE);
                        while (channel.phase > 0) {
                            channel.phase--;
                            let noiseSeed = channel.noiseSeed;
                            noiseSeed ^= noiseSeed >> 7;
                            noiseSeed ^= noiseSeed << 9;
                            noiseSeed ^= noiseSeed >> 13;
                            channel.noiseSeed = noiseSeed;
                            channel.noiseLastRandom = ((noiseSeed & 0x1) << 1) - 1;
                        }
                        sample = volume * channel.noiseLastRandom;

                    } else {
                        const phaseInc = freq / SAMPLE_RATE;
                        let phase = channel.phase + phaseInc;

                        if (phase >= 1) {
                            phase--;
                        }
                        channel.phase = phase;

                        if (channelIdx == 2) {
                            // Triangle channel
                            sample = volume * (2*Math.abs(2*channel.phase - 1) - 1);

                        } else {
                            // Pulse channel
                            let dutyPhase, dutyPhaseInc, multiplier;

                            // Map duty to 0->1
                            const pulseDutyCycle = channel.pulseDutyCycle;
                            if (phase < pulseDutyCycle) {
                                dutyPhase = phase / pulseDutyCycle;
                                dutyPhaseInc = phaseInc / pulseDutyCycle;
                                multiplier = volume;
                            } else {
                                dutyPhase = (phase - pulseDutyCycle) / (1 - pulseDutyCycle);
                                dutyPhaseInc = phaseInc / (1 - pulseDutyCycle);
                                multiplier = -volume;
                            }
                            sample = multiplier * polyblep(dutyPhase, dutyPhaseInc);
                        }
                    }

                    if (channel.pan != 1) {
                        mixRight += sample;
                    }
                    if (channel.pan != 2) {
                        mixLeft += sample;
                    }
                }
            }

            outputLeft[ii] = mixLeft;
            outputRight[ii] = mixRight;
        }

        return true;
    }
}

registerProcessor("wasm4-apu", APUProcessor);
