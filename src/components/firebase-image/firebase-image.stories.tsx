import React, { ReactNode } from "react";
import styled from "styled-components";
import FirebaseImageComponent from "./firebase-image";
import { text } from "@storybook/addon-knobs";

export default {
  title: "Components|Firebase Image",
  component: FirebaseImageComponent,
};

const Center = styled.div`
  width: 200px;
  height: 200px;
`;

export const Default = () => (
  <FirebaseImageComponent imageRef={text("imageRef", "/weddings/3KA4zZTtS8XyAPh7Qx1C/cover")} children={imgSrc => <img src={imgSrc} />} />
);

Default.story = {
  name: "firebase-image",
  decorators: [(storyFn: () => ReactNode) => <Center>{storyFn()}</Center>],
};
