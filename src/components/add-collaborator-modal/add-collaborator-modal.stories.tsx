import React, { useState } from "react";
import { Button } from "grommet";
import { AddCollaboratorModal } from "./add-collaborator-modal";
import Modal from "../modal";

export default {
  title: "Components|Add Collaborator",
  component: AddCollaboratorModal,
  subcomponents: {
    Modal: Modal,
  },
};

export const ToStorybook = () => {
  const [showModal, setShowModal] = useState(true);
  return (
    <div>
      <Button onClick={() => setShowModal(true)} label="show/hide modal" />
      {showModal && <AddCollaboratorModal weddingId="1" onClose={() => setShowModal(false)} />}
    </div>
  );
};

ToStorybook.story = {
  name: "add-collaborator-modal",
};
