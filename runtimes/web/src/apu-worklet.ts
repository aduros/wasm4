"use strict";

// Audio worklet file: do not export anything directly.
const SAMPLE_RATE = 44100;
const MAX_VOLUME = 0.15;
// The triangle channel sounds a bit quieter than the others, so give it higher amplitude
const MAX_VOLUME_TRIANGLE = 0.25;
// The small fade-out time channels use to reduce audio popping.
const FADE_OUT_TIME = Math.floor(SAMPLE_RATE / 200);
class Channel {

    // Tone Parameters
    /** Length of the attack section. */
    attackLength = 0;

    /** Length of the decay section. */
    decayLength = 0;

    /** Length of the sustain section. */
    sustainLength = 0;

    /** Length of the release section. */
    releaseLength = 0;

    /** Starting frequency. */
    startFrequency = 0;

    /** Ending frequency. */
    endFrequency = 0;

    /** Volume level during the sustain section. */
    sustainVolume = 0;

    /** Volume level at the end of the attack section and start of the decay section. */
    attackVolume = 0;

    /** Tone panning. 0 = center, 1 = only left, 2 = only right. */
    pan = 0;


    // ADSR section change ticks
    /** The tick the Decay section of the envelope should start on. */
    startDecayTick = 0;

    /** The tick the Sustain section of the envelope should start on. */
    startSustainTick = 0;

    /** The tick the Release section of the envelope should start on. */
    startReleaseTick = 0;

    /** The first tick for which the tone should no longer play, after the release period. */
    endTick = 0;


    // Parameters of the current ADSR section
    /** The time the current section of the ADSR envelope started. */
    sectionStartTime = 0;

    /** The time the current section of the ADSR envelope would end if it was the perfect length. */
    sectionEndTimeTarget = 0;

    /** The frequency at the start of the current section. */
    sectionStartFrequency = 0;

    /** The frequency at the end of the current section. */
    sectionEndFrequency = 0;

    /** The volume at the start of the current section. */
    sectionStartVolume = 0;

    /** The volume at the end of the current section. */
    sectionEndVolume = 0;

    /** The first tick for which this section is no longer playing. */
    sectionEndTick = 0;


    // State
    /** True if this channel is currently playing. */
    playing = false;

    /** Position in the cycle, from 0 to 1. */
    phase = 0;

    /** Duty cycle for pulse channels. */
    pulseDutyCycle = 0;

    /** Noise generation state. */
    noiseSeed = 0x0001;

    /** The last generated random number, either -1 or 1. */
    noiseLastRandom = 0;

    /** The time remaining until the fade out period ends. */
    fadeOutTime = 0;
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
            this.port.onmessage = (event: MessageEvent<BufferedToneCalls>) => {
                this.tick(event.data);
            };
        }
    }

    ramp (value1: number, value2: number, time1: number, time2: number) {
        if (value1 == value2) return value1;
        if (this.time >= time2) return value2;
        const t = (this.time - time1) / (time2 - time1);
        return lerp(value1, value2, t);
    }

    getCurrentFrequency (channel: Channel) {
        return this.ramp(channel.sectionStartFrequency, channel.sectionEndFrequency, channel.sectionStartTime, channel.sectionEndTimeTarget);
    }

    getCurrentVolume (channel: Channel) {
        return this.ramp(channel.sectionStartVolume, channel.sectionEndVolume, channel.sectionStartTime, channel.sectionEndTimeTarget);
    }

    tick (bufferedToneCalls: BufferedToneCalls) {
        this.ticks++;

        // Enact any stored calls to tone()
        for (let maybeToneCall of bufferedToneCalls) {
            if (maybeToneCall !== null) {
                this.tone(...maybeToneCall);
            }
        }

        // Update currently playing tones
        for (let channel of this.channels) {
            if (channel.playing && this.ticks >= channel.sectionEndTick && channel.fadeOutTime == 0) {
                // sectionStart is the start of the section, in ticks since the start of the tone.
                let sectionStart;
                let sectionLength;
                if (this.ticks >= channel.endTick) {
                    // Tone is ending and should fade out
                    channel.fadeOutTime = FADE_OUT_TIME;
                    return;
                } else if (this.ticks >= channel.startReleaseTick) {
                    // Release section
                    sectionStart = channel.attackLength + channel.decayLength + channel.sustainLength;
                    sectionLength = channel.releaseLength;
                    channel.sectionStartVolume = channel.sustainVolume;
                    channel.sectionEndVolume = 0;
                } else if (this.ticks >= channel.startSustainTick) {
                    // Sustain section
                    sectionStart = channel.attackLength + channel.decayLength;
                    sectionLength = channel.sustainLength;
                    channel.sectionStartVolume = channel.sustainVolume;
                    channel.sectionEndVolume = channel.sustainVolume;
                } else if (this.ticks >= channel.startDecayTick) {
                    // Decay Section
                    sectionStart = channel.attackLength;
                    sectionLength = channel.decayLength;
                    channel.sectionStartVolume = channel.attackVolume;
                    channel.sectionEndVolume = channel.sustainVolume;
                } else {
                    // Attack Section
                    sectionStart = 0;
                    sectionLength = channel.attackLength;
                    channel.sectionStartVolume = 0;
                    channel.sectionEndVolume = channel.attackVolume;
                }
                // The end of the section, in ticks since the start of the tone.
                let sectionEnd = sectionStart + sectionLength;

                let totalLength = channel.attackLength + channel.decayLength + channel.sustainLength + channel.releaseLength;
                channel.sectionStartFrequency = lerp(channel.startFrequency, channel.endFrequency, sectionStart/totalLength);
                channel.sectionEndFrequency = lerp(channel.startFrequency, channel.endFrequency, sectionEnd/totalLength);

                channel.sectionStartTime = this.time;
                channel.sectionEndTimeTarget = channel.sectionStartTime + ((SAMPLE_RATE*sectionLength/60) >>> 0);

                channel.sectionEndTick = this.ticks + sectionLength;
            }
        }
    }

    tone (frequency: number, duration: number, volume: number, flags: number) {
        const freq1 = frequency & 0xffff;
        const freq2 = (frequency >> 16) & 0xffff;
        const sustain = (duration & 0xff);
        const release = ((duration >> 8) & 0xff);
        const decay = ((duration >> 16) & 0xff);
        const attack = ((duration >> 24) & 0xff);

        const sustainVolume = Math.min(volume & 0xff, 100);
        const attackVolume = Math.min((volume >> 8) & 0xff, 100);

        const channelIdx = flags & 0x3;
        const mode = (flags >> 2) & 0x3;
        const pan = (flags >> 4) & 0x3;
        const noteMode = Boolean(flags & 0x40);

        const channel = this.channels[channelIdx];

        // Restart the phase if the channel isn't already playing, but be
        // careful to keep the phase if the channel is already playing to allow
        // for continuous tones and smooth transitions to or from a glide etc.
        if (this.ticks > channel.endTick) {
            channel.phase = (channelIdx == 2) ? 0.25 : 0;
        }
        if (noteMode) {
            channel.startFrequency = midiFreq(freq1 & 0xff, freq1 >> 8);
            channel.endFrequency = (freq2 == 0) ? channel.startFrequency : midiFreq(freq2 & 0xff, freq2 >> 8);
        } else {
            channel.startFrequency = freq1;
            channel.endFrequency = (freq2 == 0) ? channel.startFrequency : freq2;
        }

        channel.attackLength = attack;
        channel.decayLength = decay;
        channel.sustainLength = sustain;
        channel.releaseLength = release;

        channel.startDecayTick = this.ticks + attack;
        channel.startSustainTick = channel.startDecayTick + decay;
        channel.startReleaseTick = channel.startSustainTick + sustain;
        channel.endTick = channel.startReleaseTick + release;

        // If a tone is already playing, make it end now.
        channel.sectionEndTick = this.ticks;
        channel.fadeOutTime = 0;
        // And start the channel playing if it wasn't already.
        channel.playing = true;

        channel.pan = pan;

        const maxVolume = (channelIdx == 2) ? MAX_VOLUME_TRIANGLE : MAX_VOLUME;
        channel.sustainVolume = maxVolume * sustainVolume/100;
        channel.attackVolume = attackVolume ? maxVolume * attackVolume/100 : maxVolume;

        if (channelIdx == 0 || channelIdx == 1) {
            switch (mode) {
            case 0:
                channel.pulseDutyCycle = 0.125;
                break;
            case 1:
                channel.pulseDutyCycle = 0.25;
                break;
            case 2:
                channel.pulseDutyCycle = 0.5;
                break;
            case 3:
                channel.pulseDutyCycle = 0.75;
            }
        }
    }

    process (_inputs: Float32Array[][] | null, [[ outputLeft, outputRight ]]: Float32Array[][], _parameters: Record<string, Float32Array> | null) {
        for (let ii = 0, frames = outputLeft.length; ii < frames; ++ii, ++this.time) {
            let mixLeft = 0, mixRight = 0;

            for (let channelIdx = 0; channelIdx < 4; ++channelIdx) {
                const channel = this.channels[channelIdx];

                if (channel.playing) {
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
                        const phasePerSample = freq / SAMPLE_RATE;
                        let phase = channel.phase + phasePerSample;

                        if (phase >= 1) {
                            phase--;
                        }
                        channel.phase = phase;

                        if (channelIdx == 2) {
                            // Triangle channel
                            sample = volume * (2*Math.abs(2*channel.phase - 1) - 1);

                        } else {
                            // Pulse channel
                            let fractionOfPulseWidth, fractionOfPulseWidthPerSample, multiplier;

                            // Map duty to 0->1
                            const phaseWhenDutyCycleEdge = channel.pulseDutyCycle;
                            if (phase < phaseWhenDutyCycleEdge) {
                                fractionOfPulseWidth = phase / phaseWhenDutyCycleEdge;
                                fractionOfPulseWidthPerSample = phasePerSample / phaseWhenDutyCycleEdge;
                                multiplier = volume;
                            } else {
                                fractionOfPulseWidth = (phase - phaseWhenDutyCycleEdge) / (1 - phaseWhenDutyCycleEdge);
                                fractionOfPulseWidthPerSample = phasePerSample / (1 - phaseWhenDutyCycleEdge);
                                multiplier = -volume;
                            }
                            sample = multiplier * polyblep(fractionOfPulseWidth, fractionOfPulseWidthPerSample);
                        }
                    }

                    if (channel.fadeOutTime > 0) {
                        sample *= channel.fadeOutTime / FADE_OUT_TIME;
                        --channel.fadeOutTime;
                        if (channel.fadeOutTime == 0) {
                            channel.playing = false;
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
