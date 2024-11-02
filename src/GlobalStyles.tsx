import { createGlobalStyle } from "styled-components";
import reset from "styled-reset";

const GlobalStyles = createGlobalStyle`
  ${reset}
  /* ここに追加したいグローバルCSSを記述する */
  button { border: none; }

  button:focus { outline: none; }
`;

export default GlobalStyles;
