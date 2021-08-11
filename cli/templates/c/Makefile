# Build dependencies
CC = clang
LD = wasm-ld
WASM_OPT = wasm-opt

# Whether to build for debugging instead of release
DEBUG = 0

# Compilation flags
CFLAGS = -std=c99 -nostdlib --target=wasm32 -W -Wall -Wextra -Werror -Wno-unused -MMD -MP
ifeq ($(DEBUG), 1)
	CFLAGS += -DDEBUG -O0 -g
else
	CFLAGS += -DNDEBUG -Oz -flto
endif

# Linker flags
LDFLAGS = --no-entry --import-memory --initial-memory=65536 --max-memory=65536 \
	--global-base=6560 -zstack-size=1024
ifeq ($(DEBUG), 1)
	LDFLAGS += --export-all --no-gc-sections
else
	LDFLAGS += --strip-all --export-dynamic --gc-sections --lto-O3 -O3
endif

# wasm-opt flags
WASM_OPT_FLAGS = -Oz --zero-filled-memory

SOURCES = $(wildcard src/*.c)
OBJECTS = $(patsubst src/%.c, build/%.o, $(SOURCES))
DEPS = $(OBJECTS:.o=.d)

all: build/cart.wasm

# Link cart.wasm from all object files and run wasm-opt
build/cart.wasm: $(OBJECTS)
	$(LD) -o $@ $(OBJECTS) $(LDFLAGS)
ifneq ($(DEBUG), 1)
ifeq (, $(shell $(WASM_OPT) --version))
	@echo WARNING: $(WASM_OPT) was not found. Install it from binaryen for smaller builds!
else
	$(WASM_OPT) $(WASM_OPT_FLAGS) $@ -o $@
endif
endif

# Compile each C source file to an object file
build/%.o: src/%.c
	@mkdir -p build
	$(CC) -c $< -o $@ $(CFLAGS)

.PHONY: clean
clean:
	rm -rf build

-include $(DEPS)
