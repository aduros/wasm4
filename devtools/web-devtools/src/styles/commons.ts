import { unsafeCSS, CSSResult } from 'lit';
import resetCss from './reset.scss';
import themeCss from './theme.scss';

export const themeStyles = [resetCss, themeCss].map((css) => unsafeCSS(css));

export function withTheme(
  ...componentStyles: (CSSResult | string)[]
): CSSResult[] {
  return themeStyles.concat(
    componentStyles.map((elem) =>
      typeof elem === 'string' ? unsafeCSS(elem) : elem
    )
  );
}
