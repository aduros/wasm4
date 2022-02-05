const SAMPLE_RATE = 44100;
const MAX_VOLUME = 0.15;
const MAX_VOLUME_TRIANGLE = 0.25;

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

    /** Time at the end of the sustain period. */
    sustainTime = 0;

    /** Time the tone should end. */
    releaseTime = 0;

    /** Sustain volume level. */
    sustainVolume = 0;

    /** Peak volume level at the end of the attack phase. */
    peakVolume = 0;

    /** Used for time tracking. */
    phase = 0;

    /** Duty cycle for pulse channels. */
    pulseDutyCycle = 0;

    /** Noise generation state. */
    noiseSeed = 0x0001;

    /** The last generated random number, either -1 or 1. */
    noiseLastRandom = 0;
}

function lerp (value1, value2, t) {
    return value1 + t * (value2 - value1);
}

function polyblep (phase, phaseInc) {
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

class APUProcessor extends AudioWorkletProcessor {
    constructor () {
        super();

        this.time = 0;
        this.channels = new Array(4);
        for (let ii = 0; ii < 4; ++ii) {
            this.channels[ii] = new Channel();
        }

        if (this.port != null) {
            this.port.onmessage = event => {
                this.tone(...event.data);
            };
        }
    }

    ramp (value1, value2, time1, time2) {
        const t = (this.time - time1) / (time2 - time1);
        return lerp(value1, value2, t);
    }

    getCurrentFrequency (channel) {
        if (channel.freq2 > 0) {
            return this.ramp(channel.freq1, channel.freq2, channel.startTime, channel.releaseTime);
        } else {
            return channel.freq1;
        }
    }

    getCurrentVolume (channel) {
        const time = this.time;
        if (time >= channel.sustainTime) {
            return this.ramp(channel.sustainVolume, 0, channel.sustainTime, channel.releaseTime);
        } else if (time >= channel.decayTime) {
            return channel.sustainVolume;
        } else if (time >= channel.attackTime) {
            return this.ramp(channel.peakVolume, channel.sustainVolume, channel.attackTime, channel.decayTime);
        } else if (channel.startTime != channel.attackTime) {
            return this.ramp(0, channel.peakVolume, channel.startTime, channel.attackTime);
        } else {
            return channel.sustainVolume;
        }
    }

    tone (frequency, duration, volume, flags) {
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

        const channel = this.channels[channelIdx];

        // Restart the phase if this channel wasn't already playing
        if (this.time > channel.releaseTime) {
            channel.phase = (channelIdx == 2) ? 0.25 : 0;
        }

        channel.freq1 = freq1;
        channel.freq2 = freq2;
        channel.startTime = this.time;
        channel.attackTime = channel.startTime + ((SAMPLE_RATE*attack/60) >>> 0);
        channel.decayTime = channel.attackTime + ((SAMPLE_RATE*decay/60) >>> 0);
        channel.sustainTime = channel.decayTime + ((SAMPLE_RATE*sustain/60) >>> 0);
        channel.releaseTime = channel.sustainTime + ((SAMPLE_RATE*release/60) >>> 0);

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
            // For the triangle channel, prevent popping on hard stops by adding a 1 ms release
            if (release == 0) {
                channel.releaseTime += (SAMPLE_RATE/1000) >>> 0;
            }
        }
    }

    process (inputs, [[ output ]], parameters) {
        for (let ii = 0, frames = output.length; ii < frames; ++ii, ++this.time) {
            let sum = 0;

            for (let channelIdx = 0; channelIdx < 4; ++channelIdx) {
                const channel = this.channels[channelIdx];

                if (this.time < channel.releaseTime) {
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

                    sum += sample;
                }
            }

            output[ii] = sum;
        }

        return true;
    }
}

registerProcessor("wasm4-apu", APUProcessor);
