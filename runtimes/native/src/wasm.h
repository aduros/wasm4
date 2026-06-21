#pragma once

#include <stdint.h>

uint8_t* w4_wasmInit ();
void w4_wasmDestroy ();
uint8_t* w4_wasmGetMemory ();


void w4_wasmLoadModule (const uint8_t* wasmBuffer, int byteLength);

// Same as w4_wasmLoadModule but returns 0 on success, -1 on error (does not exit)
int w4_wasmLoadModuleSafe (const uint8_t* wasmBuffer, int byteLength);

void w4_wasmCallStart ();
void w4_wasmCallUpdate ();


// Returns true (once) if a store-loaded cart crashed
bool w4_wasmDidCrash(void);

// Mark that next load is from store (errors won't exit)
void w4_wasmSetStoreLoaded(bool value);
