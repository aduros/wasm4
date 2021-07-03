import { Runtime } from "./runtime";

(async function () {
    const res = await fetch("cart.wasm");
    const wasmBuffer = await res.arrayBuffer();

    const runtime = new Runtime();
    document.body.appendChild(runtime.canvas);
    await runtime.boot(wasmBuffer);

    function loop () {
        runtime.update();
        requestAnimationFrame(loop);
    }
    loop();
})();
