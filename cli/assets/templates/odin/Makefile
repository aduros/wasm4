build/cart.wasm: src/*.odin
	@-mkdir -p build
	odin build src -out:build/cart.wasm -target:freestanding_wasm32 -no-entry-point -extra-linker-flags:"--import-memory -zstack-size=8096 --initial-memory=65536 --max-memory=65536 --global-base=6560 --lto-O3 --gc-sections --strip-all"
