import { LitElement, html, css } from "lit";
import { customElement, state } from 'lit/decorators.js';

import * as constants from "../constants";
import * as devkit from "../devkit";
import * as utils from "./utils";
import * as z85 from "../z85";
import { Runtime } from "../runtime";

@customElement("wasm4-app")
export class App extends LitElement {
    static styles = css`
        :host {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;

            user-select: none;
            -webkit-user-select: none;
            -webkit-tap-highlight-color: transparent;
        }

        .content {
            width: 100vmin;
            height: 100vmin;
            overflow: hidden;
        }

        .content canvas {
            width: 100%;
            height: 100%;
            image-rendering: pixelated;
            image-rendering: crisp-edges;
        }
    `;

    @state() runtime: Runtime;
    screenshot: string;

    @state() focused: boolean = true;
    @state() hideGamepadOverlay: boolean = false;

    constructor () {
        super();
        this.init();
    }

    async init () {
        const qs = new URL(document.location.href).searchParams;

        async function loadCartWasm () {
            const cartJson = document.getElementById("wasm4-cart-json");

            // Is cart inlined?
            if (cartJson) {
                const { WASM4_CART, WASM4_CART_SIZE } = JSON.parse(cartJson.textContent ?? '');

                // The cart was bundled in the html, decode it
                const buffer = new Uint8Array(WASM4_CART_SIZE);
                z85.decode(WASM4_CART, buffer);
                return buffer;

            } else {
                // Load the cart from a url
                const cartUrl = qs.has("url") ? qs.get("url")! : "cart.wasm";
                const res = await fetch(cartUrl);
                return await res.arrayBuffer();
            }
        }

        const screenshot = qs.get("screenshot");
        this.screenshot = screenshot;

        const title = qs.get("title");
        const diskName = (document.getElementById("wasm4-disk-prefix")?.textContent ?? qs.get('disk-prefix') ?? title) + "-disk";

        const runtime = new Runtime(diskName);
        await runtime.init();

        const canvas = runtime.canvas;
        let wasmBuffer = await loadCartWasm();
        await runtime.load(wasmBuffer);

        let devtoolsManager = { toggleDevtools(){}, updateCompleted(...args: unknown[]) {} };
        if (DEVELOPER_BUILD) {
            devtoolsManager = await import('@wasm4/web-devtools').then(({ DevtoolsManager}) => new DevtoolsManager())
        }

        if (screenshot != null) {
            // Wait until the initial focus before starting the runtime
            this.focused = false;
            await new Promise<void>(resolve => {
                window.onpointerdown = function () {
                    window.onpointerdown = null;
                    runtime.unlockAudio();
                    resolve();
                };
            });
            this.focused = true;

            window.onblur = () => {
                document.body.classList.remove("focus");
                runtime.updateIdleState();
                this.focused = false;
            };
            window.onfocus = () => {
                document.body.classList.add("focus");
                runtime.updateIdleState();
                this.focused = true;
            };
        }

        runtime.start();

        this.runtime = runtime; // Trigger a rerender

        if (DEVELOPER_BUILD) {
            devkit.websocket?.addEventListener("message", async event => {
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
            runtime.pauseState |= constants.PAUSE_REBOOTING;
            await runtime.load(wasmBuffer);
            runtime.start();
            runtime.pauseState &= ~constants.PAUSE_REBOOTING;
        }

        function takeScreenshot () {
            // We need to render a frame first
            runtime.composite();

            canvas.toBlob(blob => {
                const url = URL.createObjectURL(blob!);
                const anchor = document.createElement("a");
                anchor.href = url;
                anchor.download = "wasm4-screenshot.png";
                anchor.click();
                URL.revokeObjectURL(url);
            });
        }

        let videoRecorder: MediaRecorder | null = null;
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

            const chunks: Blob[] = [];
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
                if(videoRecorder) {
                    videoRecorder.requestData();
                    videoRecorder.stop();
                    videoRecorder = null;
                }
            }, 4000);
        }

        let savedState: Uint32Array | null = null;
        function saveState () {
            savedState = new Uint32Array(runtime.memory.buffer.slice(0));
        }

        function loadState () {
            if (savedState != null) {
                new Uint32Array(runtime.memory.buffer).set(savedState);
            }
        }

        // Temporary hack to allow developers to build 3-4 player games until we have a better solution
        let swapKeyboardControls = false;
        function toggleSwapKeyboardControls () {
            swapKeyboardControls = !swapKeyboardControls;
            runtime.print(`Keyboard swapped to control gamepads ${swapKeyboardControls ? "3 and 4" : "1 and 2"}`);
        }

        const onMouseEvent = (event: PointerEvent) => {
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

        const HOTKEYS: Record<string, (...args:any[]) => any> = {
            "2": saveState,
            "4": loadState,
            "r": reboot,
            "R": reboot,
            "F7": toggleSwapKeyboardControls,
            "F8": devtoolsManager.toggleDevtools,
            "F9": takeScreenshot,
            "F10": recordVideo,
            "F11": utils.requestFullscreen,
        };

        let isKeyboard = true;

        const onKeyboardEvent = (event: KeyboardEvent) => {
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
            case "KeyX": case "KeyV": case "Space": case "KeyM":
                mask = constants.BUTTON_X;
                break;
            case "KeyZ": case "KeyC": case "KeyN":
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
                runtime.maskGamepad(playerIdx + (swapKeyboardControls ? 2 : 0), mask, down);
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

        // https://gist.github.com/addyosmani/5434533#file-limitloop-js-L60
        const INTERVAL = 1000 / 60;

        let lastFrame = performance.now();

        // used for keeping a consistent framerate. not a real time.
        let lastFrameGapCorrected = lastFrame;

        const loop = () => {
            processGamepad();

            const now = performance.now();
            const deltaFrameGapCorrected = now - lastFrameGapCorrected;

            if (deltaFrameGapCorrected >= INTERVAL) {
                const deltaTime = now - lastFrame;
                lastFrame = now;
                lastFrameGapCorrected = now - (deltaFrameGapCorrected % INTERVAL);
                runtime.update();

                this.hideGamepadOverlay = !!runtime.getSystemFlag(constants.SYSTEM_HIDE_GAMEPAD_OVERLAY);

                if (DEVELOPER_BUILD) {
                    devtoolsManager.updateCompleted(runtime, deltaTime);
                }
            }

            requestAnimationFrame(loop);
        };
        loop();
    }

    onPointerUp (event: PointerEvent) {
        if (event.pointerType == "touch") {
            // Try to go fullscreen on mobile
            utils.requestFullscreen();
        }

        // Try to begin playing audio
        this.runtime.unlockAudio();
    }

    render () {
        return html`
            <div class="content" @pointerup="${this.onPointerUp}">
                ${!this.focused ? html`<wasm4-focus-overlay screenshot=${this.screenshot} />` : ""}
                ${this.runtime ? this.runtime.canvas : ""}
            </div>
            ${this.runtime && this.focused && !this.hideGamepadOverlay ? html`<wasm4-virtual-gamepad .runtime=${this.runtime} />` : ""}
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "wasm4-app": App;
    }
}
