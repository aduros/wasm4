import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { withTheme } from '../../styles/commons';
import { classMap } from 'lit/directives/class-map.js';
import { MOUSE_LEFT, MOUSE_MIDDLE, MOUSE_RIGHT } from '../../constants';
import mouseButtonsCss from './mouse-buttons.scss?inline';

export const wasm4MouseTagName = 'wasm4-mouse-buttons';

/**
 * ### Programmatic usage
 * @example
 *
 * ```ts
 * import { wasm4MouseTagName } from '@wasm4/web-devtools';
 *
 * const elem = document.createElement(wasm4MouseTagName);
 *
 * document.body.appendChild(elem);
 * ```
 */
@customElement(wasm4MouseTagName)
export class Wasm4MouseButtons extends LitElement {
  static styles = withTheme(mouseButtonsCss);

  @property({ type: Boolean, reflect: true })
  middle = false;

  @property({ type: Boolean, reflect: true })
  right = false;

  @property({ type: Boolean, reflect: true })
  left = false;

  @property({ type: Number, reflect: true, attribute: 'raw-value' })
  rawValue = 0;

  @property({ type: String, reflect: true })
  heading = '';

  render() {
    const mouseButtons = {
      left: this.left || !!(this.rawValue & MOUSE_LEFT),
      middle: this.middle || !!(this.rawValue & MOUSE_MIDDLE),
      right: this.right || !!(this.rawValue & MOUSE_RIGHT),
    };

    return html`<section>
      ${this.heading && html`<h4 class="heading">${this.heading}</h4>`}
      <ul class="mouse-buttons">
        ${Object.entries(mouseButtons).map(
          ([btnKey, active]) =>
            html`<li
              class=${classMap({
                ['info-box']: 1,
                dim: !active,
                ['text-primary']: active,
              })}
            >
              ${btnKey}
            </li>`
        )}
      </ul>
    </section> `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [wasm4MouseTagName]: Wasm4MouseButtons;
  }
}
