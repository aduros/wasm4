ifndef WABT_PATH
$(error Download Wabt (https://github.com/WebAssembly/wabt) and set $$WABT_PATH)
endif

WAT2WASM = "$(WABT_PATH)/bin/wat2wasm"

# Optional dependency from binaryen for smaller builds
WASM_OPT = wasm-opt
WASM_OPT_FLAGS = -Oz --zero-filled-memory --strip-producers

ifeq '$(findstring ;,$(PATH))' ';'
	DETECTED_OS := Windows
else
	DETECTED_OS := $(shell uname 2>/dev/null || echo Unknown)
	DETECTED_OS := $(patsubst CYGWIN%,Cygwin,$(DETECTED_OS))
	DETECTED_OS := $(patsubst MSYS%,MSYS,$(DETECTED_OS))
	DETECTED_OS := $(patsubst MINGW%,MSYS,$(DETECTED_OS))
endif

ifeq ($(DETECTED_OS), Windows)
	MKDIR_BUILD = if not exist build md build
	RMDIR = rd /s /q
else
	MKDIR_BUILD = mkdir -p build
	RMDIR = rm -rf
endif

all: build/cart.wasm

# Build cart.wasm from main.wat and run wasm-opt
build/cart.wasm: main.wat
	@$(MKDIR_BUILD)
	$(WAT2WASM) $< -o $@
ifneq ($(DEBUG), 1)
ifeq (, $(shell command -v $(WASM_OPT)))
	@echo Tip: $(WASM_OPT) was not found. Install it from binaryen for smaller builds!
else
	$(WASM_OPT) $(WASM_OPT_FLAGS) $@ -o $@
endif
endif

.PHONY: clean
clean:
	$(RMDIR) build
