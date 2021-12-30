import * as constants from "./constants";
import { Runtime } from "./runtime";
import * as devkit from "./devkit";
import * as z85 from "./z85";
import "./styles.css";

const qs = new URL(document.location).searchParams;

const screenshot = qs.get("screenshot");
if (screenshot != null) {
    const img = document.createElement("img");
    img.src = screenshot;
    document.getElementById("screenshot").appendChild(img);
}

const title = qs.get("title");
if (title != null) {
    document.getElementById("title").textContent = title;
}

const author = qs.get("author");
if (author != null) {
    document.getElementById("author").textContent = "by "+author;
}

function setClass (element, className, enabled) {
    if (enabled) {
        element.classList.add(className);
    } else {
        element.classList.remove(className);
    }
}

async function loadCartWasm () {
    const cartJson = document.getElementById("wasm4-cart-json");

    // Is cart inlined?
    if (cartJson) {
        const { WASM4_CART, WASM4_CART_SIZE } = JSON.parse(cartJson.textContent);

        // The cart was bundled in the html, decode it
        const buffer = new Uint8Array(WASM4_CART_SIZE);
        z85.decode(WASM4_CART, buffer);
        return buffer;

    } else {
        // Load the cart from a url
        const cartUrl = qs.has("url") ? qs.get("url") : "cart.wasm";
        const res = await fetch(cartUrl);
        return await res.arrayBuffer();
    }
}

(async function () {
    const runtime = new Runtime();
    const canvas = runtime.canvas;
    document.getElementById("content").appendChild(canvas);
    let wasmBuffer = await loadCartWasm();
    await runtime.load(wasmBuffer);

    let devtoolsManager = { toggleDevtools(){} };
    if (ENABLE_DEVTOOLS) {
        devtoolsManager = await import('@wasm4/web-devtools').then(({ DevtoolsManager}) => new DevtoolsManager())
    }

    if (screenshot != null) {
        // Wait until the initial focus before starting the runtime
        await new Promise(resolve => {
            window.onpointerdown = function () {
                window.onpointerdown = null;
                runtime.unlockAudio();
                resolve();
            };
        });

        window.onblur = function () {
            document.body.classList.remove("focus");
            runtime.updateIdleState();
        }
        window.onfocus = function () {
            document.body.classList.add("focus");
            runtime.updateIdleState();
        }
    }
    document.body.classList.add("focus");

    runtime.start();

    if (ENABLE_DEVTOOLS) {
        devkit.websocket.addEventListener("message", async event => {
            switch (event.data) {
            case "reload":
                wasmBuffer = await loadCartWasm();
                reboot();
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
        "2": saveState,
        "4": loadState,
        "r": reboot,
        "F8": devtoolsManager.toggleDevtools,
        "F9": takeScreenshot,
        "F10": recordVideo,
        "F11": requestFullscreen,
    };

    let isKeyboard = true;

    const onKeyboardEvent = event => {
        const down = (event.type == "keydown");

        if (!isKeyboard) {
            // reset joy pad state
            runtime.setGamepad(0, 0);
        }

        isKeyboard = true;

        // Poke WebAudio
        runtime.unlockAudio();

        // We're using the keyboard now, hide the mouse cursor for extra immersion
        document.body.style.cursor = "none";

        if (down) {
            const hotkeyFn = HOTKEYS[event.key];
            if (hotkeyFn) {
                hotkeyFn();
                event.preventDefault();
                return;
            }
        }

        let playerIdx = 0;
        let mask = 0;
        switch (event.code) {
        case "KeyX": case "KeyV": case "Space": case "ControlLeft": case "ControlRight": case "KeyM":
            mask = constants.BUTTON_X;
            break;
        case "KeyZ": case "KeyC": case "AltLeft": case "AltRight": case "KeyN":
            mask = constants.BUTTON_Z;
            break;
        case "ArrowUp":
            mask = constants.BUTTON_UP;
            break;
        case "ArrowDown":
            mask = constants.BUTTON_DOWN;
            break;
        case "ArrowLeft":
            mask = constants.BUTTON_LEFT;
            break;
        case "ArrowRight":
            mask = constants.BUTTON_RIGHT;
            break;

        case "ShiftLeft": case "Tab":
            playerIdx = 1;
            mask = constants.BUTTON_X;
            break;
        case "KeyA": case "KeyQ":
            playerIdx = 1;
            mask = constants.BUTTON_Z;
            break;
        case "KeyE":
            playerIdx = 1;
            mask = constants.BUTTON_UP;
            break;
        case "KeyD":
            playerIdx = 1;
            mask = constants.BUTTON_DOWN;
            break;
        case "KeyS":
            playerIdx = 1;
            mask = constants.BUTTON_LEFT;
            break;
        case "KeyF":
            playerIdx = 1;
            mask = constants.BUTTON_RIGHT;
            break;
        }
        if (mask != 0) {
            event.preventDefault();
            runtime.maskGamepad(playerIdx, mask, down);
        }
    };
    window.addEventListener("keydown", onKeyboardEvent);
    window.addEventListener("keyup", onKeyboardEvent);

    let usedGamepad = -1;

    function processGamepad() {
        if (usedGamepad === -1) {
            return;
        }

        const gamepad = navigator.getGamepads()[usedGamepad];
        if (!gamepad) {
            return;
        }

        const buttons = gamepad.buttons;
        const axes = gamepad.axes;

        // not all gamepads map DPAD to 12,13, 14, 15 buttos
        const dpad = buttons.length > 12;

        // https://www.w3.org/TR/gamepad/#remapping
        // DPAD + AXIS
        const up = dpad && buttons[12].pressed || axes[1] < -0.5;
        const down = dpad && buttons[13].pressed || axes[1] > 0.5;
        const left = dpad && buttons[14].pressed || axes[0] < -0.5;
        const right = dpad && buttons[15].pressed || axes[0] > 0.5;

        // X, O + Triggers
        // NOTE: for XBox360 a triggers is 6 and 7
        const x = buttons[0].pressed || buttons[6].pressed;
        const z = buttons[1].pressed || buttons[7].pressed;

        let buttonMask = 0;
        buttonMask |= constants.BUTTON_UP & -up;
        buttonMask |= constants.BUTTON_DOWN & -down;
        buttonMask |= constants.BUTTON_LEFT & -left;
        buttonMask |= constants.BUTTON_RIGHT & -right;

        buttonMask |= constants.BUTTON_X & -x;
        buttonMask |= constants.BUTTON_Z & -z;

        // supress changing if keyboard used
        // we should not reset state but should read it
        if (buttonMask !== 0 || !isKeyboard) {
            isKeyboard = false;

            runtime.setGamepad(0, buttonMask);
        }
    }

    window.addEventListener("gamepadconnected", (e) => {
        // find a first active gamepad
        for(const g of navigator.getGamepads()) {
            if (g) {
                usedGamepad = g.index;
                break;
            }
        }
    });

    window.addEventListener('gamepaddisconnected', (e) => {
        // if gamepad is same - nothing doing
        if (e.gamepad.index !== usedGamepad) {
            return;
        }

        // reset
        usedGamepad = -1;
        runtime.setGamepad(0, 0);

        for(const g of navigator.getGamepads()) {
            if (g) {
                usedGamepad = g.index;
                break;
            }
        }
    });

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
            const DPAD_ACTIVE_ZONE = 3 / 5; // cos of active angle, greater that cos 60 (1/2)

            const dpadBounds = dpad.getBoundingClientRect();
            const dpadX = dpadBounds.x + dpadBounds.width/2;
            const dpadY = dpadBounds.y + dpadBounds.height/2;

            const action1Bounds = action1.getBoundingClientRect();
            const action1X = action1Bounds.x + action1Bounds.width/2;
            const action1Y = action1Bounds.y + action1Bounds.height/2;

            const action2Bounds = action2.getBoundingClientRect();
            const action2X = action2Bounds.x + action2Bounds.width/2;
            const action2Y = action2Bounds.y + action2Bounds.height/2;

            let x, y, dist, cosX, cosY;
            for (let touch of touchEvents.values()) {
                x = touch.clientX - dpadX;
                y = touch.clientY - dpadY;
                dist = Math.sqrt( x*x + y * y );

                if (dist < DPAD_MAX_DISTANCE && dist > DPAD_DEAD_ZONE) {
                    cosX = x / dist;
                    cosY = y / dist;

                    if (-cosX > DPAD_ACTIVE_ZONE) {
                        buttons |= constants.BUTTON_LEFT;
                    } else if (cosX > DPAD_ACTIVE_ZONE) {
                        buttons |= constants.BUTTON_RIGHT;
                    }
                    if (-cosY > DPAD_ACTIVE_ZONE) {
                        buttons |= constants.BUTTON_UP;
                    } else if (cosY > DPAD_ACTIVE_ZONE) {
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

    const gamepadOverlay = document.getElementById("gamepad"); 
    // https://gist.github.com/addyosmani/5434533#file-limitloop-js-L60

    const INTERVAL = 1000 / 60;

    // lastFrame is not a real time, it has frame-gap correction
    let lastFrame = performance.now();

    function loop () {
        processGamepad();

        const now = performance.now();
        const deltaFrame = now - lastFrame;

        if (deltaFrame >= INTERVAL) {
            lastFrame = now - (deltaFrame % INTERVAL);
            if (!runtime.crashed) {
                runtime.update();
            }

            gamepadOverlay.style.display = runtime.getSystemFlag(constants.SYSTEM_HIDE_GAMEPAD_OVERLAY)
                ? "none" : "";

            if (ENABLE_DEVTOOLS) {
                devtoolsManager.updateCompleted(runtime.data, deltaFrame);  
            }
        }

        requestAnimationFrame(loop);
    }
    loop();
})();
