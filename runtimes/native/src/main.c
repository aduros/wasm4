#include <stdio.h>
#include <stdlib.h>

#include "runtime.h"
#include "window.h"
#include "wasm.h"

typedef struct {
    // Should be the 4 byte ASCII string "CART" (1414676803)
    uint32_t magic;

    // Window title
    char title[128];

    // Length of the cart.wasm bytes used to offset backwards from the footer
    uint32_t cartLength;
} FileFooter;

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

    uint8_t* memory = w4_wasmInit();
    w4_runtimeInit(memory);

    w4_wasmLoadModule(cartBytes, cartLength);

    w4_wasmCallStart();

    w4_windowBoot(title);
}
