import { unsafeCSS, CSSResult } from 'lit';
import resetCss from './reset.scss';
import themeCss from './theme.scss';

export const themeStyles = [resetCss, themeCss].map((css) => unsafeCSS(css));

export const withTheme = (...componentStyles: (CSSResult | string)[]) => {
  console.log(componentStyles);

  return themeStyles.concat(
    componentStyles.map((elem) =>
      typeof elem === 'string' ? unsafeCSS(elem) : elem
    )
  );
};
