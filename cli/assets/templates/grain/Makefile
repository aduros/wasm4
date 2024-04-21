build:
	grain compile --release --elide-type-info \
		--import-memory --use-start-section --memory-base 8192 \
		--initial-memory-pages 1 --maximum-memory-pages 1 \
		--wasi-polyfill bindings/wasm4-wasi-polyfill.gr -I bindings \
		app/main.gr -o cart.wasm

clean:
	find -name '*.wasm' | xargs rm
