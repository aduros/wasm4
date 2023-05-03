ifndef WABT_PATH
$(error Download Wabt (https://github.com/WebAssembly/wabt) and set $$WABT_PATH)
endif

WAT2WASM = "$(WABT_PATH)/bin/wat2wasm"

# Optional dependency from binaryen for smaller builds
WASM_OPT = wasm-opt
WASM_OPT_FLAGS = -Oz --zero-filled-memory --strip-producers
	
all:
	@mkdir -p b build
	$(WAT2WASM) src/main.wat -o build/cart.wasm
ifneq ($(DEBUG), 1)
ifeq (, $(shell command -v $(WASM_OPT)))
	@echo Tip: $(WASM_OPT) was not found. Install it from binaryen for smaller builds!
else
	$(WASM_OPT) $(WASM_OPT_FLAGS) build/cart.wasm -o build/cart.wasm
endif
endif

.PHONY: clean
clean:
	$(RMDIR) build
