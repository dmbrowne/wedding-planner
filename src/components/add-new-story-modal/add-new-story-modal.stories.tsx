import React from "react";
import { AddNewStoryModal } from "./add-new-story-modal";
import { ModalUiDisplay } from "../../styled-components/storybook-components";
import withRedux from "../../storybook/decorators/with-redux";

export default {
  title: "Components|Add new story modal",
  component: AddNewStoryModal,
  decorators: [withRedux],
};

export const Component = () => <ModalUiDisplay>{onClose => <AddNewStoryModal onClose={onClose} onSubmit={() => {}} />}</ModalUiDisplay>;

Component.story = {
  name: "add-new-story-modal",
};
