import { LitElement, html, css } from "lit";
import { customElement, state } from 'lit/decorators.js';

@customElement("wasm4-notifications")
export class Notifications extends LitElement {
    static styles = css`
        :host {
            width: 100vmin;
            height: 100vmin;
            position: absolute;
            pointer-events: none;

            color: #fff;
            font: 24px wasm4-font;

            display: flex;
            flex-direction: column;
        }

        .notification {
            background: rgba(0, 0, 0, 0.85);
            padding: 0.5em;
            /* animation: appear 0.5s ease-out, disappear 0.5s 4.5s ease-in; */
            /* animation-fill-mode: forwards; */
            animation: appear 0.5s ease-out;
        }

        @keyframes appear {
            from {
                padding-left: 2em;
                opacity: 0;
            }
            to {
                opacity: 1;
                padding-left: 0.5em;
            }
        }

        /*@keyframes disappear {
            from {
                opacity: 1;
            }
            to {
                opacity: 0;
            }
        }*/
    `;

    @state() private notifications: string[] = [];

    show (text: string) {
        this.notifications = this.notifications.concat([text]);
        setTimeout(() => {
            this.notifications = this.notifications.slice(1);
        }, 5000);
    }

    render () {
        return this.notifications.map(text => html`<div class="notification">${text}</div>`);
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "wasm4-notifications": Notifications;
    }
}
