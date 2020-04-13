import React from "react";
import { AddToGroupModal } from "./add-to-group-modal";
import { weddingId } from "../../storybook/default-options";
import { text } from "@storybook/addon-knobs";
import { ModalUiDisplay } from "../../styled-components/storybook-components";
import { action } from "@storybook/addon-actions";
import withRedux from "../../storybook/decorators/with-redux";

export default {
  title: "Components|Add to group modal",
  component: AddToGroupModal,
  decorators: [withRedux],
};

export const Story = () => (
  <ModalUiDisplay>
    {onClose => (
      <AddToGroupModal
        weddingId={text("weddingId", weddingId)}
        eventId={text("eventId", "384owie")}
        onClose={onClose}
        onSelect={action("onSelect")}
        getSelectedEventGuestIds={(...args) => {
          action("getSelectedEventGuestIds")(...args);
          return [];
        }}
      />
    )}
  </ModalUiDisplay>
);

Story.story = {
  name: "add-to-group-modal",
};
