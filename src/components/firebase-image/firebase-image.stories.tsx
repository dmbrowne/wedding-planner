import React, { ReactNode } from "react";
import { FirebaseImageComponent } from "./firebase-image";
import { text } from "@storybook/addon-knobs";
import Center from "../../styled-components/storybook-components";

export default {
  title: "Components|Firebase Image",
  component: FirebaseImageComponent,
};

export const ToStorybook = () => (
  <FirebaseImageComponent imageRef={text("imageRef", "/weddings/3KA4zZTtS8XyAPh7Qx1C/cover")} children={imgSrc => <img src={imgSrc} />} />
);

ToStorybook.story = {
  name: "firebase-image",
  decorators: [(storyFn: () => ReactNode) => <Center>{storyFn()}</Center>],
};
