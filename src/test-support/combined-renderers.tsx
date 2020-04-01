import { ReactNode } from "react";
import { render } from "@testing-library/react";
import { withRedux } from "./redux";
import { withTheme } from "./theme";

export default function renderWithCombinedRenderers(renderUi: ReactNode) {
  const { ui: themedUi, theme } = withTheme(renderUi);
  const { ui, store } = withRedux(themedUi);

  return {
    ...render(ui),
    store,
    theme,
  };
}
