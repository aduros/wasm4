#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <wasm.h>

#include "../wasm.h"
#include "../runtime.h"

static wasm_engine_t* engine;
static wasm_store_t* store;
static wasm_memory_t* memory;
static wasm_module_t* module;
static wasm_instance_t* instance;

static wasm_func_t* start = NULL;
static wasm_func_t* update = NULL;

static void* getMemoryPointer (wasm_val_t* val) {
    byte_t* data = wasm_memory_data(memory);
    int32_t offset = val->of.i32;
    return (offset < 0 || offset >= (1 << 16)) ? NULL : (void*)(data + offset);
}

static wasm_trap_t* blit (const wasm_val_vec_t* args, wasm_val_vec_t* results) {
    const uint8_t* sprite = getMemoryPointer(&args->data[0]);
    int32_t x = args->data[1].of.i32;
    int32_t y = args->data[2].of.i32;
    int32_t width = args->data[3].of.i32;
    int32_t height = args->data[4].of.i32;
    int32_t flags = args->data[5].of.i32;
    w4_runtimeBlit(sprite, x, y, width, height, flags);
    return NULL;
}

static wasm_trap_t* blitSub (const wasm_val_vec_t* args, wasm_val_vec_t* results) {
    const uint8_t* sprite = getMemoryPointer(&args->data[0]);
    int32_t x = args->data[1].of.i32;
    int32_t y = args->data[2].of.i32;
    int32_t width = args->data[3].of.i32;
    int32_t height = args->data[4].of.i32;
    int32_t srcX = args->data[5].of.i32;
    int32_t srcY = args->data[6].of.i32;
    int32_t stride = args->data[7].of.i32;
    int32_t flags = args->data[8].of.i32;
    w4_runtimeBlitSub(sprite, x, y, width, height, srcX, srcY, stride, flags);
    return NULL;
}

static wasm_trap_t* line (const wasm_val_vec_t* args, wasm_val_vec_t* results) {
    int32_t x1 = args->data[0].of.i32;
    int32_t y1 = args->data[1].of.i32;
    int32_t x2 = args->data[2].of.i32;
    int32_t y2 = args->data[3].of.i32;
    w4_runtimeLine(x1, y1, x2, y2);
    return NULL;
}

static wasm_trap_t* hline (const wasm_val_vec_t* args, wasm_val_vec_t* results) {
    int32_t x = args->data[0].of.i32;
    int32_t y = args->data[1].of.i32;
    int32_t len = args->data[2].of.i32;
    w4_runtimeHLine(x, y, len);
    return NULL;
}

static wasm_trap_t* vline (const wasm_val_vec_t* args, wasm_val_vec_t* results) {
    int32_t x = args->data[0].of.i32;
    int32_t y = args->data[1].of.i32;
    int32_t len = args->data[2].of.i32;
    w4_runtimeVLine(x, y, len);
    return NULL;
}

static wasm_trap_t* oval (const wasm_val_vec_t* args, wasm_val_vec_t* results) {
    int32_t x = args->data[0].of.i32;
    int32_t y = args->data[1].of.i32;
    int32_t width = args->data[2].of.i32;
    int32_t height = args->data[3].of.i32;
    w4_runtimeOval(x, y, width, height);
    return NULL;
}

static wasm_trap_t* rect (const wasm_val_vec_t* args, wasm_val_vec_t* results) {
    int32_t x = args->data[0].of.i32;
    int32_t y = args->data[1].of.i32;
    int32_t width = args->data[2].of.i32;
    int32_t height = args->data[3].of.i32;
    w4_runtimeRect(x, y, width, height);
    return NULL;
}

static wasm_trap_t* text (const wasm_val_vec_t* args, wasm_val_vec_t* results) {
    const char* str = getMemoryPointer(&args->data[0]);
    int32_t x = args->data[1].of.i32;
    int32_t y = args->data[2].of.i32;
    w4_runtimeText(str, x, y);
    return NULL;
}

static wasm_trap_t* textUtf8 (const wasm_val_vec_t* args, wasm_val_vec_t* results) {
    const uint8_t* str = getMemoryPointer(&args->data[0]);
    int32_t byteLength = args->data[1].of.i32;
    int32_t x = args->data[2].of.i32;
    int32_t y = args->data[3].of.i32;
    w4_runtimeTextUtf8(str, byteLength, x, y);
    return NULL;
}

static wasm_trap_t* textUtf16 (const wasm_val_vec_t* args, wasm_val_vec_t* results) {
    const uint16_t* str = getMemoryPointer(&args->data[0]);
    int32_t byteLength = args->data[1].of.i32;
    int32_t x = args->data[2].of.i32;
    int32_t y = args->data[3].of.i32;
    w4_runtimeTextUtf16(str, byteLength, x, y);
    return NULL;
}

static wasm_trap_t* tone (const wasm_val_vec_t* args, wasm_val_vec_t* results) {
    int32_t frequency = args->data[0].of.i32;
    int32_t duration = args->data[1].of.i32;
    int32_t volume = args->data[2].of.i32;
    int32_t flags = args->data[3].of.i32;
    w4_runtimeTone(frequency, duration, volume, flags);
    return NULL;
}

static wasm_trap_t* diskr (const wasm_val_vec_t* args, wasm_val_vec_t* results) {
    uint8_t* dest = getMemoryPointer(&args->data[0]);
    int32_t size = args->data[1].of.i32;
    wasm_val_t* result = &results->data[0];
    result->kind = WASM_I32;
    result->of.i32 = w4_runtimeDiskr(dest, size);
    return NULL;
}

static wasm_trap_t* diskw (const wasm_val_vec_t* args, wasm_val_vec_t* results) {
    const uint8_t* src = getMemoryPointer(&args->data[0]);
    int32_t size = args->data[1].of.i32;
    wasm_val_t* result = &results->data[0];
    result->kind = WASM_I32;
    result->of.i32 = w4_runtimeDiskw(src, size);
    return NULL;
}

static wasm_trap_t* trace (const wasm_val_vec_t* args, wasm_val_vec_t* results) {
    const char* str = getMemoryPointer(&args->data[0]);
    w4_runtimeTrace(str);
    return NULL;
}

static wasm_trap_t* traceUtf8 (const wasm_val_vec_t* args, wasm_val_vec_t* results) {
    const uint8_t* str = getMemoryPointer(&args->data[0]);
    int32_t byteLength = args->data[1].of.i32;
    w4_runtimeTraceUtf8(str, byteLength);
    return NULL;
}

static wasm_trap_t* traceUtf16 (const wasm_val_vec_t* args, wasm_val_vec_t* results) {
    const uint16_t* str = getMemoryPointer(&args->data[0]);
    int32_t byteLength = args->data[1].of.i32;
    w4_runtimeTraceUtf16(str, byteLength);
    return NULL;
}

static wasm_trap_t* tracef (const wasm_val_vec_t* args, wasm_val_vec_t* results) {
    const char* str = getMemoryPointer(&args->data[0]);
    const void* stack = getMemoryPointer(&args->data[1]);
    w4_runtimeTracef(str, stack);
    return NULL;
}

uint8_t* w4_wasmInit () {
    engine = wasm_engine_new();
    store = wasm_store_new(engine);

    wasm_limits_t limits = { .max = 1, .min = 1 };
    wasm_memorytype_t* memorytype = wasm_memorytype_new(&limits);
    memory = wasm_memory_new(store, memorytype);

    byte_t* data = wasm_memory_data(memory);
    memset(data, 0, 1 << 16);
    return (uint8_t*)data;
}

void w4_wasmDestroy () {
    wasm_instance_delete(instance);
    wasm_module_delete(module);
    wasm_store_delete(store);
    wasm_engine_delete(engine);
}

static wasm_functype_t* createFuncType (int params, int results) {
    wasm_valtype_t* ps[12];
    for (int ii = 0; ii < params; ++ii) {
        ps[ii] = wasm_valtype_new_i32();
    }
    wasm_valtype_vec_t pv;
    wasm_valtype_vec_new(&pv, params, ps);

    wasm_valtype_t* rs[12];
    for (int ii = 0; ii < results; ++ii) {
        rs[ii] = wasm_valtype_new_i32();
    }
    wasm_valtype_vec_t rv;
    wasm_valtype_vec_new(&rv, results, rs);

    return wasm_functype_new(&pv, &rv);
}

void check (wasm_trap_t* trap) {
    if (trap) {
        wasm_message_t message;
        wasm_trap_message(trap, &message);
        fprintf(stderr, "TRAP: %s\n", message.data);
        exit(1);
    }
}

void w4_wasmLoadModule (const uint8_t* wasmBuffer, int byteLength) {
    wasm_byte_vec_t bytes;
    wasm_byte_vec_new(&bytes, byteLength, (const char*)wasmBuffer);
    module = wasm_module_new(store, &bytes);
    wasm_byte_vec_delete(&bytes);

    if (!module) {
        fprintf(stderr, "Error compiling module");
        exit(1);
    }

    wasm_importtype_vec_t imports;
    wasm_module_imports(module, &imports);

    wasm_extern_t* externs[255];

    for (int ii = 0; ii < imports.size; ++ii) {
        const wasm_importtype_t* import = imports.data[ii];

        const wasm_name_t* module_name = wasm_importtype_module(import);
        if (strcmp(module_name->data, "env") == 0) {
            const wasm_name_t* name = wasm_importtype_name(import);
            // printf("Got import: %s\n", name->data);

            const wasm_externtype_t* externtype = wasm_importtype_type(import);
            wasm_externkind_t externkind = wasm_externtype_kind(externtype);

            if (externkind == WASM_EXTERN_FUNC) {
                wasm_functype_t* functype;
                void* callback;

                if (strcmp(name->data, "blit") == 0) {
                    functype = createFuncType(6, 0);
                    callback = blit;

                } else if (strcmp(name->data, "blitSub") == 0) {
                    functype = createFuncType(9, 0);
                    callback = blitSub;

                } else if (strcmp(name->data, "line") == 0) {
                    functype = createFuncType(4, 0);
                    callback = line;

                } else if (strcmp(name->data, "hline") == 0) {
                    functype = createFuncType(3, 0);
                    callback = hline;

                } else if (strcmp(name->data, "vline") == 0) {
                    functype = createFuncType(3, 0);
                    callback = vline;

                } else if (strcmp(name->data, "oval") == 0) {
                    functype = createFuncType(4, 0);
                    callback = oval;

                } else if (strcmp(name->data, "rect") == 0) {
                    functype = createFuncType(4, 0);
                    callback = rect;

                } else if (strcmp(name->data, "text") == 0) {
                    functype = createFuncType(3, 0);
                    callback = text;

                } else if (strcmp(name->data, "textUtf8") == 0) {
                    functype = createFuncType(4, 0);
                    callback = textUtf8;

                } else if (strcmp(name->data, "textUtf16") == 0) {
                    functype = createFuncType(4, 0);
                    callback = textUtf16;

                } else if (strcmp(name->data, "tone") == 0) {
                    functype = createFuncType(4, 0);
                    callback = tone;

                } else if (strcmp(name->data, "diskr") == 0) {
                    functype = createFuncType(2, 1);
                    callback = diskr;

                } else if (strcmp(name->data, "diskw") == 0) {
                    functype = createFuncType(2, 1);
                    callback = diskw;

                } else if (strcmp(name->data, "trace") == 0) {
                    functype = createFuncType(1, 0);
                    callback = trace;

                } else if (strcmp(name->data, "traceUtf8") == 0) {
                    functype = createFuncType(2, 0);
                    callback = trace;

                } else if (strcmp(name->data, "traceUtf16") == 0) {
                    functype = createFuncType(2, 0);
                    callback = trace;

                } else if (strcmp(name->data, "tracef") == 0) {
                    functype = createFuncType(2, 0);
                    callback = trace;
                }

                wasm_func_t* func = wasm_func_new(store, functype, callback);
                // wasm_functype_delete(functype);
                externs[ii] = wasm_func_as_extern(func);

            } else if (externkind == WASM_EXTERN_MEMORY) {
                if (strcmp(name->data, "memory") == 0) {
                    externs[ii] = wasm_memory_as_extern(memory);
                }
            }
        }
    }

    wasm_extern_vec_t extern_vec;
    wasm_extern_vec_new(&extern_vec, imports.size, externs);
    instance = wasm_instance_new(store, module, &extern_vec, NULL);

    if (!instance) {
        fprintf(stderr, "Error instantiating module");
        exit(1);
    }

    wasm_exporttype_vec_t exports;
    wasm_module_exports(module, &exports);

    wasm_instance_exports(instance, &extern_vec);

    wasm_func_t* _start = NULL;
    wasm_func_t* _initialize = NULL;

    for (int ii = 0; ii < exports.size; ++ii) {
        const wasm_exporttype_t* exporttype = exports.data[ii];
        const wasm_name_t* name = wasm_exporttype_name(exporttype);

        // printf("Got export: %s\n", name->data);

        const wasm_externtype_t* externtype = wasm_exporttype_type(exporttype);
        wasm_externkind_t externkind = wasm_externtype_kind(externtype);

        if (externkind == WASM_EXTERN_FUNC) {
            wasm_func_t* func = wasm_extern_as_func(extern_vec.data[ii]);
            if (strcmp(name->data, "start") == 0) {
                start = func;
            } else if (strcmp(name->data, "_start") == 0) {
                _start = func;
            } else if (strcmp(name->data, "_initialize") == 0) {
                _initialize = func;
            } else if (strcmp(name->data, "update") == 0) {
                update = func;
            }
        }
    }

    // TODO(2022-06-26): Call the wasm "start" section?

    // Call WASI start functions
    if (_start) {
        wasm_val_vec_t args = WASM_EMPTY_VEC;
        wasm_val_vec_t results = WASM_EMPTY_VEC;
        check(wasm_func_call(_start, &args, &results));
    }
    if (_initialize) {
        wasm_val_vec_t args = WASM_EMPTY_VEC;
        wasm_val_vec_t results = WASM_EMPTY_VEC;
        check(wasm_func_call(_initialize, &args, &results));
    }
}

void w4_wasmCallStart () {
    if (start) {
        wasm_val_vec_t args = WASM_EMPTY_VEC;
        wasm_val_vec_t results = WASM_EMPTY_VEC;
        check(wasm_func_call(start, &args, &results));
    }
}

void w4_wasmCallUpdate () {
    if (update) {
        wasm_val_vec_t args = WASM_EMPTY_VEC;
        wasm_val_vec_t results = WASM_EMPTY_VEC;
        check(wasm_func_call(update, &args, &results));
    }
}
