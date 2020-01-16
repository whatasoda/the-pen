import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  html {
    height: 100%;
    touch-action: none;
    user-select: none;
  }
  * {
    margin: 0;
  }
`;

export default GlobalStyle;
