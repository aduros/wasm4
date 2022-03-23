import { LitElement, html, css } from "lit";
import { customElement, state } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';

import { App } from "./app";
import * as constants from "../constants";

const options = [
    "CONTINUE",
    "SAVE STATE",
    "LOAD STATE",
    // "OPTIONS",
    // "HOST NETPLAY",
    "RESET CART",
];

@customElement("wasm4-menu-overlay")
export class MenuOverlay extends LitElement {
    static styles = css`
        :host {
            width: 100vmin;
            height: 100vmin;
            position: absolute;

            color: #a0a0a0;
            font: 16px wasm4-font;
            line-height: 2em;

            display: flex;
            align-items: center;
            justify-content: center;

            background: rgba(0, 0, 0, 0.85);
        }

        .menu {
            border: 2px solid #f0f0f0;
            padding: 0 1em 0 1em;
        }

        ul {
            list-style: none;
            padding-left: 0;
            padding-right: 1em;
        }

        li::before {
            content: "\\00a0\\00a0";
        }
        li.selected::before {
            content: "> ";
        }
        li.selected {
            color: #fff;
        }
    `;

    @state() private selectedIdx: number = 0;
    app!: App;

    constructor () {
        super();
    }

    onGamepadPressed (gamepad: number) {
        if (gamepad & (constants.BUTTON_X | constants.BUTTON_Z)) {
            switch (this.selectedIdx) {
            case 0:
                break;
            case 1:
                this.app.saveGameState();
                break;
            case 2:
                this.app.loadGameState();
                break;
            case 3:
                this.app.resetCart();
                break;
            }
            this.app.closeMenu();
        }

        if (gamepad & constants.BUTTON_DOWN) {
            this.selectedIdx++;
        }
        if (gamepad & constants.BUTTON_UP) {
            this.selectedIdx--;
        }
        this.selectedIdx = (this.selectedIdx + options.length) % options.length;
    }

    render () {
        return html`
            <div class="menu">
                <ul>
                    ${map(options, (option, idx) =>
                        html`<li class="${this.selectedIdx == idx ? "selected" : ""}"}>${option}</li>`)}
                </ul>
            </div>
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "wasm4-menu-overlay": MenuOverlay;
    }
}
