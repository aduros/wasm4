#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include <cubeb/cubeb.h>

#include "../apu.h"
#include "../runtime.h"
#include "../store.h"
#include "../wasm.h"
#include "../window.h"
#include "../util.h"

#if defined(_WIN32)
#include <windows.h>
#endif

#define DISK_FILE_EXT ".disk"

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

static void loadDiskFile (w4_Disk* disk, const char *diskPath) {
    FILE *file = fopen(diskPath, "rb");
    if (file) {
        fseek(file, 0, SEEK_END);
        uint16_t saveSz = ftell(file);
        fseek(file, 0, SEEK_SET);
        if (saveSz > sizeof(disk->data)) {
            saveSz = sizeof(disk->data);
        }
        disk->size = fread(disk->data, 1, saveSz, file);
        fclose(file);
    }
}

static void saveDiskFile (const w4_Disk* disk, const char *diskPath) {
    if (disk->size) {
        FILE* file = fopen(diskPath, "wb");
        fwrite(disk->data, 1, disk->size, file);
        fclose(file);
    } else {
        remove(diskPath);
    }
}

static void trimFileExtension (char *path) {
    size_t len = strlen(path);
    while (len--) {
        if (path[len] == '.') {
            path[len] = 0; // Set null terminator
            return;
        } else if (path[len] == '/' || path[len] == '\\') {
            return;
        }
    }
}

int main (int argc, const char* argv[]) {
    uint8_t* cartBytes;
    size_t cartLength;
    w4_Disk disk = {0};
    const char* title = "WASM-4";
    char* diskPath = NULL;

    if (argc < 2) {
        // Try bundled cart first
        FILE* file = fopen(argv[0], "rb");
        if (file != NULL) {
            fseek(file, -sizeof(FileFooter), SEEK_END);
            FileFooter footer;
            if (fread(&footer, 1, sizeof(FileFooter), file) >= sizeof(FileFooter) && footer.magic == 1414676803) {
                footer.title[sizeof(footer.title)-1] = '\0';
                title = footer.title;
                cartBytes = xmalloc(footer.cartLength);
                fseek(file, -sizeof(FileFooter) - footer.cartLength, SEEK_END);
                cartLength = fread(cartBytes, 1, footer.cartLength, file);
                fclose(file);
                diskPath = xmalloc(strlen(argv[0]) + sizeof(DISK_FILE_EXT));
                strcpy(diskPath, argv[0]);
#ifdef _WIN32
                trimFileExtension(diskPath);
#endif
                strcat(diskPath, DISK_FILE_EXT);
                loadDiskFile(&disk, diskPath);
                goto load_cart;
            }
            fclose(file);
        }

        // No bundled cart — launch store with minimal dummy cart
        {
            // Minimal WASM module: imports env.memory, exports empty start+update
            static const uint8_t dummyCart[] = {
                0x00,0x61,0x73,0x6d,0x01,0x00,0x00,0x00,0x01,0x04,0x01,0x60,0x00,0x00,0x02,0x0f,
                0x01,0x03,0x65,0x6e,0x76,0x06,0x6d,0x65,0x6d,0x6f,0x72,0x79,0x02,0x00,0x01,0x03,
                0x03,0x02,0x00,0x00,0x07,0x12,0x02,0x05,0x73,0x74,0x61,0x72,0x74,0x00,0x00,0x06,
                0x75,0x70,0x64,0x61,0x74,0x65,0x00,0x01,0x0a,0x07,0x02,0x02,0x00,0x0b,0x02,0x00,
                0x0b
            };
            audioInit();
            w4_storeInit();
            cartBytes = xmalloc(sizeof(dummyCart));
            memcpy(cartBytes, dummyCart, sizeof(dummyCart));
            cartLength = sizeof(dummyCart);

            uint8_t* memory = w4_wasmInit();
            w4_runtimeInit(memory, &disk);
            w4_wasmLoadModule(cartBytes, cartLength);
            w4_storeOpen();
            w4_windowSetStoreMode(true);
            w4_windowBoot(title);
            audioUninit();
            return 0;
        }

    } else if (!strcmp(argv[1], "-") || !strcmp(argv[1], "/dev/stdin")) {
        size_t bufsize = 1024;
        cartBytes = xmalloc(bufsize);
        cartLength = 0;
        int c;

        while((c = getc(stdin)) != EOF) {
            cartBytes[cartLength++] = c;
            if(cartLength == bufsize) {
                if (cartLength >= 64 * 1024) {
                    fprintf(stderr, "Error, overflown cartridge size limit of 64 KB\n");
                    return 1;
                }

                bufsize *= 2;
                cartBytes = xrealloc(cartBytes, bufsize);

                if(!cartBytes) {
                    fprintf(stderr, "Error reallocating cartridge buffer\n");
                    return 1;
                }
            }
        }
    }
    else {
        FILE* file = fopen(argv[1], "rb");
        if (file == NULL) {
            fprintf(stderr, "Error opening %s\n", argv[1]);
            return 1;
        }

        fseek(file, 0, SEEK_END);
        cartLength = ftell(file);
        fseek(file, 0, SEEK_SET);

        cartBytes = xmalloc(cartLength);
        cartLength = fread(cartBytes, 1, cartLength, file);
        fclose(file);

        // Look for disk file
        diskPath = xmalloc(strlen(argv[1]) + sizeof(DISK_FILE_EXT));
        strcpy(diskPath, argv[1]);
        trimFileExtension(diskPath); // Trim .wasm
        strcat(diskPath, DISK_FILE_EXT);
        loadDiskFile(&disk, diskPath);
    }

load_cart:
    audioInit();
    w4_storeInit();

    uint8_t* memory = w4_wasmInit();
    w4_runtimeInit(memory, &disk);

    w4_wasmLoadModule(cartBytes, cartLength);

    w4_windowBoot(title);

    audioUninit();

    saveDiskFile(&disk, diskPath);
}
