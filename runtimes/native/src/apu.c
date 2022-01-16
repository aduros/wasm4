#include "apu.h"

#include <stdlib.h>

#define SAMPLE_RATE 44100
#define MAX_VOLUME 0x2000 // 25% of INT16_MAX

typedef struct {
    /** Starting frequency. */
    uint16_t freq1;

    /** Ending frequency, or zero for no frequency transition. */
    uint16_t freq2;

    /** Time the tone was started. */
    unsigned long long startTime;

    /** Time at the end of the attack period. */
    unsigned long long attackTime;

    /** Time at the end of the decay period. */
    unsigned long long decayTime;

    /** Time at the end of the sustain period. */
    unsigned long long sustainTime;

    /** Time the tone should end. */
    unsigned long long releaseTime;

    /** Sustain volume level. */
    int16_t volume;

    /** Used for time tracking. */
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
} Channel;

static Channel channels[4] = { 0 };

/** The current time, in samples. */
static unsigned long long time = 0;

static int lerp (int value1, int value2, float t) {
    return value1 + t * (value2 - value1);
}

static int ramp (int value1, int value2, unsigned long long time1, unsigned long long time2) {
    float t = (float)(time - time1) / (time2 - time1);
    return lerp(value1, value2, t);
}

static uint16_t getCurrentFrequency (const Channel* channel) {
    if (channel->freq2 > 0) {
        return ramp(channel->freq1, channel->freq2, channel->startTime, channel->releaseTime);
    } else {
        return channel->freq1;
    }
}

static int16_t getCurrentVolume (const Channel* channel) {
    if (time > channel->sustainTime) {
        return ramp(channel->volume, 0, channel->sustainTime, channel->releaseTime);
    } else if (time > channel->decayTime) {
        return channel->volume;
    } else if (time > channel->attackTime) {
        return ramp(MAX_VOLUME, channel->volume, channel->attackTime, channel->decayTime);
    } else {
        return ramp(0, MAX_VOLUME, channel->startTime, channel->attackTime);
    }
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

    int channelIdx = flags & 0x03;
    int mode = (flags >> 2) & 0x3;

    // TODO(2022-01-08): Thread safety
    Channel* channel = &channels[channelIdx];
    channel->freq1 = freq1;
    channel->freq2 = freq2;
    channel->startTime = time;
    channel->attackTime = channel->startTime + SAMPLE_RATE*attack/60;
    channel->decayTime = channel->attackTime + SAMPLE_RATE*decay/60;
    channel->sustainTime = channel->decayTime + SAMPLE_RATE*sustain/60;
    channel->releaseTime = channel->sustainTime + SAMPLE_RATE*release/60;
    channel->volume = MAX_VOLUME * volume/100;

    if (channelIdx == 0 || channelIdx == 1) {
        switch (mode) {
        case 0:
            channel->pulse.dutyCycle = 0.125f;
            break;
        case 1: case 3: default:
            channel->pulse.dutyCycle = 0.25f;
            break;
        case 2:
            channel->pulse.dutyCycle = 0.5f;
            break;
        }
    }
}

void w4_apuWriteSamples (int16_t* output, unsigned long frames) {
    for (int ii = 0; ii < frames; ++ii, ++time) {
        int16_t sum = 0;

        for (int channelIdx = 0; channelIdx < 4; ++channelIdx) {
            Channel* channel = &channels[channelIdx];

            if (time < channel->releaseTime) {
                uint16_t freq = getCurrentFrequency(channel);
                int16_t volume = getCurrentVolume(channel);
                int16_t sample;

                if (channelIdx == 3) {
                    // Noise channel
                    channel->phase += freq * freq / 1000000.f;
                    while (channel->phase > 0) {
                        channel->phase--;
                        const int bit0 = channel->noise.seed & 1;
                        channel->noise.seed >>= 1;
                        const int bit1 = channel->noise.seed & 1;
                        const int feedback = (bit0 ^ bit1);
                        channel->noise.seed |= feedback << 14;
                        channel->noise.lastRandom = 2 * feedback - 1;
                    }
                    sample = volume * channel->noise.lastRandom;

                } else {
                    channel->phase += (float)freq / SAMPLE_RATE;
                    if (channel->phase > 1) {
                        channel->phase--;
                    }

                    if (channelIdx == 2) {
                        // Triangle channel
                        if (channel->phase < 0.25) {
                            sample = lerp(0, volume, 4*channel->phase);
                        } else if (channel->phase < 0.75) {
                            sample = lerp(volume, -volume, 2*channel->phase - 0.5);
                        } else {
                            sample = lerp(-volume, 0, 4*channel->phase - 3);
                        }

                    } else {
                        // Pulse channel
                        sample = channel->phase < channel->pulse.dutyCycle ? volume : -volume;
                    }
                }

                sum += sample;
            }
        }

        *output++ = sum;
        *output++ = sum;
    }
}
