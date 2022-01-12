#include <stdio.h>
#include <stdlib.h>

#include <cubeb/cubeb.h>

#include "../apu.h"
#include "../runtime.h"
#include "../wasm.h"
#include "../window.h"

#if defined(_WIN32)
#include <windows.h>
#endif

typedef struct {
    // Should be the 4 byte ASCII string "CART" (1414676803)
    uint32_t magic;

    // Window title
    char title[128];

    // Length of the cart.wasm bytes used to offset backwards from the footer
    uint32_t cartLength;
} FileFooter;

static long audioDataCallback (cubeb_stream* stream, void* userData,
    const void* inputBuffer, void* outputBuffer, long frames)
{
    w4_apuWriteSamples((int16_t*)outputBuffer, frames);
    return frames;
}

static void audioStateCallback (cubeb_stream* stream, void* userData, cubeb_state state) {
}

static void audioInit () {
    cubeb* ctx;

#if defined(_WIN32)
    // This initialziation is required for cubeb on windows
    // It's safe to ignore the return value of this, as there's no real failure mode
    CoInitializeEx(NULL, COINIT_MULTITHREADED | COINIT_DISABLE_OLE1DDE);
#endif
    if (cubeb_init(&ctx, "WASM-4", NULL)) {
        fprintf(stderr, "Could not init audio\n");
        return;
    }

    cubeb_stream_params params;
    params.format = CUBEB_SAMPLE_S16NE;
    params.rate = 44100;
    params.channels = 2;
    params.layout = CUBEB_LAYOUT_UNDEFINED;
    params.prefs = CUBEB_STREAM_PREF_NONE;

    uint32_t latency;
    if (cubeb_get_min_latency(ctx, &params, &latency)) {
        fprintf(stderr, "Could not get minimum latency\n");
        return;
    }

    cubeb_stream* stream;
    if (cubeb_stream_init(ctx, &stream, "WASM-4", NULL, NULL, NULL, &params,
            latency, audioDataCallback, audioStateCallback, NULL)) {
        fprintf(stderr, "Could not open the stream\n");
        return;
    }

    if (cubeb_stream_start(stream)) {
        fprintf(stderr, "Could not start the stream\n");
        return;
    }
}

static void audioUninit () {
#if defined(_WIN32)
    CoUninitialize();
#endif
}

int main (int argc, const char* argv[]) {
    uint8_t* cartBytes;
    size_t cartLength;
    const char* title = "WASM-4";

    if (argc < 2) {
        FILE* file = fopen(argv[0], "rb");
        fseek(file, -sizeof(FileFooter), SEEK_END);

        FileFooter footer;
        if (fread(&footer, 1, sizeof(FileFooter), file) < sizeof(FileFooter) || footer.magic != 1414676803) {
            // No bundled cart found
            fprintf(stderr, "Usage: wasm4 <cart>\n");
            return 1;
        }

        // Make sure the title is null terminated
        footer.title[sizeof(footer.title)-1] = '\0';
        title = footer.title;

        cartBytes = malloc(footer.cartLength);
        fseek(file, -sizeof(FileFooter) - footer.cartLength, SEEK_END);
        cartLength = fread(cartBytes, 1, footer.cartLength, file);
        fclose(file);

    } else {
        FILE* file = fopen(argv[1], "rb");
        if (file == NULL) {
            fprintf(stderr, "Error opening %s\n", argv[1]);
            return 1;
        }

        fseek(file, 0, SEEK_END);
        cartLength = ftell(file);
        fseek(file, 0, SEEK_SET);

        cartBytes = malloc(cartLength);
        cartLength = fread(cartBytes, 1, cartLength, file);
        fclose(file);
    }

    audioInit();

    uint8_t* memory = w4_wasmInit();
    w4_runtimeInit(memory, NULL);

    w4_wasmLoadModule(cartBytes, cartLength);

    w4_windowBoot(title);

    audioUninit();
}
