import { css } from 'lit';

export const themeStyles = css`
  :host {
    --wasm4-devtools-bg-primary: #202020;
    --wasm4-devtools-bg-secondary: #444;
    --wasm4-devtools-text-primary: #fff;
    --wasm4-devtools-text-secondary: rgba(255, 255, 255, 0.7);
    --wasm4-devtools-text-size: 16px;

    font-family: Arial, Helvetica, sans-serif;
    color: var(--wasm4-devtools-text-primary);
    background-color: var(--wasm4-devtools-bg-primary);
    font-size: var(--wasm4-devtools-text-size);
  }

  .text-primary {
    color: var(--wasm4-devtools-text-primary) !important;
  }

  .text-secondary {
    color: var(--wasm4-devtools-text-secondary) !important;
  }

  .bg-primary {
    background-color: var(--wasm4-devtools-bg-primary) !important;
  }

  .bg-secondary {
    background-color: var(--wasm4-devtools-bg-secondary) !important;
  }
`;

export const resetCss = css`
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  section {
    padding: 0.2rem 0;
  }

  article {
    padding: 0.4rem 0;
  }

  ul {
    list-style: none;
    margin: 0;
    padding: 0.2rem 0;
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    margin: 0.3rem 0;
  }

  p {
    padding: 0;
  }

  [hidden] {
    display: none !important;
  }
`;
