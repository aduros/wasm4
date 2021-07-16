import * as constants from "./constants";
import { Runtime } from "./runtime";
import { websocket } from "./websocket";

function setClass (element, className, enabled) {
    if (enabled) {
        element.classList.add(className);
    } else {
        element.classList.remove(className);
    }
}

(async function () {
    const res = await fetch("cart.wasm");
    const wasmBuffer = await res.arrayBuffer();

    const runtime = new Runtime();
    const canvas = runtime.canvas;
    document.getElementById("content").appendChild(canvas);
    await runtime.boot(wasmBuffer);

    if (websocket != null) {
        websocket.addEventListener("message", async event => {
            switch (event.data) {
            case "reload": case "hotswap":
                const res = await fetch("cart.wasm");
                const wasmBuffer = await res.arrayBuffer();
                if (event.data == "reload") {
                    runtime.reset(true);
                }
                runtime.boot(wasmBuffer);
                break;
            }
        });
    }

    const onMouseEvent = event => {
        if (event.isPrimary) {
            const bounds = canvas.getBoundingClientRect();
            const x = Math.fround(constants.WIDTH * (event.clientX - bounds.left) / bounds.width);
            const y = Math.fround(constants.HEIGHT * (event.clientY - bounds.top) / bounds.height);
            const buttons = event.buttons;
            runtime.setMouse(x, y, buttons);
        }
    };
    canvas.addEventListener("pointerdown", onMouseEvent);
    canvas.addEventListener("pointerup", onMouseEvent);
    canvas.addEventListener("pointermove", onMouseEvent);

    canvas.addEventListener("contextmenu", event => {
        event.preventDefault();
    });

    const onKeyboardEvent = event => {
        const down = (event.type == "keydown");

        if (down) {
            switch (event.keyCode) {
            case 50: // 2
                // Save state
                // this.snapshot = new Uint32Array(this.memory.buffer.slice());
                return;
            case 52: // 4
                // Load state
                // if (this.snapshot != null) {
                //     new Uint32Array(this.memory.buffer).set(this.snapshot);
                // }
                return;
            case 82: // R
                // this.reset(false);
                return;
            case 80: // P
                // this.paused = !this.paused;
                return;
            }
        }

        let mask = 0;
        switch (event.keyCode) {
        case 32:
            mask = constants.BUTTON_X;
            break;
        case 38:
            mask = constants.BUTTON_UP;
            break;
        case 40:
            mask = constants.BUTTON_DOWN;
            break;
        case 37:
            mask = constants.BUTTON_LEFT;
            break;
        case 39:
            mask = constants.BUTTON_RIGHT;
            break;
        }
        if (mask != 0) {
            event.preventDefault();
            runtime.maskGamepad(0, mask, down);
        }
    };
    window.addEventListener("keydown", onKeyboardEvent);
    window.addEventListener("keyup", onKeyboardEvent);

    const dpad = document.getElementById("gamepad-dpad");
    const action1 = document.getElementById("gamepad-action1");
    const action2 = document.getElementById("gamepad-action2");
    const touchEvents = new Map();

    function onPointerEvent (event) {
        // Do certain things that require a user gesture
        if (event.type == "pointerup") {
            if (document.fullscreenElement == null && event.pointerType == "touch") {
                // Go fullscreen on mobile
                document.body.requestFullscreen({navigationUI: "hide"});
            }
            // if (audioCtx.state == "suspended") {
            //     // Try to resume audio
            //     audioCtx.resume();
            // }
        }

        if (event.pointerType != "touch") {
            return;
        }
        event.preventDefault();

        switch (event.type) {
        case "pointerdown": case "pointermove":
            touchEvents.set(event.pointerId, event);
            break;
        default:
            touchEvents.delete(event.pointerId);
            break;
        }

        let buttons = 0;
        if (touchEvents.size) {
            const DPAD_MAX_DISTANCE = 100;
            const DPAD_DEAD_ZONE = 10;
            const BUTTON_MAX_DISTANCE = 50;

            const dpadBounds = dpad.getBoundingClientRect();
            const dpadX = dpadBounds.x + dpadBounds.width/2;
            const dpadY = dpadBounds.y + dpadBounds.height/2;

            const action1Bounds = action1.getBoundingClientRect();
            const action1X = action1Bounds.x + action1Bounds.width/2;
            const action1Y = action1Bounds.y + action1Bounds.height/2;

            const action2Bounds = action2.getBoundingClientRect();
            const action2X = action2Bounds.x + action2Bounds.width/2;
            const action2Y = action2Bounds.y + action2Bounds.height/2;

            let x, y;
            for (let touch of touchEvents.values()) {
                x = touch.clientX - dpadX;
                y = touch.clientY - dpadY;
                if (x*x + y*y < DPAD_MAX_DISTANCE*DPAD_MAX_DISTANCE) {
                    if (x < -DPAD_DEAD_ZONE) {
                        buttons |= constants.BUTTON_LEFT;
                    } else if (x > DPAD_DEAD_ZONE) {
                        buttons |= constants.BUTTON_RIGHT;
                    }
                    if (y < -DPAD_DEAD_ZONE) {
                        buttons |= constants.BUTTON_UP;
                    } else if (y > DPAD_DEAD_ZONE) {
                        buttons |= constants.BUTTON_DOWN;
                    }
                }

                x = touch.clientX - action1X;
                y = touch.clientY - action1Y;
                if (x*x + y*y < BUTTON_MAX_DISTANCE*BUTTON_MAX_DISTANCE) {
                    buttons |= constants.BUTTON_X;
                }

                x = touch.clientX - action2X;
                y = touch.clientY - action2Y;
                if (x*x + y*y < BUTTON_MAX_DISTANCE*BUTTON_MAX_DISTANCE) {
                    buttons |= constants.BUTTON_Z;
                }
            }
        }

        const nowXZDown = buttons & (constants.BUTTON_X | constants.BUTTON_Z);
        const wasXZDown = runtime.getGamepad(0) & (constants.BUTTON_X | constants.BUTTON_Z);
        if (nowXZDown && !wasXZDown) {
            navigator.vibrate(1);
        }

        setClass(action1, "pressed", buttons & constants.BUTTON_X);
        setClass(action2, "pressed", buttons & constants.BUTTON_Z);
        setClass(dpad, "pressed-left", buttons & constants.BUTTON_LEFT);
        setClass(dpad, "pressed-right", buttons & constants.BUTTON_RIGHT);
        setClass(dpad, "pressed-up", buttons & constants.BUTTON_UP);
        setClass(dpad, "pressed-down", buttons & constants.BUTTON_DOWN);

        runtime.setGamepad(0, buttons);
    }
    window.addEventListener("pointercancel", onPointerEvent);
    window.addEventListener("pointerdown", onPointerEvent);
    window.addEventListener("pointermove", onPointerEvent);
    window.addEventListener("pointerup", onPointerEvent);

    function loop () {
        runtime.update();
        requestAnimationFrame(loop);
    }
    loop();
})();
