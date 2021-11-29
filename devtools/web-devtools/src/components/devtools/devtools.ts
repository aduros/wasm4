import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import { UpdateController } from '../../controllers/UpdateController';
import { Wasm4MemoryView } from '../../events/update-completed';
import { createCloseDevtoolsEvent } from '../../events/close-devtools';
import devtoolsCss from './devtools.scss';
import { withTheme } from '../../styles/commons';
import {
  SYSTEM_HIDE_GAMEPAD_OVERLAY,
  SYSTEM_PRESERVE_FRAMEBUFFER,
} from '../../constants';

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

  renderMouse({ pointerPos, mouseBtnByte }: Wasm4MemoryView) {
    return html`<section class="mouse-section">
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
      <wasm4-mouse-buttons
        heading="mouse buttons"
        raw-value=${mouseBtnByte}
      ></wasm4-mouse-buttons>`;
  }

  render() {
    if (!this.updateController.state) {
      return null;
    }

    const { memoryView, fps } = this.updateController.state;
    const { systemFlags } = memoryView;

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
        palette-heading="palette"
        .palette=${memoryView.palette}
      ></wasm4-palette>
      <section class="fps-section">
        <h4>fps</h4>
        <span class="info-box text-primary">${fps}</span>
      </section>
      <section class="flags-section">
        <h4>system flags</h4>
        <div class="flags-wrapper">
          <div>
            <span class="flag-label">preserve framebuffer</span>
            <span class="info-box text-primary"
              >${systemFlags & SYSTEM_PRESERVE_FRAMEBUFFER}</span
            >
          </div>
          <div>
            <span class="flag-label">hide gamepad overlay</span>
            <span class="info-box text-primary"
              >${systemFlags & SYSTEM_HIDE_GAMEPAD_OVERLAY}</span
            >
          </div>
        </div>
      </section>
      <section>
        <h4>gamepad</h4>
        <wasm4-gamepad raw-value=${memoryView.gamepads[0] ?? 0}></wasm4-gamepad>
      </section>
    </article>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [wasm4DevtoolsTagName]: Wasm4Devtools;
  }
}
