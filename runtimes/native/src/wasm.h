#pragma once

#include <stdint.h>

uint8_t* w4_wasmInit ();
void w4_wasmDestroy ();

void w4_wasmLoadModule (const uint8_t* wasmBuffer, int byteLength);

void w4_wasmCallStart ();
void w4_wasmCallUpdate ();
