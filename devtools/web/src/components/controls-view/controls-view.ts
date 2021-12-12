import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { withTheme } from '../../styles/commons';

export const wasm4ControlsViewTagName = 'wasm4-controls-view';

/**
 * ### Programmatic usage
 * @example
 *
 * ```ts
 * import { wasm4ControlsViewTagName } from '@wasm4/web-devtools';
 *
 * const elem = document.createElement(wasm4ControlsViewTagName);
 *
 * document.body.appendChild(elem);
 * ```
 */
@customElement(wasm4ControlsViewTagName)
export class Wasm4ControlsView extends LitElement {
  static styles = withTheme();

  @property({ type: Number })
  mouseButtons = 0;

  @property({ type: Array })
  gamepads = [0, 0, 0, 0];

  @property({ type: Number })
  mouseX = 0;

  @property({ type: Number })
  mouseY = 0;

  @property({ type: String, reflect: true })
  heading = '';

  render() {
    return html`<article class="bg-primary" part="root-view">
      ${this.heading && html`<h3 class="heading">${this.heading}</h3>`}
      <section class="mouse-section">
        <h4 class="heading">mouse position</h4>
        <ul class="mouse-pos-list">
          <li class="info-box mouse-pos">
            <span class="text-primary">x: ${this.mouseX}</span>
          </li>
          <li class="info-box mouse-pos">
            <span class="text-primary">y: ${this.mouseY}</span>
          </li>
        </ul>
      </section>
      <wasm4-mouse-buttons
        heading="mouse buttons"
        raw-value=${this.mouseButtons}
      ></wasm4-mouse-buttons>
      ${this.gamepads.map(
        (gamepad, idx) =>
          html`<section>
            <h4>gamepad ${idx + 1}</h4>
            <wasm4-gamepad raw-value=${gamepad}></wasm4-gamepad>
          </section>`
      )}
    </article>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [wasm4ControlsViewTagName]: Wasm4ControlsView;
  }
}
