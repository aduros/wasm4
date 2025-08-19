#include <errno.h>
#include <inttypes.h>
#include <stdio.h>
#include <stdlib.h>

#include <toywasm/exec_context.h>
#include <toywasm/exec_debug.h>
#include <toywasm/host_instance.h>
#include <toywasm/instance.h>
#include <toywasm/load_context.h>
#include <toywasm/mem.h>
#include <toywasm/module.h>
#include <toywasm/type.h>

#include "../runtime.h"
#include "../wasm.h"

static const struct memtype memtype = {
    .lim =
        {
            .min = 1,
            .max = 1,
        },
    .flags = 0,
#if defined(TOYWASM_ENABLE_WASM_CUSTOM_PAGE_SIZES)
    .page_shift = 16,
#endif
};

static struct mem_context mctx;
static struct meminst *meminst;
static struct import_object *host_import_obj;
static struct import_object *mem_import_obj;
static struct module *module;
static struct instance *instance;
static uint32_t start;
static uint32_t update;

static void *convert_to_ptr(struct exec_context *ctx, uint32_t wp) {
    /*
     * XXX we can't perform proper bounds check because we don't
     * know the size of the access. especially for things like tracef.
     */
    void *p;
    int ret = host_func_getptr(ctx, meminst, wp, 1, &p);
    if (ret != 0) {
        fprintf(stderr,
                "host_func_getptr failed with %d: wasm ptr 0x%" PRIx32 "\n",
                ret, wp);
        if (ret == ETOYWASMTRAP) {
            print_trace(ctx);
        }
        exit(1);
    }
    return p;
}

#define W4_HOST_FUNC(n, t) HOST_FUNC_PREFIX(w4_, n, t)
#define W4_HOST_FUNC_DECL(n) HOST_FUNC_DECL(w4_##n)

#define HOST_FUNC_PARAM_PTR(ft, params, i)                                     \
    convert_to_ptr(ctx, HOST_FUNC_PARAM(ft, params, i, i32))

static W4_HOST_FUNC_DECL(blit) {
    HOST_FUNC_CONVERT_PARAMS(ft, params);
    const uint8_t *sprite = HOST_FUNC_PARAM_PTR(ft, params, 0);
    uint32_t x = HOST_FUNC_PARAM(ft, params, 1, i32);
    uint32_t y = HOST_FUNC_PARAM(ft, params, 2, i32);
    uint32_t width = HOST_FUNC_PARAM(ft, params, 3, i32);
    uint32_t height = HOST_FUNC_PARAM(ft, params, 4, i32);
    uint32_t flags = HOST_FUNC_PARAM(ft, params, 5, i32);
    w4_runtimeBlit(sprite, x, y, width, height, flags);
    HOST_FUNC_FREE_CONVERTED_PARAMS();
    return 0;
}

static W4_HOST_FUNC_DECL(blitSub) {
    HOST_FUNC_CONVERT_PARAMS(ft, params);
    const uint8_t *sprite = HOST_FUNC_PARAM_PTR(ft, params, 0);
    uint32_t x = HOST_FUNC_PARAM(ft, params, 1, i32);
    uint32_t y = HOST_FUNC_PARAM(ft, params, 2, i32);
    uint32_t width = HOST_FUNC_PARAM(ft, params, 3, i32);
    uint32_t height = HOST_FUNC_PARAM(ft, params, 4, i32);
    uint32_t srcX = HOST_FUNC_PARAM(ft, params, 5, i32);
    uint32_t srcY = HOST_FUNC_PARAM(ft, params, 6, i32);
    uint32_t stride = HOST_FUNC_PARAM(ft, params, 7, i32);
    uint32_t flags = HOST_FUNC_PARAM(ft, params, 8, i32);
    w4_runtimeBlitSub(sprite, x, y, width, height, srcX, srcY, stride, flags);
    HOST_FUNC_FREE_CONVERTED_PARAMS();
    return 0;
}

static W4_HOST_FUNC_DECL(line) {
    HOST_FUNC_CONVERT_PARAMS(ft, params);
    uint32_t x1 = HOST_FUNC_PARAM(ft, params, 0, i32);
    uint32_t y1 = HOST_FUNC_PARAM(ft, params, 1, i32);
    uint32_t x2 = HOST_FUNC_PARAM(ft, params, 2, i32);
    uint32_t y2 = HOST_FUNC_PARAM(ft, params, 3, i32);
    w4_runtimeLine(x1, y1, x2, y2);
    HOST_FUNC_FREE_CONVERTED_PARAMS();
    return 0;
}

static W4_HOST_FUNC_DECL(hline) {
    HOST_FUNC_CONVERT_PARAMS(ft, params);
    uint32_t x = HOST_FUNC_PARAM(ft, params, 0, i32);
    uint32_t y = HOST_FUNC_PARAM(ft, params, 1, i32);
    uint32_t len = HOST_FUNC_PARAM(ft, params, 2, i32);
    w4_runtimeHLine(x, y, len);
    HOST_FUNC_FREE_CONVERTED_PARAMS();
    return 0;
}

static W4_HOST_FUNC_DECL(vline) {
    HOST_FUNC_CONVERT_PARAMS(ft, params);
    uint32_t x = HOST_FUNC_PARAM(ft, params, 0, i32);
    uint32_t y = HOST_FUNC_PARAM(ft, params, 1, i32);
    uint32_t len = HOST_FUNC_PARAM(ft, params, 2, i32);
    w4_runtimeVLine(x, y, len);
    HOST_FUNC_FREE_CONVERTED_PARAMS();
    return 0;
}

static W4_HOST_FUNC_DECL(oval) {
    HOST_FUNC_CONVERT_PARAMS(ft, params);
    uint32_t x = HOST_FUNC_PARAM(ft, params, 0, i32);
    uint32_t y = HOST_FUNC_PARAM(ft, params, 1, i32);
    uint32_t width = HOST_FUNC_PARAM(ft, params, 2, i32);
    uint32_t height = HOST_FUNC_PARAM(ft, params, 3, i32);
    w4_runtimeOval(x, y, width, height);
    HOST_FUNC_FREE_CONVERTED_PARAMS();
    return 0;
}

static W4_HOST_FUNC_DECL(rect) {
    HOST_FUNC_CONVERT_PARAMS(ft, params);
    uint32_t x = HOST_FUNC_PARAM(ft, params, 0, i32);
    uint32_t y = HOST_FUNC_PARAM(ft, params, 1, i32);
    uint32_t width = HOST_FUNC_PARAM(ft, params, 2, i32);
    uint32_t height = HOST_FUNC_PARAM(ft, params, 3, i32);
    w4_runtimeRect(x, y, width, height);
    HOST_FUNC_FREE_CONVERTED_PARAMS();
    return 0;
}

static W4_HOST_FUNC_DECL(text) {
    HOST_FUNC_CONVERT_PARAMS(ft, params);
    const uint8_t *str = HOST_FUNC_PARAM_PTR(ft, params, 0);
    uint32_t x = HOST_FUNC_PARAM(ft, params, 1, i32);
    uint32_t y = HOST_FUNC_PARAM(ft, params, 2, i32);
    w4_runtimeText(str, x, y);
    HOST_FUNC_FREE_CONVERTED_PARAMS();
    return 0;
}

static W4_HOST_FUNC_DECL(textUtf8) {
    HOST_FUNC_CONVERT_PARAMS(ft, params);
    const uint8_t *str = HOST_FUNC_PARAM_PTR(ft, params, 0);
    uint32_t byteLength = HOST_FUNC_PARAM(ft, params, 1, i32);
    uint32_t x = HOST_FUNC_PARAM(ft, params, 2, i32);
    uint32_t y = HOST_FUNC_PARAM(ft, params, 3, i32);
    w4_runtimeTextUtf8(str, byteLength, x, y);
    HOST_FUNC_FREE_CONVERTED_PARAMS();
    return 0;
}

static W4_HOST_FUNC_DECL(textUtf16) {
    HOST_FUNC_CONVERT_PARAMS(ft, params);
    const uint16_t *str = HOST_FUNC_PARAM_PTR(ft, params, 0);
    uint32_t byteLength = HOST_FUNC_PARAM(ft, params, 1, i32);
    uint32_t x = HOST_FUNC_PARAM(ft, params, 2, i32);
    uint32_t y = HOST_FUNC_PARAM(ft, params, 3, i32);
    w4_runtimeTextUtf16(str, byteLength, x, y);
    HOST_FUNC_FREE_CONVERTED_PARAMS();
    return 0;
}

static W4_HOST_FUNC_DECL(tone) {
    HOST_FUNC_CONVERT_PARAMS(ft, params);
    uint32_t frequency = HOST_FUNC_PARAM(ft, params, 0, i32);
    uint32_t duration = HOST_FUNC_PARAM(ft, params, 1, i32);
    uint32_t volume = HOST_FUNC_PARAM(ft, params, 2, i32);
    uint32_t flags = HOST_FUNC_PARAM(ft, params, 3, i32);
    w4_runtimeTone(frequency, duration, volume, flags);
    HOST_FUNC_FREE_CONVERTED_PARAMS();
    return 0;
}

static W4_HOST_FUNC_DECL(diskr) {
    HOST_FUNC_CONVERT_PARAMS(ft, params);
    uint8_t *dest = HOST_FUNC_PARAM_PTR(ft, params, 0);
    uint32_t size = HOST_FUNC_PARAM(ft, params, 1, i32);
    int wasmret = w4_runtimeDiskr(dest, size);
    HOST_FUNC_RESULT_SET(ft, results, 0, i32, wasmret);
    HOST_FUNC_FREE_CONVERTED_PARAMS();
    return 0;
}

static W4_HOST_FUNC_DECL(diskw) {
    HOST_FUNC_CONVERT_PARAMS(ft, params);
    const uint8_t *src = HOST_FUNC_PARAM_PTR(ft, params, 0);
    uint32_t size = HOST_FUNC_PARAM(ft, params, 1, i32);
    int wasmret = w4_runtimeDiskw(src, size);
    HOST_FUNC_RESULT_SET(ft, results, 0, i32, wasmret);
    HOST_FUNC_FREE_CONVERTED_PARAMS();
    return 0;
}

static W4_HOST_FUNC_DECL(trace) {
    HOST_FUNC_CONVERT_PARAMS(ft, params);
    const uint8_t *str = HOST_FUNC_PARAM_PTR(ft, params, 0);
    w4_runtimeTrace(str);
    HOST_FUNC_FREE_CONVERTED_PARAMS();
    return 0;
}

static W4_HOST_FUNC_DECL(traceUtf8) {
    HOST_FUNC_CONVERT_PARAMS(ft, params);
    const uint8_t *str = HOST_FUNC_PARAM_PTR(ft, params, 0);
    uint32_t byteLength = HOST_FUNC_PARAM(ft, params, 1, i32);
    w4_runtimeTraceUtf8(str, byteLength);
    HOST_FUNC_FREE_CONVERTED_PARAMS();
    return 0;
}

static W4_HOST_FUNC_DECL(traceUtf16) {
    HOST_FUNC_CONVERT_PARAMS(ft, params);
    const uint16_t *str = HOST_FUNC_PARAM_PTR(ft, params, 0);
    uint32_t byteLength = HOST_FUNC_PARAM(ft, params, 1, i32);
    w4_runtimeTraceUtf16(str, byteLength);
    HOST_FUNC_FREE_CONVERTED_PARAMS();
    return 0;
}

static W4_HOST_FUNC_DECL(tracef) {
    HOST_FUNC_CONVERT_PARAMS(ft, params);
    const uint8_t *str = HOST_FUNC_PARAM_PTR(ft, params, 0);
    const void *stack = HOST_FUNC_PARAM_PTR(ft, params, 1);
    w4_runtimeTracef(str, stack);
    HOST_FUNC_FREE_CONVERTED_PARAMS();
    return 0;
}

static const struct host_func host_inst_funcs[] = {
    W4_HOST_FUNC(blit, "(iiiiii)"),   W4_HOST_FUNC(blitSub, "(iiiiiiiii)"),
    W4_HOST_FUNC(line, "(iiii)"),     W4_HOST_FUNC(hline, "(iii)"),
    W4_HOST_FUNC(vline, "(iii)"),     W4_HOST_FUNC(oval, "(iiii)"),
    W4_HOST_FUNC(rect, "(iiii)"),     W4_HOST_FUNC(text, "(iii)"),
    W4_HOST_FUNC(textUtf8, "(iiii)"), W4_HOST_FUNC(textUtf16, "(iiii)"),
    W4_HOST_FUNC(tone, "(iiii)"),     W4_HOST_FUNC(diskr, "(ii)i"),
    W4_HOST_FUNC(diskw, "(ii)i"),     W4_HOST_FUNC(trace, "(i)"),
    W4_HOST_FUNC(traceUtf8, "(ii)"),  W4_HOST_FUNC(traceUtf16, "(ii)"),
    W4_HOST_FUNC(tracef, "(ii)"),
};

static const struct name name_env = NAME_FROM_CSTR_LITERAL("env");
static const struct name name_memory = NAME_FROM_CSTR_LITERAL("memory");

static const struct host_module host_modules[] = {{
    .module_name = &name_env,
    .funcs = host_inst_funcs,
    .nfuncs = ARRAYCOUNT(host_inst_funcs),
}};

uint8_t *w4_wasmInit() {
    int ret;
    mem_context_init(&mctx);
    /*
     * set an arbitrary limit.
     * this includes the 64KB linear memory.
     * REVISIT: how much operand stack etc typical carts can consume?
     */
    ret = mem_context_setlimit(&mctx, 128 * 1024);
    if (ret != 0) {
        fprintf(stderr, "failed to set memory limit with %d\n", ret);
        exit(1);
    }
    ret = memory_instance_create(&mctx, &meminst, &memtype);
    if (ret != 0) {
        fprintf(stderr, "memory_instance_create failed with %d\n", ret);
        exit(1);
    }
    void *p;
    bool moved;
    ret = memory_instance_getptr2(meminst, 0, 0, 64 * 1024, &p, &moved);
    if (ret != 0) {
        fprintf(stderr, "memory_instance_getptr2 failed with %d\n", ret);
        exit(1);
    }
    return p;
}

void w4_wasmDestroy() {
    if (instance != NULL) {
        instance_destroy(instance);
    }
    if (module != NULL) {
        module_destroy(&mctx, module);
    }
    if (host_import_obj != NULL) {
        import_object_destroy(&mctx, host_import_obj);
    }
    if (mem_import_obj != NULL) {
        import_object_destroy(&mctx, mem_import_obj);
    }
    if (meminst != NULL) {
        memory_instance_destroy(&mctx, meminst);
    }
    mem_context_clear(&mctx);
}

static uint32_t find_func(const struct module *m, const char *name_cstr,
                          bool require) {
    struct name name;
    uint32_t idx;
    int ret;
    set_name_cstr(&name, name_cstr);
    ret = module_find_export(m, &name, EXTERNTYPE_FUNC, &idx);
    if (ret != 0) {
        if (!require) {
            return (uint32_t)-1;
        }
        fprintf(stderr, "module_find_export (%s) failed with %d\n", name_cstr,
                ret);
        exit(1);
    }
    /*
     * note: we don't use exported functions with parameters or results.
     */
    const struct functype *ft = module_functype(m, idx);
    if (ft->parameter.ntypes != 0 || ft->result.ntypes != 0) {
        if (!require) {
            return (uint32_t)-1;
        }
        fprintf(stderr, "exported function (%s) has an unexpected type\n",
                name_cstr);
        exit(1);
    }
    return idx;
}

int run_func(struct instance *inst, uint32_t funcidx) {
    struct exec_context ctx;
    int ret;
    exec_context_init(&ctx, inst, &mctx);
    ret = instance_execute_func_nocheck(&ctx, funcidx);
    ret = instance_execute_handle_restart(&ctx, ret);
    if (ret == ETOYWASMTRAP) {
        fprintf(stderr, "wasm function execution failed: %s\n",
                report_getmessage(ctx.report));
        print_trace(&ctx);
        exit(1);
    }
    exec_context_clear(&ctx);
    return ret;
}

void w4_wasmLoadModule(const uint8_t *wasmBuffer, int byteLength) {
    struct import_object *import_obj;
    int ret;

    ret = import_object_alloc(&mctx, 1, &mem_import_obj);
    if (ret != 0) {
        fprintf(stderr, "import_object_alloc failed with %d\n", ret);
        exit(1);
    }
    mem_import_obj->entries[0].module_name = &name_env;
    mem_import_obj->entries[0].name = &name_memory;
    mem_import_obj->entries[0].type = EXTERNTYPE_MEMORY;
    mem_import_obj->entries[0].u.mem = meminst;
    ret = import_object_create_for_host_funcs(
        &mctx, host_modules, ARRAYCOUNT(host_modules), NULL, &host_import_obj);
    if (ret != 0) {
        fprintf(stderr, "import_object_create_for_host_funcs failed with %d\n",
                ret);
        exit(1);
    }
    import_obj = host_import_obj;
    host_import_obj->next = mem_import_obj;

    struct load_context lctx;
    load_context_init(&lctx, &mctx);
    ret = module_create(&module, wasmBuffer, wasmBuffer + byteLength, &lctx);
    if (ret != 0) {
        fprintf(stderr, "module_create failed with %d: %s\n", ret,
                report_getmessage(&lctx.report));
        exit(1);
    }
    load_context_clear(&lctx);

    struct report report;
    report_init(&report);
    ret = instance_create(&mctx, module, &instance, import_obj, &report);
    if (ret != 0) {
        fprintf(stderr, "instance_create failed with %d: %s\n", ret,
                report_getmessage(&report));
        exit(1);
    }
    report_clear(&report);

    start = find_func(module, "start", false);
    update = find_func(module, "update", true);
    uint32_t init = find_func(module, "_initialize", false);
    if (init != (uint32_t)-1) {
        run_func(instance, init);
    }
}

void w4_wasmCallStart() {
    if (start != (uint32_t)-1) {
        run_func(instance, start);
    }
}

void w4_wasmCallUpdate() {
    if (update != (uint32_t)-1) {
        run_func(instance, update);
    }
}
