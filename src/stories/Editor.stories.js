import React from "react";
import Editor from "../components/editor";
import theme from "../theme";
import { Grommet } from "grommet";

export default {
  title: "Editor",
  component: Editor,
};

export const Simple = () => (
  <Grommet theme={theme}>
    <Editor />
  </Grommet>
);
Simple.story = { name: "Simple" };
