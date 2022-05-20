ifndef WABT_PATH
$(error Download Wabt (https://github.com/WebAssembly/wabt) and set $$WABT_PATH)
endif

4ORTH = 4orth
4ORTH_PATH  = $(shell command -v  $(4ORTH))

ifeq (, $(4ORTH_PATH))
$(error Download 4orth (https://github.com/LunaAmora/4orth) and add it to $$PATH)
endif

4ORTH_ARGS = com -s

ifndef _4ORTH
4ORTH_STD = $(shell dirname -- "$(4ORTH_PATH)")/std
4ORTH_ARGS := -I $(4ORTH_STD) $(4ORTH_ARGS)
endif

ifeq ($(b), 1)
4ORTH_ARGS := $(4ORTH_ARGS) -b
endif

ifeq ($(r), 1)
4ORTH_ARGS := $(4ORTH_ARGS) -r
endif 

# Optional dependency from binaryen for smaller builds
WASM_OPT = wasm-opt

ifneq ($(DEBUG), 1)
ifeq (, $(shell command -v $(WASM_OPT)))
$(info Tip: $(WASM_OPT) was not found. Install it from binaryen for smaller builds!)
else
4ORTH_ARGS := $(4ORTH_ARGS) -opt
endif
endif

ifeq ($(OS), Windows_NT)
	$(error 4orth compiler only supports Linux)
else
	MKDIR_BUILD = mkdir -p build
	RMDIR = rm -rf
endif

all: build/cart.wasm

# Build cart.wasm from main.porth and run wasm-opt
.PHONY: build/cart.wasm
build/cart.wasm: main.porth
	@$(MKDIR_BUILD)
	$(4ORTH) $(4ORTH_ARGS) -o $@ $<

.PHONY: clean
clean:
	$(RMDIR) build
