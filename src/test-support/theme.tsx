import React, { ReactNode } from "react";
import { render } from "@testing-library/react";
import { Grommet } from "grommet";
import theme from "../theme";
import { ThemeProvider } from "styled-components";

export function withTheme(children: ReactNode) {
  return {
    ui: (
      <ThemeProvider theme={theme}>
        <Grommet theme={theme}>{children}</Grommet>
      </ThemeProvider>
    ),
    theme,
  };
}

export function renderWithTheme<S = any>(ui: ReactNode) {
  const { ui: themedUI, theme } = withTheme(ui);
  return {
    ...render(themedUI),
    theme,
  };
}
