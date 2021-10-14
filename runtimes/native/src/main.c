#include <stdio.h>
#include <stdlib.h>

#include "runtime.h"
#include "window.h"
#include "wasm.h"

int main (int argc, const char* argv[]) {
    if (argc < 2) {
        fprintf(stderr, "Usage: wasm4 <cart>\n");
        return 1;
    }

    FILE* file = fopen(argv[1], "rb");
    if (file == NULL) {
        fprintf(stderr, "Error opening %s\n", argv[1]);
        return 1;
    }

    fseek(file, 0, SEEK_END);
    size_t size = ftell(file);
    fseek(file, 0, SEEK_SET);
    char* wasmBuffer = malloc(size);
    size = fread(wasmBuffer, 1, size, file);
    fclose(file);

    uint8_t* memory = w4_wasmInit();

    w4_runtimeInit(memory);
    w4_wasmLoadModule(wasmBuffer, size);

    w4_wasmCallStart();
    w4_wasmCallUpdate();

    w4_windowBoot("WASM-4");
}
