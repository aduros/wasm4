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

    /** Duty cycle for pulse channels. */
    float dutyCycle;
} Channel;

static Channel channels[4] = { };

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

    switch (mode) {
    case 0:
        channel->dutyCycle = 0.125f;
        break;
    default: // case 1: case 3:
        channel->dutyCycle = 0.25f;
        break;
    case 2:
        channel->dutyCycle = 0.5f;
        break;
    }
}

void w4_apuWriteSamples (int16_t* output, unsigned long frames) {
    for (int ii = 0; ii < frames; ++ii, ++time) {
        int16_t mixed = 0;

        for (int channelIdx = 0; channelIdx < 4; ++channelIdx) {
            Channel* channel = &channels[channelIdx];

            if (time < channel->releaseTime) {
                uint16_t freq = getCurrentFrequency(channel);
                int16_t volume = getCurrentVolume(channel);

                channel->phase += (float)freq / SAMPLE_RATE;
                if (channel->phase > 1) {
                    channel->phase -= 1;
                }

                int16_t sample;
                switch (channelIdx) {
                default:
                    // Pulse channel
                    sample = channel->phase < channel->dutyCycle ? volume : -volume;
                    break;

                case 2:
                    // Triangle channel
                    if (channel->phase < 0.25) {
                        sample = lerp(0, volume, 4*channel->phase);
                    } else if (channel->phase < 0.75) {
                        sample = lerp(volume, -volume, 2*channel->phase - 0.5);
                    } else {
                        sample = lerp(-volume, 0, 4*channel->phase - 3);
                    }
                    break;

                case 3:
                    // Noise channel
                    // TODO(2022-01-08): Make frequency have an effect on noise pitch
                    // TODO(2022-01-08): Use LFSR instead of rand()
                    sample = volume * (float)rand() / RAND_MAX;
                    break;
                }

                mixed += sample;
            }
        }

        *output++ = mixed;
        *output++ = mixed;
    }
}
