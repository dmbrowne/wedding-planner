import React from "react";
import { AuthUi } from "./auth-ui";
import { action } from "@storybook/addon-actions";
import withAuth from "../../storybook/decorators/with-auth";

export default {
  title: "Components|Auth UI",
  component: AuthUi,
  decorators: [withAuth],
};

export const Story = () => <AuthUi onSuccess={action("onSuccess")} />;

Story.story = {
  name: "auth-ui",
};
