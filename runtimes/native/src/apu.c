#include "apu.h"

#include <stdlib.h>
#include <math.h>

#define SAMPLE_RATE 44100
#define MAX_VOLUME 0x1333 // ~15% of INT16_MAX
// The triangle channel sounds a bit quieter than the others, so give it higher amplitude
#define MAX_VOLUME_TRIANGLE 0x2000 // ~25% of INT16_MAX
// The small fade-out time channels use to reduce audio popping.
#define FADE_OUT_TIME (SAMPLE_RATE / 200)

typedef struct {
    // Tone Parameters
    /** Length of the attack section. */
    unsigned long long attackLength;

    /** Length of the decay section. */
    unsigned long long decayLength;

    /** Length of the sustain section. */
    unsigned long long sustainLength;

    /** Length of the release section. */
    unsigned long long releaseLength;

    /** Starting frequency. */
    float startFrequency;

    /** Ending frequency. */
    float endFrequency;

    /** Volume level during the sustain section. */
    int16_t sustainVolume;

    /** Volume level at the end of the attack section and start of the decay section. */
    int16_t attackVolume;

    /** Tone panning. 0 = center, 1 = only left, 2 = only right. */
    uint8_t pan;


    // ADSR section change ticks
    /** The tick the Decay section of the envelope should start on. */
    unsigned long long startDecayTick;

    /** The tick the Sustain section of the envelope should start on. */
    unsigned long long startSustainTick;

    /** The tick the Release section of the envelope should start on. */
    unsigned long long startReleaseTick;

    /** The first tick for which the tone should no longer play, after the release period. */
    unsigned long long endTick;


    // Parameters of the current ADSR section
    /** The time the current section of the ADSR envelope started. */
    unsigned long long sectionStartTime;

    /** The time the current section of the ADSR envelope would end if it was the perfect length. */
    unsigned long long sectionEndTimeTarget;

    /** The frequency at the start of the current section. */
    float sectionStartFrequency;

    /** The frequency at the end of the current section. */
    float sectionEndFrequency;

    /** The volume at the start of the current section. */
    int16_t sectionStartVolume;

    /** The volume at the end of the current section. */
    int16_t sectionEndVolume;

    /** The first tick for which this section is no longer playing. */
    unsigned long long sectionEndTick;


    // State
    /** True if this channel is currently playing. */
    bool playing;

    /** Position in the cycle, from 0 to 1. */
    float phase;

    union {
        struct {
            /** Duty cycle for pulse channels. */
            float dutyCycle;
        } pulse;

        struct {
            /** Noise generation state. */
            uint16_t seed;

            /** The last generated random number, either -1 or 1. */
            int16_t lastRandom;
        } noise;
    };

    /** The time remaining until the fade out period ends. */
    unsigned long long fadeOutTime;
} Channel;

static Channel channels[4] = { 0 };

/** The current time in samples and ticks respectively. */
static unsigned long long time = 0;
static unsigned long long ticks = 0;

static int w4_min (int a, int b) {
    return a < b ? a : b;
}

static int lerp (int value1, int value2, float t) {
    return value1 + t * (value2 - value1);
}
static float lerpf (float value1, float value2, float t) {
    return value1 + t * (value2 - value1);
}

static int ramp (int value1, int value2, unsigned long long time1, unsigned long long time2) {
    if (value1 == value2) return value1;
    if (time >= time2) return value2;
    float t = (float)(time - time1) / (time2 - time1);
    return lerp(value1, value2, t);
}
static float rampf (float value1, float value2, unsigned long long time1, unsigned long long time2) {
    if (value1 == value2) return value1;
    if (time >= time2) return value2;
    float t = (float)(time - time1) / (time2 - time1);
    return lerpf(value1, value2, t);
}

static float getCurrentFrequency (const Channel* channel) {
    return rampf(channel->sectionStartFrequency, channel->sectionEndFrequency, channel->sectionStartTime, channel->sectionEndTimeTarget);
}

static int16_t getCurrentVolume (const Channel* channel) {
    return ramp(channel->sectionStartVolume, channel->sectionEndVolume, channel->sectionStartTime, channel->sectionEndTimeTarget);
}

static float polyblep (float phase, float phaseInc) {
    if (phase < phaseInc) {
        float t = phase / phaseInc;
        return t+t - t*t;
    } else if (phase > 1.f - phaseInc) {
        float t = (phase - (1.f - phaseInc)) / phaseInc;
        return 1.f - (t+t - t*t);
    } else {
        return 1.f;
    }
}

static float midiFreq (uint8_t note, uint8_t bend) {
    return powf(2.0f, ((float)note - 69.0f + (float)bend / 256.0f) / 12.0f) * 440.0f;
}

void w4_apuInit () {
    channels[3].noise.seed = 0x0001;
}

void w4_apuTone (int frequency, int duration, int volume, int flags) {
    int freq1 = frequency & 0xffff;
    int freq2 = (frequency >> 16) & 0xffff;

    int sustain = duration & 0xff;
    int release = (duration >> 8) & 0xff;
    int decay = (duration >> 16) & 0xff;
    int attack = (duration >> 24) & 0xff;

    int sustainVolume = w4_min(volume & 0xff, 100);
    int attackVolume = w4_min((volume >> 8) & 0xff, 100);

    int channelIdx = flags & 0x03;
    int mode = (flags >> 2) & 0x3;
    int pan = (flags >> 4) & 0x3;
    int noteMode = flags & 0x40;

    // TODO(2022-01-08): Thread safety
    Channel* channel = &channels[channelIdx];

    // Restart the phase if the channel isn't already playing, but be
    // careful to keep the phase if the channel is already playing to allow
    // for continuous tones and smooth transitions to or from a glide etc.
    if (ticks > channel->endTick) {
        channel->phase = (channelIdx == 2) ? 0.25 : 0;
    }
    if (noteMode) {
        channel->startFrequency = midiFreq(freq1 & 0xff, freq1 >> 8);
        channel->endFrequency = (freq2 == 0) ? channel->startFrequency : midiFreq(freq2 & 0xff, freq2 >> 8);
    } else {
        channel->startFrequency = freq1;
        channel->endFrequency = (freq2 == 0) ? channel->startFrequency : freq2;
    }

    channel->attackLength = attack;
    channel->decayLength = decay;
    channel->sustainLength = sustain;
    channel->releaseLength = release;

    channel->startDecayTick = ticks + attack;
    channel->startSustainTick = channel->startDecayTick + decay;
    channel->startReleaseTick = channel->startSustainTick + sustain;
    channel->endTick = channel->startReleaseTick + release;

    // If a tone is already playing, make it end now.
    channel->sectionEndTick = ticks;
    channel->fadeOutTime = 0;
    // And start the channel playing if it wasn't already.
    channel->playing = true;

    channel->pan = pan;

    int16_t maxVolume = (channelIdx == 2) ? MAX_VOLUME_TRIANGLE : MAX_VOLUME;
    // Note: this is integer arithmetic and gets evaluated left to right.
    // int16_t gets promoted to int in expressions, so there shouldn't be any overflow issues.
    channel->sustainVolume = maxVolume*sustainVolume/100;
    channel->attackVolume = attackVolume ? maxVolume*attackVolume/100 : maxVolume;

    if (channelIdx == 0 || channelIdx == 1) {
        switch (mode) {
        case 0:
            channel->pulse.dutyCycle = 0.125f;
            break;
        case 1:
            channel->pulse.dutyCycle = 0.25f;
            break;
        case 2:
            channel->pulse.dutyCycle = 0.5f;
            break;
        case 3:
            channel->pulse.dutyCycle = 0.75f;
            break;
        }
    }
}

void w4_apuTick (MaybeToneCall toneCalls[4]) {
    ticks++;

    // Enact the stored calls to tone()
    for (int i=0; i<4; i++) {
        MaybeToneCall* toneCall = &toneCalls[i];
        if (toneCall->active) {
            w4_apuTone(toneCall->frequency, toneCall->duration, toneCall->volume, toneCall->flags);
            toneCall->active = false;
        }
    }

    // Update currently playing tones
    for (int channelIdx = 0; channelIdx < 4; ++channelIdx) {
        Channel* channel = &channels[channelIdx];
        if (channel->playing && ticks >= channel->sectionEndTick && channel->fadeOutTime == 0) {
            // sectionStart is the start of the section, in ticks since the start of the tone.
            int sectionStart;
            int sectionLength;
            if (ticks >= channel->endTick) {
                // Tone is fading out
                channel->fadeOutTime = FADE_OUT_TIME;
                return;
            } else if (ticks >= channel->startReleaseTick) {
                // Release section
                sectionStart = channel->attackLength + channel->decayLength + channel->sustainLength;
                sectionLength = channel->releaseLength;
                channel->sectionStartVolume = channel->sustainVolume;
                channel->sectionEndVolume = 0;
            } else if (ticks >= channel->startSustainTick) {
                // Sustain section
                sectionStart = channel->attackLength + channel->decayLength;
                sectionLength = channel->sustainLength;
                channel->sectionStartVolume = channel->sustainVolume;
                channel->sectionEndVolume = channel->sustainVolume;
            } else if (ticks >= channel->startDecayTick) {
                // Decay Section
                sectionStart = channel->attackLength;
                sectionLength = channel->decayLength;
                channel->sectionStartVolume = channel->attackVolume;
                channel->sectionEndVolume = channel->sustainVolume;
            } else {
                // Attack Section
                sectionStart = 0;
                sectionLength = channel->attackLength;
                channel->sectionStartVolume = 0;
                channel->sectionEndVolume = channel->attackVolume;
            }
            // The end of the section, in ticks since the start of the tone.
            int sectionEnd = sectionStart + sectionLength;

            int totalLength = channel->attackLength + channel->decayLength + channel->sustainLength + channel->releaseLength;
            channel->sectionStartFrequency = lerpf(channel->startFrequency, channel->endFrequency, (float)sectionStart/totalLength);
            channel->sectionEndFrequency = lerpf(channel->startFrequency, channel->endFrequency, (float)sectionEnd/totalLength);

            channel->sectionStartTime = time;
            channel->sectionEndTimeTarget = channel->sectionStartTime + SAMPLE_RATE*sectionLength/60;

            channel->sectionEndTick = ticks + sectionLength;
        }
    }

}

void w4_apuWriteSamples (int16_t* output, unsigned long frames) {
    for (int ii = 0; ii < frames; ++ii, ++time) {
        int16_t mix_left = 0, mix_right = 0;

        for (int channelIdx = 0; channelIdx < 4; ++channelIdx) {
            Channel* channel = &channels[channelIdx];

            if (channel->playing) {
                float freq = getCurrentFrequency(channel);
                int16_t volume = getCurrentVolume(channel);
                int16_t sample;

                if (channelIdx == 3) {
                    // Noise channel
                    channel->phase += freq * freq / (1000000.f/44100 * SAMPLE_RATE);
                    while (channel->phase > 0) {
                        channel->phase--;
                        channel->noise.seed ^= channel->noise.seed >> 7;
                        channel->noise.seed ^= channel->noise.seed << 9;
                        channel->noise.seed ^= channel->noise.seed >> 13;
                        channel->noise.lastRandom = 2 * (channel->noise.seed & 0x1) - 1;
                    }
                    sample = volume * channel->noise.lastRandom;

                } else {
                    float phasePerSample = freq / SAMPLE_RATE;
                    channel->phase += phasePerSample;

                    if (channel->phase >= 1) {
                        channel->phase--;
                    }

                    if (channelIdx == 2) {
                        // Triangle channel
                        sample = volume * (2*fabs(2*channel->phase - 1) - 1);

                    } else {
                        // Pulse channel
                        float fractionOfPulseWidth, fractionOfPulseWidthPerSample;
                        int16_t multiplier;

                        // Map duty to 0->1
                        if (channel->phase < channel->pulse.dutyCycle) {
                            fractionOfPulseWidth = channel->phase / channel->pulse.dutyCycle;
                            fractionOfPulseWidthPerSample = phasePerSample / channel->pulse.dutyCycle;
                            multiplier = volume;
                        } else {
                            fractionOfPulseWidth = (channel->phase - channel->pulse.dutyCycle) / (1.f - channel->pulse.dutyCycle);
                            fractionOfPulseWidthPerSample = phasePerSample / (1.f - channel->pulse.dutyCycle);
                            multiplier = -volume;
                        }
                        sample = multiplier * polyblep(fractionOfPulseWidth, fractionOfPulseWidthPerSample);
                    }
                }

                if (channel->fadeOutTime > 0) {
                    int16_t orig = sample;
                    sample = sample * (signed long long)channel->fadeOutTime / FADE_OUT_TIME;
                    --channel->fadeOutTime;
                    if (channel->fadeOutTime == 0) {
                        channel->playing = false;
                    }
                }

                if (channel->pan != 1) {
                    mix_right += sample;
                }
                if (channel->pan != 2) {
                    mix_left += sample;
                }
            }
        }

        *output++ = mix_left;
        *output++ = mix_right;
    }
}
