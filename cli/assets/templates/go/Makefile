# Build dependencies
GO = tinygo
WASM_OPT = wasm-opt

# Whether to build for debugging instead of release
DEBUG = 0

# Compilation flags
GOFLAGS = -target ./target.json -panic trap
ifeq ($(DEBUG), 1)
	GOFLAGS += -opt 1
else
	GOFLAGS += -opt z -no-debug
endif

# wasm-opt flags
WASM_OPT_FLAGS = -Oz --zero-filled-memory --strip-producers --enable-bulk-memory

all:
	@mkdir -p build
	$(GO) build $(GOFLAGS) -o build/cart.wasm .
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
