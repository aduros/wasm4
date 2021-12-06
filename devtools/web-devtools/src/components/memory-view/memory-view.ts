import { html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { createRef, Ref, ref } from 'lit/directives/ref.js';
import { MemoryView } from '../../models/MemoryView';
import { withTheme } from '../../styles/commons';
import { formatHex } from '../../utils/format';
import { range, renderHexRow } from '../../utils/functions';
import memoryViewCss from './memory-view.scss';

export const wasm4MemoryViewTagName = 'wasm4-memory-view';

const canvasLen = 256;
const maxFirstRowValue = 65520;

interface HexEditorFormState {
  values: {
    firstRow: number;
  };
}

const colorFormula = 'b = (byte & 0xf) << 4; g = (byte & 0xf0)';

/**
 * A custom element that renders a memory map and a simple hex editor view.
 * 
 * @example
 * 
 * ```ts
 * import { wasm4MemoryViewTagName } from '@wasm4/web-devtools';
 * const elem = document.createElement(wasm4MemoryViewTagName);
 * 
 * elem.memoryView = { ... };
 * document.body.appendChild(elem);
 * ```
 */
@customElement(wasm4MemoryViewTagName)
export class Wasm4MemoryView extends LitElement {
  static styles = withTheme(memoryViewCss);

  @property({ type: String, reflect: true })
  heading = '';

  @property({ type: Object, reflect: false })
  memoryView: MemoryView | null = null;

  @state()
  hexEditor: HexEditorFormState = {
    values: {
      firstRow: 0,
    },
  };

  private _hexViewFirstRow = range(0, 16)
    .map((n) => formatHex(n))
    .join(' ');

  private memoryCanvasRef: Ref<HTMLCanvasElement> = createRef();
  private imageData: ImageData = new ImageData(canvasLen, canvasLen);

  private _animationFrameRequestId = 0;

  private _paintMemoryCanvas = () => {
    const ctx = this.memoryCanvasRef.value?.getContext('2d');
    const memoryView = this.memoryView;

    if (!memoryView || !ctx) {
      return;
    }

    ctx.clearRect(0, 0, canvasLen, canvasLen);

    for (let i = 0, len = this.imageData.data.byteLength; i < len; i += 4) {
      const greyColor = memoryView.getUint8(i / 4);
      const green = greyColor & 0xf0;
      const blue = (greyColor & 0xf) << 4;

      this.imageData.data[i] = 0;
      this.imageData.data[i + 1] = green;
      this.imageData.data[i + 2] = blue;
      this.imageData.data[i + 3] = 255;
    }

    ctx.putImageData(this.imageData, 0, 0);
  };

  private _handleHexEditorChange(evt: InputEvent) {
    const target = evt.composedPath()[0] as HTMLInputElement;

    if (target.name === 'firstRow') {
      const nextFirstRow = Number(target.value);

      if (
        Number.isFinite(nextFirstRow) &&
        nextFirstRow % 16 === 0 &&
        nextFirstRow >= 0 &&
        nextFirstRow <= maxFirstRowValue
      ) {
        if (nextFirstRow !== this.hexEditor.values.firstRow) {
          this.hexEditor = {
            ...this.hexEditor,
            values: {
              ...this.hexEditor.values,
              firstRow: nextFirstRow,
            },
          };
        }
      }
    }
  }

  private _renderHexView(memoryView: MemoryView | null) {
    if (!memoryView) {
      return;
    }

    const { firstRow } = this.hexEditor.values;

    const rowOffsets = range(0, 8).map((rowId) => firstRow + rowId * 16);

    const rows = rowOffsets
      .filter((rowId) => rowId <= maxFirstRowValue)
      .map((rowId) => renderHexRow(memoryView, rowId));

    const formattedRange = `${formatHex(firstRow, 4)} - ${formatHex(
      firstRow + 16 * rows.length - 1,
      4
    )}`;

    return html`
      <section>
        <h4>hex view</h4>
        <form @input=${this._handleHexEditorChange} class="hex-form">
          <div class="form-group">
            <input
              id="hex-view-first-row"
              name="firstRow"
              type="number"
              min="0"
              max=${maxFirstRowValue}
              step="16"
            /><label for="hex-view-first-row">range: ${formattedRange}</label>
          </div>
        </form>
        <div class="hex-view">
          <div class="hex-header">${this._hexViewFirstRow}</div>
          ${rows.map((row) => html`<div>${row}</div>`)}
        </div>
      </section>
    `;
  }

  firstUpdated() {
    this._animationFrameRequestId = window.requestAnimationFrame(
      this._paintMemoryCanvas
    );
  }

  updated(changedProperties: Map<string, unknown>) {
    if (changedProperties.has('memoryView')) {
      this._animationFrameRequestId = window.requestAnimationFrame(
        this._paintMemoryCanvas
      );
    }
  }

  // Clean up rAF requests that have not been executed yet.
  disconnectedCallback() {
    if (this._animationFrameRequestId) {
      window.cancelAnimationFrame(this._animationFrameRequestId);
      this._animationFrameRequestId = 0;
    }
  }

  render() {
    return html`<article class="bg-primary" part="root-view">
      <section class="memory-map-wrapper">
        <h4>wasm memory (64KiB)</h4>
        <canvas
          width=${canvasLen}
          height=${canvasLen}
          class="memory-map"
          ${ref(this.memoryCanvasRef)}
        ></canvas>
        <div class="color-formula">${colorFormula}</div>
      </section>
      ${this._renderHexView(this.memoryView)}
    </article>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [wasm4MemoryViewTagName]: Wasm4MemoryView;
  }
}
