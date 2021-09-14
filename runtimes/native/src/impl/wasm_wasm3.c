#include <wasm3.h>
#include <m3_env.h>

#include "../wasm.h"
#include "../runtime.h"

static M3Environment* env;
static M3Runtime* runtime;
static M3Module* module;

static M3Function* start;
static M3Function* update;

static m3ApiRawFunction (text) {
    m3ApiGetArgMem(const char*, str);
    m3ApiGetArg(int, x);
    m3ApiGetArg(int, y);
    w4_runtimeText(str, x, y);
    m3ApiSuccess();
}

static m3ApiRawFunction (blit) {
    printf("Called blit\n");
    m3ApiSuccess();
}

uint8_t* w4_wasmInit () {
    env = m3_NewEnvironment();
    runtime = m3_NewRuntime(env, 1024, NULL);

    runtime->memory.maxPages = 1;
    ResizeMemory(runtime, 1);

    return m3_GetMemory(runtime, NULL, 0);
}

void w4_wasmLoadModule (const uint8_t* wasmBuffer, int byteLength) {
    m3_ParseModule(env, &module, wasmBuffer, byteLength);
    m3_LoadModule(runtime, module);

    m3_LinkRawFunction(module, "env", "blit", "v(iiiiii)", blit);
    m3_LinkRawFunction(module, "env", "text", "v(iii)", text);

    m3_FindFunction(&start, runtime, "start");
    m3_FindFunction(&update, runtime, "update");
}

void w4_wasmCallStart () {
    if (start) {
        m3_CallV(start);
    }
}

void w4_wasmCallUpdate () {
    if (update) {
        m3_CallV(update);
    }
}
