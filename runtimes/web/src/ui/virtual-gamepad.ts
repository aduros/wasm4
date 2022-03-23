import { LitElement, html, css } from "lit";
import { customElement, property, query } from 'lit/decorators.js';

import * as constants from "../constants";
import * as utils from "./utils";
import { App } from "./app";

function setClass (element: Element | null, className: string, enabled: boolean | number) {
    if(!element) {
        return;
    }
    if (enabled) {
        element.classList.add(className);
    } else {
        element.classList.remove(className);
    }
}

function requestFullscreen () {
    if (document.fullscreenElement == null) {
        document.body.requestFullscreen({navigationUI: "hide"});
    }
}

@customElement("wasm4-virtual-gamepad")
export class VirtualGamepad extends LitElement {
    static styles = css`
        :host {
            display: none;
        }
        @media (pointer: coarse) {
            :host {
                display: inherit;
            }
        }

        .dpad {
            pointer-events: none;
            position: absolute;
            width: 39px;
            height: 120px;
            left: 69px;
            bottom: 30px;
            background: #444;
            border-radius: 9px;
        }
        .dpad:before {
            position: absolute;
            width: 120px;
            height: 39px;
            top: 39px;
            left: -39px;
            background: #444;
            border-radius: 9px;
            content: "";
        }
        .dpad:after {
            position: absolute;
            height: 39px;
            width: 39px;
            top: 39px;
            border-radius: 100%;
            background: #333;
            content: "";
        }
        .dpad.pressed-left:before {
            border-left: 4px solid #A93671;
            width: 116px;
        }
        .dpad.pressed-right:before {
            border-right: 4px solid #A93671;
            width: 116px;
        }
        .dpad.pressed-up {
            border-top: 4px solid #A93671;
        }
        .dpad.pressed-down {
            border-bottom: 4px solid #A93671;
            height: 116px;
        }

        .action1 {
            right: 80px;
            bottom: 30px;
        }
        .action2 {
            right: 30px;
            bottom: 90px;
        }
        .action1, .action2 {
            pointer-events: none;
            position: absolute;
            width: 60px;
            height: 60px;
            border: 4px solid #A93671;
            border-radius: 50px;

            /** TODO(2022-03-14): Button text should be centered but is off slightly. */
            color: #A93671;
            font: 24px wasm4-font;
            text-align: center;
            line-height: 60px;
        }
        .action1.pressed, .action2.pressed {
            background: #A93671;
        }

        .menu {
            position: absolute;
            background: #444;
            width: 60px;
            height: 20px;
            bottom: 200px;
            right: 35px;
            border-radius: 10px;
        }
    `;

    app!: App;

    @query(".dpad") dpad!: HTMLElement;
    @query(".action1") action1!: HTMLElement;
    @query(".action2") action2!: HTMLElement;

    readonly touchEvents = new Map();

    readonly onPointerEvent = (event: PointerEvent) => {
        if (event.pointerType != "touch") {
            return;
        }
        event.preventDefault();

        switch (event.type) {
        case "pointerdown": case "pointermove":
            this.touchEvents.set(event.pointerId, event);
            break;
        default:
            this.touchEvents.delete(event.pointerId);
            break;
        }

        let buttons = 0;
        if (this.touchEvents.size) {
            const DPAD_MAX_DISTANCE = 100;
            const DPAD_DEAD_ZONE = 10;
            const BUTTON_MAX_DISTANCE = 50;
            const DPAD_ACTIVE_ZONE = 3 / 5; // cos of active angle, greater that cos 60 (1/2)

            const dpadBounds = this.dpad!.getBoundingClientRect();
            const dpadX = dpadBounds.x + dpadBounds.width/2;
            const dpadY = dpadBounds.y + dpadBounds.height/2;

            const action1Bounds = this.action1!.getBoundingClientRect();
            const action1X = action1Bounds.x + action1Bounds.width/2;
            const action1Y = action1Bounds.y + action1Bounds.height/2;

            const action2Bounds = this.action2!.getBoundingClientRect();
            const action2X = action2Bounds.x + action2Bounds.width/2;
            const action2Y = action2Bounds.y + action2Bounds.height/2;

            let x, y, dist, cosX, cosY;
            for (let touch of this.touchEvents.values()) {
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

        setClass(this.action1, "pressed", buttons & constants.BUTTON_X);
        setClass(this.action2, "pressed", buttons & constants.BUTTON_Z);
        setClass(this.dpad, "pressed-left", buttons & constants.BUTTON_LEFT);
        setClass(this.dpad, "pressed-right", buttons & constants.BUTTON_RIGHT);
        setClass(this.dpad, "pressed-up", buttons & constants.BUTTON_UP);
        setClass(this.dpad, "pressed-down", buttons & constants.BUTTON_DOWN);

        this.app.inputManager.nextState.gamepad[0] = buttons;
    }

    connectedCallback () {
        super.connectedCallback();

        window.addEventListener("pointercancel", this.onPointerEvent);
        window.addEventListener("pointerdown", this.onPointerEvent);
        window.addEventListener("pointermove", this.onPointerEvent);
        window.addEventListener("pointerup", this.onPointerEvent);
    }

    disconnectedCallback () {
        window.removeEventListener("pointercancel", this.onPointerEvent);
        window.removeEventListener("pointerdown", this.onPointerEvent);
        window.removeEventListener("pointermove", this.onPointerEvent);
        window.removeEventListener("pointerup", this.onPointerEvent);

        super.disconnectedCallback();
    }

    onMenuButtonPressed (event: Event) {
        this.app.onMenuButtonPressed();

        // Prevent the window handler from clearing our menu close button press
        event.stopImmediatePropagation();
    }

    render () {
        return html`
            <div class="menu" @pointerdown="${this.onMenuButtonPressed}"></div>
            <div class="dpad"></div>
            <div class="action1">X</div>
            <div class="action2">Z</div>
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "wasm4-virtual-gamepad": VirtualGamepad;
    }
}
