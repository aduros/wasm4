import * as constants from "./constants";
import { Runtime } from "./runtime";
import { websocket } from "./devkit";

import "./styles.css";

const qs = new URL(document.location).searchParams;
const cartUrl = qs.has("url") ? qs.get("url") : "cart.wasm";

const poster = document.getElementById("poster");
let posterImg;
const posterUrl = qs.get("screenshot");
if (posterUrl != null) {
    posterImg = document.createElement("img");
    posterImg.src = posterUrl;
    poster.appendChild(posterImg);
}

function setClass (element, className, enabled) {
    if (enabled) {
        element.classList.add(className);
    } else {
        element.classList.remove(className);
    }
}

(async function () {

    const res = await fetch(cartUrl);
    let wasmBuffer = await res.arrayBuffer();

    const runtime = new Runtime();
    const canvas = runtime.canvas;
    document.getElementById("content").appendChild(canvas);
    await runtime.load(wasmBuffer);

    if (posterImg != null) {
        await new Promise(resolve => {
            posterImg.onpointerdown = function () {
                posterImg.onpointerdown = null;
                runtime.unlockAudio();
                resolve();
            };
        });

        window.onblur = function () {
            poster.style.display = "";
        }
        window.onfocus = function () {
            poster.style.display = "none";
        }
        poster.style.display = "none";
    }

    runtime.start();

    if (websocket != null) {
        websocket.addEventListener("message", async event => {
            switch (event.data) {
            case "reload": case "hotswap":
                const res = await fetch(cartUrl);
                wasmBuffer = await res.arrayBuffer();
                if (event.data == "reload") {
                    runtime.reset(true);
                }
                await runtime.load(wasmBuffer);
                runtime.start();
                break;
            }
        });
    }

    async function reboot () {
        runtime.reset(true);
        await runtime.load(wasmBuffer);
        runtime.start();
    }

    function takeScreenshot () {
        // We need to render a frame first
        runtime.composite();

        canvas.toBlob(blob => {
            const url = URL.createObjectURL(blob);
            const anchor = document.createElement("a");
            anchor.href = url;
            anchor.download = "wasm4-screenshot.png";
            anchor.click();
            URL.revokeObjectURL(url);
        });
    }

    let videoRecorder = null;
    function recordVideo () {
        if (videoRecorder != null) {
            return; // Still recording, ignore
        }

        const mimeType = "video/webm";
        const videoStream = canvas.captureStream();
        videoRecorder = new MediaRecorder(videoStream, {
            mimeType,
            videoBitsPerSecond: 25000000,
        });

        const chunks = [];
        videoRecorder.ondataavailable = event => {
            chunks.push(event.data);
        };

        videoRecorder.onstop = () => {
            const blob = new Blob(chunks, { type: mimeType });
            const url = URL.createObjectURL(blob);
            const anchor = document.createElement("a");
            anchor.href = url;
            anchor.download = "wasm4-animation.webm";
            anchor.click();
            URL.revokeObjectURL(url);
        };

        videoRecorder.start();
        setTimeout(() => {
            videoRecorder.requestData();
            videoRecorder.stop();
            videoRecorder = null;
        }, 4000);
    }

    let savedState = null;
    function saveState () {
        savedState = new Uint32Array(runtime.memory.buffer.slice());
    }
    function loadState () {
        if (savedState != null) {
            new Uint32Array(runtime.memory.buffer).set(savedState);
        }
    }

    function requestFullscreen () {
        if (document.fullscreenElement == null) {
            document.body.requestFullscreen({navigationUI: "hide"});
        }
    }


    const onMouseEvent = event => {
        // Unhide the cursor if it was hidden by the keyboard handler
        document.body.style.cursor = "";

        if (event.isPrimary) {
            const bounds = canvas.getBoundingClientRect();
            const x = Math.fround(constants.WIDTH * (event.clientX - bounds.left) / bounds.width);
            const y = Math.fround(constants.HEIGHT * (event.clientY - bounds.top) / bounds.height);
            const buttons = event.buttons & 0b111;
            runtime.setMouse(x, y, buttons);
        }
    };
    window.addEventListener("pointerdown", onMouseEvent);
    window.addEventListener("pointerup", onMouseEvent);
    window.addEventListener("pointermove", onMouseEvent);

    canvas.addEventListener("contextmenu", event => {
        event.preventDefault();
    });

    const HOTKEYS = {
        50: saveState, // 2
        52: loadState, // 4
        82: reboot, // R
        120: takeScreenshot, // F9
        121: recordVideo, // F10
        122: requestFullscreen, // F11
    };

    const onKeyboardEvent = event => {
        const down = (event.type == "keydown");

        // Poke WebAudio
        runtime.unlockAudio();

        // We're using the keyboard now, hide the mouse cursor for extra immersion
        document.body.style.cursor = "none";

        if (down) {
            const hotkeyFn = HOTKEYS[event.keyCode];
            if (hotkeyFn) {
                hotkeyFn();
                event.preventDefault();
                return;
            }
        }

        let mask = 0;
        switch (event.keyCode) {
        case 88: case 32: case 81:
            mask = constants.BUTTON_X;
            break;
        case 90: case 18: case 186:
        case 67: case 74:
            mask = constants.BUTTON_Z;
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
            if (event.pointerType == "touch") {
                requestFullscreen();
            }
            runtime.unlockAudio();
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
