import { html, LitElement } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { UpdateController } from '../../controllers/UpdateController';
import { createCloseDevtoolsEvent } from '../../events/close-devtools';
import devtoolsCss from './devtools.scss';
import { withTheme } from '../../styles/commons';
import {
  SYSTEM_HIDE_GAMEPAD_OVERLAY,
  SYSTEM_PRESERVE_FRAMEBUFFER,
} from '../../constants';
import { repeat } from 'lit/directives/repeat.js';
import { bitmask, identity } from '../../utils/functions';
import { MemoryView } from '../../models/MemoryView';

export const wasm4DevtoolsTagName = 'wasm4-devtools' as const;

const tabs = ['general', 'controls', 'mem', 'info'] as const;

/**
 * `<wasm4-devtools></wasm4-devtools>`
 */
@customElement(wasm4DevtoolsTagName)
export class Wasm4Devtools extends LitElement {
  private updateController = new UpdateController(this);

  static styles = withTheme(devtoolsCss);

  @state()
  private _expanded = true;

  @state()
  private _activeTab: typeof tabs[number] = tabs[0];

  _handleCloseButtonClick = () => {
    this.dispatchEvent(createCloseDevtoolsEvent());
  };

  _handleTabClick = (evt: MouseEvent) => {
    const tabValue = (evt.composedPath()[0] as HTMLElement)?.dataset.tabValue;
    if (tabs.includes(tabValue as any)) {
      this._activeTab = tabValue as typeof tabs[number];
    }
  };

  private _toggleExapanded = () => {
    this._expanded = !this._expanded;
  };

  private _renderGeneralView = (memoryView: MemoryView, fps: number) => {
    const drawColors = memoryView.drawColors ?? 0;
    const colorMasks = [
      bitmask(3),
      bitmask(7, 3),
      bitmask(11, 7),
      bitmask(15, 11),
    ];

    return html`<article>
      <wasm4-palette
        palette-heading="palette"
        .palette=${memoryView.palette}
      ></wasm4-palette>
      <section>
        <h4>draw colors</h4>
        <table class="table text-align-right">
          <thead>
            <tr>
              <th>color</th>
              <th>value</th>
            </tr>
          </thead>
          <tbody>
            ${repeat(
              colorMasks,
              identity,
              (colorMask, idx) => html`<tr>
                <td class="text-align-center">${idx + 1}</td>
                <td>${drawColors & colorMask}</td>
              </tr>`
            )}
          </tbody>
          <tfoot>
            <tr>
              <td class="text-align-center">sum</td>
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

  private _renderControls = (memoryView: MemoryView, _: number) => {
    return html`<wasm4-controls-view
      .mouseButtons=${memoryView.mouseBtnByte}
      .mouseX=${memoryView.pointerPos.x}
      .mouseY=${memoryView.pointerPos.y}
      .gamepads=${memoryView.gamepads}
    ></wasm4-controls-view>`;
  };

  private _renderMemory = (memoryView: MemoryView, _: number) => {
    return html`<wasm4-memory-view
      .memoryView=${memoryView}
    ></wasm4-memory-view>`;
  };

  private _renderTab = (memoryView: MemoryView, fps: number) => {
    let renderTab;
    switch (this._activeTab) {
      case 'controls':
        renderTab = this._renderControls;
        break;
      case 'info':
        renderTab = this._renderInfo;
        break;
      case 'mem':
        renderTab = this._renderMemory;
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

    return html`<div class="fixed-wrapper">
      <div class="devtools-wrapper bg-primary">
        <div class="devtools-top">
          <div class="devtools-top-btn">
            <button
              type="button"
              aria-label="collapse"
              class="top-btn"
              title="collapse"
              @click=${this._toggleExapanded}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M0 0h24v24H0V0z" fill="none" />
                <path d="M6 19h12v2H6v-2z" />
              </svg>
            </button>
            <button
              type="button"
              aria-label="close"
              class="top-btn"
              title="close"
              @click=${this._handleCloseButtonClick}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M0 0h24v24H0V0z" fill="none" />
                <path
                  d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"
                />
              </svg>
            </button>
          </div>
        </div>
        <div ?hidden=${!this._expanded}>
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
        </div>
      </div>
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [wasm4DevtoolsTagName]: Wasm4Devtools;
  }
}
