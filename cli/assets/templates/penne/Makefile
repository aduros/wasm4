PENNE?=penne

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
