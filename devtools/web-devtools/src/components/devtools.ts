import { html, LitElement } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { customElement } from 'lit/decorators.js';
import { UpdateController } from '../controllers/UpdateController';
import { Wasm4MemoryView } from '../events/update-completed';
import { createCloseDevtoolsEvent } from '../events/close-devtools';
import devtoolsCss from '../styles/devtools.scss';
import { withTheme } from '../styles/commons';

export const wasm4DevtoolsTagName = 'wasm4-devtools' as const;

/**
 * `<wasm4-devtools></wasm4-devtools>`
 */
@customElement(wasm4DevtoolsTagName)
export class Wasm4Devtools extends LitElement {
  private updateController = new UpdateController(this);

  static styles = withTheme(devtoolsCss);

  _handlePaletteClick = () => {
    navigator.clipboard.writeText;
  };

  _handleCloseButtonClick = () => {
    this.dispatchEvent(createCloseDevtoolsEvent());
  };

  renderMouse({ pointerPos, mouseButtons }: Wasm4MemoryView) {
    return html` <section class="mouse-section">
        <h4 class="heading">mouse position</h4>
        <ul class="mouse-pos-list">
          <li class="info-box mouse-pos">
            <span class="text-primary">x: ${pointerPos.x}</span>
          </li>
          <li class="info-box mouse-pos">
            <span class="text-primary">y: ${pointerPos.y}</span>
          </li>
        </ul>
      </section>
      <section>
        <h4 class="heading">mouse buttons</h4>
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
      </section>`;
  }

  render() {
    if (!this.updateController.state) {
      return null;
    }

    const { memoryView, fps } = this.updateController.state;

    return html`<article class="devtools-wrapper">
      <button
        type="button"
        aria-label="close"
        class="close-btn"
        @click=${this._handleCloseButtonClick}
      >
        &times;
      </button>
      ${this.renderMouse(memoryView)}<wasm4-palette
        .palette=${memoryView.palette}
      ></wasm4-palette>
      <section>
        <h4>fps</h4>
        <span>${fps}</span>
      </section>
    </article>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [wasm4DevtoolsTagName]: Wasm4Devtools;
  }
}
