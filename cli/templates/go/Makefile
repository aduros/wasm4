# Build dependencies
GO = tinygo
WASM_OPT = wasm-opt

# Whether to build for debugging instead of release
DEBUG = 0

# wasm-opt flags
WASM_OPT_FLAGS = -Oz --zero-filled-memory

all:
	@mkdir -p build
	$(GO) build -o build/cart.wasm -target ./target.json ./src
ifneq ($(DEBUG), 1)
ifeq (, $(shell $(WASM_OPT) --version))
	@echo NOTE: $(WASM_OPT) was not found. Install it from binaryen for smaller builds!
else
	$(WASM_OPT) $(WASM_OPT_FLAGS) build/cart.wasm -o build/cart.wasm
endif
endif

.PHONY: clean
clean:
	rm -rf build
