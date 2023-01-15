ifndef PENNE
ifndef WASI_SDK_PATH
$(error Download the WASI SDK (https://github.com/WebAssembly/wasi-sdk) and set $$WASI_SDK_PATH)
endif
endif
WASI_SDK_CLANG = "$(WASI_SDK_PATH)/bin/clang"

# Set the PENNE environment variable to "penne" or "penne --backend=clang"
# if you do not want to use the WASI SDK.
PENNE ?= penne --backend=$(WASI_SDK_CLANG)

ifeq ($(DETECTED_OS), Windows)
	RMDIR = rd /s /q
else
	RMDIR = rm -rf
endif

all: build/cart.wasm

build/cart.wasm: src/*.pn
	$(PENNE) --out-dir=build/ -o $@ --config=penne_wasm4.toml $^

.PHONY: clean
clean:
	$(RMDIR) build
