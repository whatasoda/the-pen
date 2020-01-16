import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  html {
    height: 100%;
    font-family: 'Quantico', 'Kosugi', sans-serif;
    touch-action: none;
    user-select: none;
    background-color: #000;
  }
  * {
    margin: 0;
  }
`;

export default GlobalStyle;
