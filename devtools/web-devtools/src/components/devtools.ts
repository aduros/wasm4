import { html, LitElement, unsafeCSS } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { customElement } from 'lit/decorators.js';
import { UpdateController } from '../controllers/UpdateController';
import { Wasm4MemoryView } from '../events/update-completed';
import { createCloseDevtoolsEvent } from '../events/close-devtools';
import { formatColor } from '../utils/format';
import resetCss from '../styles/reset.scss';
import themeCss from '../styles/theme.scss';
import devtoolsCss from '../styles/devtools.scss';

export const wasm4DevtoolsTagName = 'wasm4-devtools' as const;

/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
@customElement(wasm4DevtoolsTagName)
export class Wasm4Devtools extends LitElement {
  private updateController = new UpdateController(this);

  static styles: any[] = [resetCss, themeCss, devtoolsCss].map((cssTxt) =>
    unsafeCSS(cssTxt)
  );

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
            X: <span class="text-primary">${pointerPos.x}</span>
          </li>
          <li class="info-box mouse-pos">
            Y: <span class="text-primary">${pointerPos.y}</span>
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

  renderPalette({ palette }: Wasm4MemoryView) {
    return html`<section class="palette-article">
      <h3>Palette</h3>
      <div class="palette-view">
        ${palette.map((color) => {
          const colorHex = formatColor(color);

          const shouldInvertColor =
            ((color & 0xff) + ((color >> 8) & 0xff) + (color >> 16)) / 3 > 128;
          const colorLabelStyle = shouldInvertColor ? 'filter: invert(1)' : '';

          return html`<div
            class="color-box"
            data-color="${colorHex}"
            style="background: ${colorHex}"
          >
            <div style=${colorLabelStyle}>${colorHex}</div>
          </div>`;
        })}
      </div>
    </section>`;
  }

  render() {
    if (!this.updateController.state) {
      return null;
    }

    const { memoryView, fps } = this.updateController.state;

    return html`<article class="devtools-wrapper">
      <button type="button" aria-label="close" class="close-btn" @click=${this._handleCloseButtonClick}>
        &times;
      </button>
      ${this.renderMouse(memoryView)}${this.renderPalette(memoryView)}
      <section>
        <h4>Fps</h4>
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
