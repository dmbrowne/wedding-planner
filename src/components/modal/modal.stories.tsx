import React, { ReactNode, useState } from "react";
import Modal from "./modal";
import { Text, Button } from "grommet";
import Center from "../../styled-components/storybook-components";

export default {
  title: "Components|Modal",
  component: Modal,
};

export const ToStorybook = () => {
  const [showModal, setShowModal] = useState(true);
  return (
    <div>
      <Button onClick={() => setShowModal(true)} label="show/hide modal" />
      {showModal && (
        <Modal title="Modal title" onClose={() => setShowModal(false)}>
          <Text>Modal content</Text>
        </Modal>
      )}
    </div>
  );
};

ToStorybook.story = {
  name: "image-upload",
  description: "description",
  decorators: [(storyFn: () => ReactNode) => <Center size="large">{storyFn()}</Center>],
};
