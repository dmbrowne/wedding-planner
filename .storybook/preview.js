import React from "react";
import { addDecorator } from "@storybook/react";
import { withKnobs } from "@storybook/addon-knobs";
import { Grommet, Box } from "grommet";
import styled, { ThemeProvider } from "styled-components";
import metroTheme from "../src/theme";
import "../src/utils/firebase";
import "gestalt/dist/gestalt.css";

addDecorator(withKnobs);
addDecorator(storyFn => (
  <ThemeProvider theme={metroTheme}>
    <Grommet theme={metroTheme}>{storyFn()}</Grommet>
  </ThemeProvider>
));
