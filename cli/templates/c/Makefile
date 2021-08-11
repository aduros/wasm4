# Build-time dependencies
CC = clang
LD = wasm-ld
WASM_OPT = wasm-opt

BUILD_DIR ?= ./build
SRC_DIRS ?= ./src

RELEASE=1
ifeq ($(RELEASE),1)
	OPT_FLAGS = -Oz
else
	OPT_FLAGS = -g4 --source-map-base "http://0.0.0.0:7001/build/" # -s DEMANGLE_SUPPORT=1
endif
# LDFLAGS = $(OPT_FLAGS) --no-entry -s WASM=1 -s WARN_ON_UNDEFINED_SYMBOLS=0 \
# 		  -s INITIAL_MEMORY=64kb -s MAXIMUM_MEMORY=64kb -s TOTAL_STACK=4kb -s IMPORTED_MEMORY=1 \
# 		  -s GLOBAL_BASE=49380
# 		  # -Wl,--import-memory
LDFLAGS = --no-entry --strip-all --export-dynamic --lto-O3 -O3 --gc-sections --allow-undefined --import-memory --global-base=49380 \
	--initial-memory=65536 -max-memory=65536 -z stack-size=0
CFLAGS ?= --target=wasm32 -nostdlib -flto -fvisibility=hidden -ffunction-sections -fdata-sections $(INC_FLAGS) -MMD -MP $(OPT_FLAGS) -W -Wall -Wextra -Werror

SRCS := $(shell find $(SRC_DIRS) -name "*.c" -o -name "*.cpp")
OBJS := $(SRCS:%=$(BUILD_DIR)/%.o)
DEPS := $(OBJS:.o=.d)

INC_DIRS := $(shell find $(SRC_DIRS) -type d)
INC_FLAGS := $(addprefix -I,$(INC_DIRS))

all: $(BUILD_DIR)/cart.wasm

$(BUILD_DIR)/cart.wasm: $(OBJS)
	mkdir -p $(dir $@)
	$(LD) $(OBJS) -o $@ $(LDFLAGS)
ifeq ($(RELEASE),1)
	$(WASM_OPT) -Oz --zero-filled-memory $@ -o $@.opt
	mv $@.opt $@
endif

$(BUILD_DIR)/%.c.o: %.c
	mkdir -p $(dir $@)
	$(CC) $(CFLAGS) -c $< -o $@

$(BUILD_DIR)/%.cpp.o: %.cpp
	mkdir -p $(dir $@)
	$(CC) $(CFLAGS) -c $< -o $@

.PHONY: clean

clean:
	$(RM) -r $(BUILD_DIR)

-include $(DEPS)
