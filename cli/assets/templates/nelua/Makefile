ifndef WASI_SDK_PATH
$(error Download the WASI SDK (https://github.com/WebAssembly/wasi-sdk) and set $$WASI_SDK_PATH)
endif

CC = "$(WASI_SDK_PATH)/bin/clang" --sysroot="$(WASI_SDK_PATH)/share/wasi-sysroot"
NELUA = nelua

# Optional dependency from binaryen for smaller builds
WASM_OPT = wasm-opt
WASM_OPT_FLAGS = -Oz --zero-filled-memory --strip-producers

# Whether to build for debugging instead of release
DEBUG = 0

# Nelua flags
NELUA_FLAGS = --cc='$(CC)' --add-path src --no-cache
ifeq ($(DEBUG), 1)
	NELUA_FLAGS += -DDEBUG
else
	NELUA_FLAGS += --release
endif

all:
	@mkdir -p build
	$(NELUA) $(NELUA_FLAGS) src/main.nelua --output build/cart.wasm
ifneq ($(DEBUG), 1)
ifeq (, $(shell command -v $(WASM_OPT)))
	@echo Tip: $(WASM_OPT) was not found. Install it from binaryen for smaller builds!
else
	$(WASM_OPT) $(WASM_OPT_FLAGS) build/cart.wasm -o build/cart.wasm
endif
endif

.PHONY: clean
clean:
	rm -rf build
