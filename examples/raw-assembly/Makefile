# Build dependencies
WAT2WASM = wat2wasm
WASM_OPT = wasm-opt

# wasm-opt flags
WASM_OPT_FLAGS = -Oz --zero-filled-memory --strip-producers

build/cart.wasm: src/cart.wat
	mkdir -p build
	$(WAT2WASM) $< -o $@
ifneq ($(DEBUG), 1)
ifeq (, $(shell which $(WASM_OPT)))
	@echo Tip: $(WASM_OPT) was not found. Install it from binaryen for smaller builds!
else
	$(WASM_OPT) $(WASM_OPT_FLAGS) $@ -o $@
endif
endif

.PHONY: clean
clean:
	rm -rf build
