import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { withTheme } from '../../styles/commons';
import gamepadCss from './gamepad.scss?inline';
import { classMap } from 'lit/directives/class-map.js';
import {
  BUTTON_X,
  BUTTON_Z,
  BUTTON_UP,
  BUTTON_DOWN,
  BUTTON_LEFT,
  BUTTON_RIGHT,
} from '../../constants';

export const wasm4GamepadTagName = 'wasm4-gamepad';

/**
 * ### Programmatic usage
 * @example
 *
 * ```ts
 * import { wasm4GamepadTagName } from '@wasm4/web-devtools';
 *
 * const elem = document.createElement(wasm4GamepadTagName);
 *
 * document.body.appendChild(elem);
 * ```
 */
@customElement(wasm4GamepadTagName)
export class Wasm4Gamepad extends LitElement {
  static styles = withTheme(gamepadCss);

  @property({ type: Boolean, reflect: true, attribute: 'action-1' })
  action1 = false;

  @property({ type: Boolean, reflect: true, attribute: 'action-2' })
  action2 = false;

  @property({ type: Boolean, reflect: true })
  up = false;

  @property({ type: Boolean, reflect: true })
  down = false;

  @property({ type: Boolean, reflect: true })
  left = false;

  @property({ type: Boolean, reflect: true })
  right = false;

  @property({ type: Number, reflect: true, attribute: 'raw-value' })
  rawValue = 0;

  render() {
    const up = this.up || !!(this.rawValue & BUTTON_UP);
    const down = this.down || !!(this.rawValue & BUTTON_DOWN);
    const left = this.left || !!(this.rawValue & BUTTON_LEFT);
    const right = this.right || !!(this.rawValue & BUTTON_RIGHT);
    const action1 = this.action1 || !!(this.rawValue & BUTTON_X);
    const action2 = this.action2 || !!(this.rawValue & BUTTON_Z);

    return html`<div class="gamepad">
      <div
        class="${classMap({
          'gamepad-dpad': 1,
          'pressed-right': right,
          'pressed-down': down,
          'pressed-left': left,
          'pressed-up': up,
        })}"
      ></div>
      <div class="gamepad-actions">
        <div
          class="${classMap({ 'gamepad-action1': 1, pressed: action1 })}"
        ></div>
        <div
          class="${classMap({ 'gamepad-action2': 1, pressed: action2 })}"
        ></div>
      </div>
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [wasm4GamepadTagName]: Wasm4Gamepad;
  }
}
