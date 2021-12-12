import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { formatColor } from '../../utils/format';
import paletteCss from './palette.scss';
import { withTheme } from '../../styles/commons';

export const wasm4PaletteTagName = 'wasm4-palette' as const;

/**
 * ### Programmatic usage
 * @example
 * 
 * ```ts
 * import { wasm4PaletteTagName } from '@wasm4/web-devtools';
 * 
 * const elem = document.createElement(wasm4PaletteTagName);
 * elem.palette = [0xfff6d3, 0xf9a875, 0xeb6b6f, 0x7c3f58];
 * 
 * document.body.appendChild(elem);
 * ```
 */
@customElement(wasm4PaletteTagName)
export class Wasm4Palette extends LitElement {
  @property({ type: Array })
  palette = [0, 0, 0, 0];

  @property({ type: String, attribute: 'palette-heading' })
  heading = '';

  static styles = withTheme(paletteCss);

  render() {
    return html`<section class="palette-article">
      ${this.heading && html`<h4>${this.heading}</h4>`}
      <div class="palette-grid">
        ${this.palette.slice(0, 4).map((color) => {
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
}

declare global {
  interface HTMLElementTagNameMap {
    [wasm4PaletteTagName]: Wasm4Palette;
  }
}
