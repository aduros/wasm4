const SAMPLE_RATE = 44100;
const MAX_VOLUME = 0.25;
const BUFFER_SIZE = 512; // Might need to bump this to 1024

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
    volume = 0;

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

export class APU {
    constructor () {
        this.time = 0;
        this.channels = new Array(4);
        for (let ii = 0; ii < 4; ++ii) {
            this.channels[ii] = new Channel();
        }

        const ctx = new (window.AudioContext || window.webkitAudioContext)({
            sampleRate: SAMPLE_RATE,
        });
        this.ctx = ctx;

        const scriptNode = ctx.createScriptProcessor(BUFFER_SIZE, 0, 1);
        scriptNode.addEventListener("audioprocess", event => {
            const output = event.outputBuffer.getChannelData(0);

            for (let ii = 0; ii < BUFFER_SIZE; ++ii, ++this.time) {
                let sum = 0;

                for (let channelIdx = 0; channelIdx < 4; ++channelIdx) {
                    const channel = this.channels[channelIdx];
                    if (this.time < channel.releaseTime) {
                        const freq = this.getCurrentFrequency(channel);
                        const volume = this.getCurrentVolume(channel);
                        let sample;

                        if (channelIdx == 3) {
                            // Noise channel
                            channel.phase += freq * freq / 1000000;
                            while (channel.phase > 0) {
                                channel.phase--;
                                const bit0 = channel.noiseSeed & 1;
                                channel.noiseSeed >>= 1;
                                const bit1 = channel.noiseSeed & 1;
                                const feedback = (bit0 ^ bit1);
                                channel.noiseSeed |= feedback << 14;
                                channel.noiseLastRandom = (feedback << 1) - 1;
                            }
                            sample = volume * channel.noiseLastRandom;

                        } else {
                            channel.phase += freq / SAMPLE_RATE;
                            if (channel.phase > 1) {
                                channel.phase--;
                            }

                            if (channelIdx == 2) {
                                // Triangle channel
                                // if (channel.phase < 0.5) {
                                //     sample = lerp(-volume, volume, 2*channel.phase);
                                // } else {
                                //     sample = lerp(volume, -volume, 2*channel.phase - 1);
                                // }
                                // TODO(2022-01-16): Fix popping
                                if (channel.phase < 0.25) {
                                    sample = lerp(0, volume, 4*channel.phase);
                                } else if (channel.phase < 0.75) {
                                    sample = lerp(volume, -volume, 2*channel.phase - 0.5);
                                } else {
                                    sample = lerp(-volume, 0, 4*channel.phase - 3);
                                }

                            } else {
                                // Pulse channel
                                sample = channel.phase < channel.pulseDutyCycle ? volume : -volume;
                            }
                        }

                        sum += sample;
                    }
                }

                output[ii] = sum;
            }
        });
        scriptNode.connect(ctx.destination);
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
        if (time > channel.sustainTime) {
            return this.ramp(channel.volume, 0, channel.sustainTime, channel.releaseTime);
        } else if (time > channel.decayTime) {
            return channel.volume;
        } else if (time > channel.attackTime) {
            return this.ramp(MAX_VOLUME, channel.volume, channel.attackTime, channel.decayTime);
        } else {
            return this.ramp(0, MAX_VOLUME, channel.startTime, channel.attackTime);
        }
    }

    tone (frequency, duration, volume, flags) {
        const freq1 = frequency & 0xffff;
        const freq2 = (frequency >> 16) & 0xffff;

        const sustain = (duration & 0xff);
        const release = ((duration >> 8) & 0xff);
        const decay = ((duration >> 16) & 0xff);
        const attack = ((duration >> 24) & 0xff);

        const channelIdx = flags & 0x3;
        const mode = (flags >> 2) & 0x3;

        const channel = this.channels[channelIdx];
        channel.freq1 = freq1;
        channel.freq2 = freq2;
        channel.startTime = this.time;
        channel.attackTime = channel.startTime + ((SAMPLE_RATE*attack/60) >>> 0);
        channel.decayTime = channel.attackTime + ((SAMPLE_RATE*decay/60) >>> 0);
        channel.sustainTime = channel.decayTime + ((SAMPLE_RATE*sustain/60) >>> 0);
        channel.releaseTime = channel.sustainTime + ((SAMPLE_RATE*release/60) >>> 0);
        channel.volume = MAX_VOLUME * volume/100;

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
        }
    }
}
