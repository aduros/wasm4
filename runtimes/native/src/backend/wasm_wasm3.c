#include <wasm3.h>
#include <m3_env.h>

#include "../wasm.h"
#include "../runtime.h"

static M3Environment* env;
static M3Runtime* runtime;
static M3Module* module;

static M3Function* start;
static M3Function* update;

static m3ApiRawFunction (blit) {
    m3ApiGetArgMem(const uint8_t*, sprite);
    m3ApiGetArg(int, x);
    m3ApiGetArg(int, y);
    m3ApiGetArg(int, width);
    m3ApiGetArg(int, height);
    m3ApiGetArg(int, flags);
    w4_runtimeBlit(sprite, x, y, width, height, flags);
    m3ApiSuccess();
}

static m3ApiRawFunction (blitSub) {
    m3ApiGetArgMem(const uint8_t*, sprite);
    m3ApiGetArg(int, x);
    m3ApiGetArg(int, y);
    m3ApiGetArg(int, width);
    m3ApiGetArg(int, height);
    m3ApiGetArg(int, srcX);
    m3ApiGetArg(int, srcY);
    m3ApiGetArg(int, stride);
    m3ApiGetArg(int, flags);
    w4_runtimeBlitSub(sprite, x, y, width, height, srcX, srcY, stride, flags);
    m3ApiSuccess();
}

static m3ApiRawFunction (line) {
    m3ApiGetArg(int, x1);
    m3ApiGetArg(int, y1);
    m3ApiGetArg(int, x2);
    m3ApiGetArg(int, y2);
    w4_runtimeLine(x1, y1, x2, y2);
    m3ApiSuccess();
}

static m3ApiRawFunction (hline) {
    m3ApiGetArg(int, x);
    m3ApiGetArg(int, y);
    m3ApiGetArg(int, len);
    w4_runtimeHLine(x, y, len);
    m3ApiSuccess();
}

static m3ApiRawFunction (vline) {
    m3ApiGetArg(int, x);
    m3ApiGetArg(int, y);
    m3ApiGetArg(int, len);
    w4_runtimeVLine(x, y, len);
    m3ApiSuccess();
}

static m3ApiRawFunction (oval) {
    m3ApiGetArg(int, x);
    m3ApiGetArg(int, y);
    m3ApiGetArg(int, width);
    m3ApiGetArg(int, height);
    w4_runtimeOval(x, y, width, height);
    m3ApiSuccess();
}

static m3ApiRawFunction (rect) {
    m3ApiGetArg(int, x);
    m3ApiGetArg(int, y);
    m3ApiGetArg(int, width);
    m3ApiGetArg(int, height);
    w4_runtimeRect(x, y, width, height);
    m3ApiSuccess();
}

static m3ApiRawFunction (text) {
    m3ApiGetArgMem(const char*, str);
    m3ApiGetArg(int, x);
    m3ApiGetArg(int, y);
    w4_runtimeText(str, x, y);
    m3ApiSuccess();
}

static m3ApiRawFunction (textUtf8) {
    m3ApiGetArgMem(const uint8_t*, str);
    m3ApiGetArg(int, byteLength);
    m3ApiGetArg(int, x);
    m3ApiGetArg(int, y);
    w4_runtimeTextUtf8(str, byteLength, x, y);
    m3ApiSuccess();
}

static m3ApiRawFunction (textUtf16) {
    m3ApiGetArgMem(const uint16_t*, str);
    m3ApiGetArg(int, byteLength);
    m3ApiGetArg(int, x);
    m3ApiGetArg(int, y);
    w4_runtimeTextUtf16(str, byteLength, x, y);
    m3ApiSuccess();
}

static m3ApiRawFunction (tone) {
    m3ApiGetArg(int, frequency);
    m3ApiGetArg(int, duration);
    m3ApiGetArg(int, volume);
    m3ApiGetArg(int, flags);
    w4_runtimeTone(frequency, duration, volume, flags);
    m3ApiSuccess();
}

static m3ApiRawFunction (diskr) {
    m3ApiReturnType(int);
    m3ApiGetArgMem(uint8_t*, dest);
    m3ApiGetArg(int, size);
    m3ApiReturn(w4_runtimeDiskr(dest, size));
}

static m3ApiRawFunction (diskw) {
    m3ApiReturnType(int);
    m3ApiGetArgMem(const uint8_t*, src);
    m3ApiGetArg(int, size);
    m3ApiReturn(w4_runtimeDiskw(src, size));
}

static m3ApiRawFunction (trace) {
    m3ApiGetArgMem(const char*, str);
    w4_runtimeTrace(str);
    m3ApiSuccess();
}

static m3ApiRawFunction (traceUtf8) {
    m3ApiGetArgMem(const uint8_t*, str);
    m3ApiGetArg(int, byteLength);
    w4_runtimeTraceUtf8(str, byteLength);
    m3ApiSuccess();
}

static m3ApiRawFunction (traceUtf16) {
    m3ApiGetArgMem(const uint16_t*, str);
    m3ApiGetArg(int, byteLength);
    w4_runtimeTraceUtf16(str, byteLength);
    m3ApiSuccess();
}

static m3ApiRawFunction (tracef) {
    m3ApiGetArgMem(const char*, str);
    m3ApiGetArgMem(const void*, stack);
    w4_runtimeTracef(str, stack);
    m3ApiSuccess();
}

static void check (M3Result result) {
    if (result != m3Err_none) {
        M3ErrorInfo info;
        m3_GetErrorInfo(runtime, &info);
        fprintf(stderr, "WASM error: %s (%s)\n", result, info.message);
        exit(1);
    }
}

uint8_t* w4_wasmInit () {
    env = m3_NewEnvironment();

    // This is an arbitrary limit corresponding to the implementation details
    // of the wasm3 interpreter. It's unrelated to the resource constraints of
    // the wasm4 VM. Making this too small will ultimately result in `[trap]
    // stack overflow` at the command line.
    //
    // Using 64 KB, since this is the default of wasm3 standalone binary on
    // desktop platforms (from wasm3/platforms/app/main.c).
    uint32_t wasm3StackSize = 64 * 1024;

    runtime = m3_NewRuntime(env, wasm3StackSize, NULL);

    runtime->memory.maxPages = 1;
    ResizeMemory(runtime, 1);

    return m3_GetMemory(runtime, NULL, 0);
}

void w4_wasmDestroy () {
    m3_FreeRuntime(runtime);
    m3_FreeEnvironment(env);
}

void w4_wasmLoadModule (const uint8_t* wasmBuffer, int byteLength) {
    check(m3_ParseModule(env, &module, wasmBuffer, byteLength));

    // wasm3 will reallocate a new memory if the module doesn't import a memory. We set this to
    // prevent that from happening: https://github.com/aduros/wasm4/issues/292
    module->memoryImported = true;

    check(m3_LoadModule(runtime, module));

    m3_LinkRawFunction(module, "env", "blit", "v(iiiiii)", blit);
    m3_LinkRawFunction(module, "env", "blitSub", "v(iiiiiiiii)", blitSub);
    m3_LinkRawFunction(module, "env", "line", "v(iiii)", line);
    m3_LinkRawFunction(module, "env", "hline", "v(iii)", hline);
    m3_LinkRawFunction(module, "env", "vline", "v(iii)", vline);
    m3_LinkRawFunction(module, "env", "oval", "v(iiii)", oval);
    m3_LinkRawFunction(module, "env", "rect", "v(iiii)", rect);
    m3_LinkRawFunction(module, "env", "text", "v(iii)", text);
    m3_LinkRawFunction(module, "env", "textUtf8", "v(iiii)", textUtf8);
    m3_LinkRawFunction(module, "env", "textUtf16", "v(iiii)", textUtf16);

    m3_LinkRawFunction(module, "env", "tone", "v(iiii)", tone);

    m3_LinkRawFunction(module, "env", "diskr", "i(ii)", diskr);
    m3_LinkRawFunction(module, "env", "diskw", "i(ii)", diskw);

    m3_LinkRawFunction(module, "env", "trace", "v(i)", trace);
    m3_LinkRawFunction(module, "env", "traceUtf8", "v(ii)", traceUtf8);
    m3_LinkRawFunction(module, "env", "traceUtf16", "v(ii)", traceUtf16);
    m3_LinkRawFunction(module, "env", "tracef", "v(ii)", tracef);

#ifndef NDEBUG
    M3ErrorInfo error;
    m3_GetErrorInfo(runtime, &error);
    if (error.result) {
        fprintf(stderr, "Error in load: %s: %s\n", error.result, error.message);
    }
#endif

    m3_FindFunction(&start, runtime, "start");
    m3_FindFunction(&update, runtime, "update");

    // First call wasm built-in start
    check(m3_RunStart(module));

    // Call WASI start functions
    M3Function* func;
    m3_FindFunction(&func, runtime, "_start");
    if (func) {
        check(m3_CallV(func));
    }
    m3_FindFunction(&func, runtime, "_initialize");
    if (func) {
        check(m3_CallV(func));
    }
}

void w4_wasmCallStart () {
    if (start) {
        check(m3_CallV(start));
    }
}

void w4_wasmCallUpdate () {
    if (update) {
        check(m3_CallV(update));
    }
}
