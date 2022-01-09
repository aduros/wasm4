#pragma once

#include <stdint.h>
#include <stddef.h>

void w4_apuInit ();

void w4_apuTone (int frequency, int duration, int volume, int flags);

void w4_apuWriteSamples (int16_t* output, unsigned long frames);
