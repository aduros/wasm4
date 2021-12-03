import { html, LitElement } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { UpdateController } from '../../controllers/UpdateController';
import { Wasm4MemoryView } from '../../events/update-completed';
import { createCloseDevtoolsEvent } from '../../events/close-devtools';
import devtoolsCss from './devtools.scss';
import { withTheme } from '../../styles/commons';
import {
  SYSTEM_HIDE_GAMEPAD_OVERLAY,
  SYSTEM_PRESERVE_FRAMEBUFFER,
} from '../../constants';
import { repeat } from 'lit/directives/repeat.js';
import { identity } from '../../utils/functions';

export const wasm4DevtoolsTagName = 'wasm4-devtools' as const;

const tabs = ['general', 'controls', 'info'] as const;

/**
 * `<wasm4-devtools></wasm4-devtools>`
 */
@customElement(wasm4DevtoolsTagName)
export class Wasm4Devtools extends LitElement {
  private updateController = new UpdateController(this);

  static styles = withTheme(devtoolsCss);

  @state()
  _activeTab: string = tabs[0];

  _handleCloseButtonClick = () => {
    this.dispatchEvent(createCloseDevtoolsEvent());
  };

  _handleTabClick = (evt: MouseEvent) => {
    const tabValue = (evt.composedPath()[0] as HTMLElement)?.dataset.tabValue;
    if (tabValue) {
      this._activeTab = tabValue;
    }
  };

  private _renderGeneralView = (memoryView: Wasm4MemoryView, fps: number) => {
    const drawColors = memoryView.drawColors ?? 0;

    const mask = (to: number, from = 0) => ((1 << to) - 1) ^ ((1 << from) - 1);
    const color1Mask = mask(3);
    const color2Mask = mask(7, 3);
    const color3Mask = mask(11, 7);
    const color4Mask = mask(15, 11);

    return html`<article>
      <wasm4-palette
        palette-heading="palette"
        .palette=${memoryView.palette}
      ></wasm4-palette>
      <section>
        <h4>draw colors</h4>
        <table class="table">
          <thead>
            <tr>
              <th>color</th>
              <th>value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>${drawColors & color1Mask}</td>
            </tr>
            <tr>
              <td>2</td>
              <td>${drawColors & color2Mask}</td>
            </tr>
            <tr>
              <td>3</td>
              <td>${drawColors & color3Mask}</td>
            </tr>
            <tr>
              <td>4</td>
              <td>${drawColors & color4Mask}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td>sum</td>
              <td>${drawColors}</td>
            </tr>
          </tfoot>
        </table>
      </section>
      <section class="inline-section">
        <h4>fps</h4>
        <span class="info-box text-primary">${fps}</span>
      </section>
      <section class="flags-section">
        <h4>system flags</h4>
        <div class="flags-wrapper">
          <div>
            <span class="flag-label">preserve framebuffer</span>
            <span class="info-box text-primary"
              >${memoryView.systemFlags & SYSTEM_PRESERVE_FRAMEBUFFER}</span
            >
          </div>
          <div>
            <span class="flag-label">hide gamepad overlay</span>
            <span class="info-box text-primary"
              >${memoryView.systemFlags & SYSTEM_HIDE_GAMEPAD_OVERLAY}</span
            >
          </div>
        </div>
      </section>
    </article>`;
  };

  private _renderInfo = () => {
    return html` <wasm4-info-view></wasm4-info-view> `;
  };

  private _renderControls = (memoryView: Wasm4MemoryView, _: number) => {
    return html`<wasm4-controls-view
      .mouseButtons=${memoryView.mouseBtnByte}
      .mouseX=${memoryView.pointerPos.x}
      .mouseY=${memoryView.pointerPos.y}
      .gamepads=${memoryView.gamepads}
    ></wasm4-controls-view>`;
  };

  private _renderTab = (memoryView: Wasm4MemoryView, fps: number) => {
    let renderTab;
    switch (this._activeTab) {
      case 'controls':
        renderTab = this._renderControls;
        break;
      case 'info':
        renderTab = this._renderInfo;
        break;
      default:
        renderTab = this._renderGeneralView;
    }

    return renderTab.call(this, memoryView, fps);
  };

  render() {
    if (!this.updateController.state) {
      return null;
    }

    const { memoryView, fps } = this.updateController.state;

    return html`<div class="devtools-wrapper">
      <button
        type="button"
        aria-label="close"
        class="close-btn"
        @click=${this._handleCloseButtonClick}
      >
        &times;
      </button>
      <ul class="tabs" @click=${this._handleTabClick}>
        ${repeat(
          tabs,
          identity,
          (label) =>
            html`<li
              data-tab-value=${label}
              data-active=${Number(label === this._activeTab)}
              class="tab-item"
            >
              ${label}
            </li>`
        )}
      </ul>
      ${this._renderTab(memoryView, fps)}
    </div> `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [wasm4DevtoolsTagName]: Wasm4Devtools;
  }
}
