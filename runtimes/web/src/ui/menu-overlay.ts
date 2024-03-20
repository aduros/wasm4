import { LitElement, html, css } from "lit";
import { customElement, state } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';

import { App } from "./app";
import { VirtualGamepad } from "./virtual-gamepad";
import * as constants from "../constants";

const optionContext = {
    DEFAULT: 0,
    DISK: 1,
};

const optionIndex = [
    {
        CONTINUE: 0,
        SAVE_STATE: 1,
        LOAD_STATE: 2,
        BUTTON_VIBRATE: 3,
        DISK_OPTIONS: 4,
        // OPTIONS: null,
        COPY_NETPLAY_LINK: 5,
        RESET_CART: 6,
    },
    {
        BACK: 0,
        EXPORT_DISK: 1,
        IMPORT_DISK: 2,
        CLEAR_DISK: 3,
    }
];

const options = [
    [
        "CONTINUE",
        "SAVE STATE",
        "LOAD STATE",
        "VIBRATE:",
        "DISK OPTIONS",
        // "OPTIONS",
        "COPY NETPLAY URL",
        "RESET CART",
    ],
    [
        "BACK",
        "EXPORT DISK",
        "IMPORT DISK",
        "CLEAR DISK",
    ]
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

            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;

            background: rgba(0, 0, 0, 0.85);
        }

        .menu {
            border: 2px solid #f0f0f0;
            padding: 0 1em 0 1em;
            line-height: 2em;
        }

        .netplay-summary {
            margin-top: 2em;
            line-height: 1.5em;
        }

        .ping-you {
            color: #f0f0f0;
        }

        .ping-good {
            color: green;
        }

        .ping-ok {
            color: yellow;
        }

        .ping-bad {
            color: red;
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

    app!: App;

    private lastGamepad = 0;

    @state() private selectedIdx = 0;
    @state() private netplaySummary: { playerIdx: number, ping: number }[] = [];
    @state() private vibrateLevel = "";

    private netplayPollInterval?: number;

    private optionContext: number = 0;

    private optionContextHistory: {context: number, index: number}[] = [];

    constructor () {
        super();
    }

    get optionIndex (): any {
        return optionIndex[this.optionContext];
    }

    get options (): string[] {
        return options[this.optionContext];
    }

    previousContext () {
        if(this.optionContextHistory.length > 0) {
            const previousContext = this.optionContextHistory.pop() as {context: number, index: number};

            this.resetInput();
            this.optionContext = previousContext.context;
            this.selectedIdx = previousContext.index;
        }
    }

    switchContext (context: number, index: number = 0) {
        this.optionContextHistory.push({
            context: this.optionContext, 
            index: this.selectedIdx
        });

        this.resetInput();
        this.optionContext = context;
        this.selectedIdx = index;
    }

    resetInput () {
        this.app.inputState.gamepad[0] = 0;
    }

    applyInput () {
        // Mix all player's gamepads together for the purposes of menu input
        let gamepad = 0;
        for (const player of this.app.inputState.gamepad) {
            gamepad |= player;
        }

        const pressedThisFrame = gamepad & (gamepad ^ this.lastGamepad);
        this.lastGamepad = gamepad;

        if (pressedThisFrame & (constants.BUTTON_X | constants.BUTTON_Z)) {
            if(this.optionContext === optionContext.DEFAULT) {
                switch (this.selectedIdx) {
                    case this.optionIndex.CONTINUE:
                        this.app.closeMenu();
                        break;
                    case this.optionIndex.SAVE_STATE:
                        this.app.saveGameState();
                        this.app.closeMenu();
                        break;
                    case this.optionIndex.LOAD_STATE:
                        this.app.loadGameState();
                        this.app.closeMenu();
                        break;
                    case this.optionIndex.BUTTON_VIBRATE:
                        this.vibrateLevel = this.app.cycleVibrateLevel() + "ms";
                        break;
                    case this.optionIndex.DISK_OPTIONS:
                        this.switchContext(optionContext.DISK);
                        break;
                    case this.optionIndex.COPY_NETPLAY_LINK:
                        this.app.copyNetplayLink();
                        this.app.closeMenu();
                        break;
                    case this.optionIndex.RESET_CART:
                        this.app.resetCart();
                        this.app.closeMenu();
                        break;
                }
            }
            else if(this.optionContext === optionContext.DISK) {
                switch (this.selectedIdx) {
                    case this.optionIndex.BACK:
                        this.previousContext();
                        break;
                    case this.optionIndex.EXPORT_DISK:
                        this.app.exportGameDisk();
                        this.app.closeMenu();
                        break;
                    case this.optionIndex.IMPORT_DISK:
                        this.resetInput();
                        this.app.importGameDisk();
                        break;
                    case this.optionIndex.CLEAR_DISK:
                        this.app.clearGameDisk();
                        this.app.closeMenu();
                        break;
                }
            }
        }

        if (pressedThisFrame & constants.BUTTON_DOWN) {
            this.selectedIdx++;
            if (this.optionContext === optionContext.DEFAULT && this.selectedIdx === this.optionIndex.BUTTON_VIBRATE &&
                !this.app.canVibrate()) {
                this.selectedIdx++;
            }
        }
        if (pressedThisFrame & constants.BUTTON_UP) {
            this.selectedIdx--;
            if (this.optionContext === optionContext.DEFAULT && this.selectedIdx === this.optionIndex.BUTTON_VIBRATE &&
                !this.app.canVibrate()) {
                this.selectedIdx--;
            }
        }
        this.selectedIdx = (this.selectedIdx + this.options.length) % this.options.length;
    }

    connectedCallback () {
        super.connectedCallback();

        const updateNetplaySummary = () => {
            this.netplaySummary = this.app.getNetplaySummary();
        };
        updateNetplaySummary();
        this.netplayPollInterval = window.setInterval(updateNetplaySummary, 1000);
    }

    disconnectedCallback () {
        window.clearInterval(this.netplayPollInterval);

        super.disconnectedCallback();
    }

    render () {
        if (!this.vibrateLevel) {
            this.vibrateLevel = this.app.vibrateMs + "ms";
        }
        return html`
            <div class="menu">
                <ul style="display:${this.optionContext === optionContext.DEFAULT? "inherit": "none"}">
                    ${map(options[optionContext.DEFAULT], (option, idx) =>
                        idx == this.optionIndex.BUTTON_VIBRATE && !this.app.canVibrate() ? html`` :
                            html`<li class="${this.selectedIdx == idx ? "selected" : ""}"}>
                            ${option}${idx == this.optionIndex.BUTTON_VIBRATE ? this.vibrateLevel : ""}</li>`)}
                </ul>
                <ul style="display:${this.optionContext === optionContext.DISK? "inherit": "none"}">
                    ${map(options[optionContext.DISK], (option, idx) =>
                        html`<li class="${this.selectedIdx == idx ? "selected" : ""}"}>${option}</li>`)}
                </ul>
            </div>
            <div class="netplay-summary">
                ${map(this.netplaySummary, player => {
                    const pingClass = player.ping < 100 ? "good" : player.ping < 200 ? "ok" : "bad";
                    const ping = (player.ping < 0)
                        ? html`<span class="ping-you">YOU</span>`
                        : html`<span class="ping-${pingClass}">${Math.ceil(player.ping)}ms</span>`;
                    return html`<div>PLAYER ${player.playerIdx >= 0 ? player.playerIdx+1 : "?"} ${ping}</div>`;
                })}
            </div>
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "wasm4-menu-overlay": MenuOverlay;
    }
}
