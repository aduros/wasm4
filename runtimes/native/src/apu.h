#pragma once

#include <stdint.h>
#include <stddef.h>
#include <stdbool.h>

typedef struct {
    bool active;
    int frequency;
    int duration;
    int volume;
    int flags;
} MaybeToneCall;

void w4_apuInit ();

void w4_apuTick (MaybeToneCall toneCalls[4]);

void w4_apuWriteSamples (int16_t* output, unsigned long frames);
