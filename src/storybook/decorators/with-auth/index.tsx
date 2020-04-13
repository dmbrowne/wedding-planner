import React from "react";
import { makeDecorator } from "@storybook/addons";
import { AuthProvider } from "../../../components/auth-context";

export default makeDecorator({
  name: "withAuth",
  parameterName: "auth",
  skipIfNoParametersOrOptions: false,
  wrapper: (getStory, context) => {
    return <AuthProvider>{getStory(context)}</AuthProvider>;
  },
});
