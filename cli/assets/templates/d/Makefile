DUB_FLAGS = --quiet --arch wasm32-unknown-unknown-wasm --build release
ifneq ($(origin WASI_SDK_PATH), undefined)
	override DUB_FLAGS += --config wasi
endif

# Just rebuild every time because it's fast.
# cart.wasm: Makefile dub.json $(wildcard source/*.d)
build:
	dub build ${DUB_FLAGS}

clean:
	rm -rf cart.wasm .dub
