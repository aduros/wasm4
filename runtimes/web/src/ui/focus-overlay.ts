import { LitElement, html, css } from "lit";
import { customElement, property } from 'lit/decorators.js';

@customElement("wasm4-focus-overlay")
export class FocusOverlay extends LitElement {
    static styles = css`
        .play-button {
            box-sizing: border-box;
            display: block;
            transform: scale(4);
            width: 22px;
            height: 22px;
            border: 2px solid;
            border-radius: 20px;

            position: absolute;
            top: calc(50vmin - 11px);
            left: calc(50vmin - 11px);
        }
        .play-button::before {
            content: "";
            display: block;
            box-sizing: border-box;
            position: absolute;
            width: 0;
            height: 10px;
            border-top: 5px solid transparent;
            border-bottom: 5px solid transparent;
            border-left: 6px solid;
            top: 4px;
            left: 7px
        }

        .infobox {
            position: absolute;
            background: rgba(0,0,0,0.8);
            width: 100vmin;
            height: 100%;
            color: #fff;
            // padding: 20px;
            cursor: pointer;
        }
        .screenshot {
            width: 100%;
            height: 100%;
            image-rendering: pixelated;
            image-rendering: crisp-edges;
        }
    `;

    @property() screenshot: string;

    render () {
        return html`
            <div class="infobox">
                <span class="play-button"></span>
            </div>
            <img class="screenshot" src="${this.screenshot}"></img>
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "wasm4-focus-overlay": FocusOverlay;
    }
}
