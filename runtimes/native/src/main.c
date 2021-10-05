#include <stdio.h>

#include "runtime.h"
#include "window.h"
#include "wasm.h"

int main (int argc, const char* argv[]) {
    if (argc < 2) {
        fprintf(stderr, "Usage: wasm4 <cart>\n");
        return 1;
    }

    uint8_t* memory = w4_wasmInit();

    w4_runtimeInit(memory);

    FILE* fp = fopen(argv[1], "r");
    char wasmBuffer[1 << 16];
    size_t size = fread(wasmBuffer, 1, sizeof(wasmBuffer), fp);
    fclose(fp);

    w4_wasmLoadModule(wasmBuffer, size);
    w4_wasmCallStart();
    w4_wasmCallUpdate();

    w4_windowBoot("WASM-4");
}
