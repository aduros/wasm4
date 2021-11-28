import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { formatColor } from '../utils/format';
import paletteCss from '../styles/palette.scss';
import { withTheme } from '../styles/commons';

export const wasm4PaletteTagName = 'wasm4-palette' as const;

@customElement(wasm4PaletteTagName)
export class Wasm4Palette extends LitElement {
  @property({ type: Array })
  palette = [0, 0, 0, 0];

  @property({ type: String, attribute: 'palette-heading' })
  heading = 'palette';

  static styles = withTheme(paletteCss);

  render() {
    return html`<section class="palette-article">
      <h4>${this.heading}</h4>
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
