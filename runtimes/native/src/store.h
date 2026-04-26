#pragma once

#include <stdbool.h>
#include <stdint.h>

// Initialize the store (call once at startup)
void w4_storeInit(void);

// Open/close the store overlay
void w4_storeOpen(void);
void w4_storeClose(void);

// Returns true if the store overlay is currently visible
bool w4_storeIsOpen(void);

// Process gamepad input for the store UI
// Returns true if store consumed the input (game should not process it)
void w4_storeInput(uint8_t gamepad);

// Render the store overlay to a framebuffer
// palette/framebuffer are used for rendering via w4_windowComposite
void w4_storeRender(uint32_t* palette, uint8_t* framebuffer);

// If a cart was selected for download, returns the wasm bytes and length
// Caller must free the returned buffer. Returns NULL if no cart ready.
uint8_t* w4_storeGetSelectedCart(int* outLength);

// Wait for download thread to finish
void w4_storeJoinThread(void);
