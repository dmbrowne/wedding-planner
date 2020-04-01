import React from "react";
import Modal from "./modal";
import { Text } from "grommet";
import { ModalUiDisplay } from "../../styled-components/storybook-components";

export default {
  title: "Components|Modal",
  component: Modal,
};

export const ToStorybook = () => (
  <ModalUiDisplay>
    {onClose => (
      <Modal title="Modal title" onClose={onClose}>
        <Text>Modal content</Text>
      </Modal>
    )}
  </ModalUiDisplay>
);

ToStorybook.story = {
  name: "image-upload",
};
