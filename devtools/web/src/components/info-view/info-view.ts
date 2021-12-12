import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { withTheme } from '../../styles/commons';
import { repeat } from 'lit/directives/repeat.js';

export const wasm4InfoTagName = 'wasm4-info-view';

interface Keybinding {
  key: string;
  description: string;
}

interface Link {
  label: string;
  href: string;
}

const keybindings: Keybinding[] = [
  { key: '2', description: 'Save state' },
  { key: '4', description: 'Load state' },
  { key: 'R', description: 'Reboot cartridge' },
  { key: 'F8', description: 'Open devtools' },
  { key: 'F9', description: 'Take screenshot' },
  { key: 'F10', description: 'Record 4 second video' },
  { key: 'F11', description: 'Fullscreen' },
];

const links: Link[] = [
  { label: 'website', href: 'https://wasm4.org/' },
  { label: 'docs', href: 'https://wasm4.org/docs' },
  { label: 'github', href: 'https://github.com/aduros/wasm4' },
];

/**
 * ### Programmatic usage
 * @example
 * 
 * ```ts
 * import { wasm4InfoTagName } from '@wasm4/web-devtools';
 * 
 * const elem = document.createElement(wasm4InfoTagName));
 * document.body.appendChild(elem);
 * ```
 */
@customElement(wasm4InfoTagName)
export class Wasm4InfoView extends LitElement {
  static styles = withTheme();

  @property({ type: String, reflect: true })
  heading = '';

  render() {
    return html`
      <article class="bg-primary" part="root-view">
        ${this.heading && html`<h3 class="heading">${this.heading}</h3>`}
        <section>
          <h4>Links</h4>
          <ul class="list">
            ${repeat(
              links,
              ({ href }) => href,
              ({ href, label }) =>
                html`<li>
                  <a target="_blank" rel="noopener" href=${href}>${label}</a>
                </li>`
            )}
          </ul>
        </section>
        <section>
          <h4>Keybindings</h4>
          <table class="table">
            <thead>
              <tr>
                <th>Key</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              ${repeat(
                keybindings,
                ({ key }) => key,
                ({ key, description }: Keybinding) =>
                  html`<tr>
                    <td>${key}</td>
                    <td>${description}</td>
                  </tr>`
              )}
            </tbody>
          </table>
        </section>
      </article>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [wasm4InfoTagName]: Wasm4InfoView;
  }
}
