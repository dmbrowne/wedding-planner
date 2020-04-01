import React from "react";
import addons, { makeDecorator } from "@storybook/addons";
import store from "../../store/redux";
import { Provider } from "react-redux";

export default makeDecorator({
  name: "withRedux",
  parameterName: "myParameter",
  // This means don't run this decorator if the notes decorator is not set
  skipIfNoParametersOrOptions: false,
  wrapper: (getStory, context, { parameters }) => {
    const channel = addons.getChannel();

    // Our API above sets the notes parameter to a string,
    // which we send to the channel
    channel.emit("withRedux/store-loaded", { store, state: store.getState() });
    // we can also add subscriptions here using channel.on('eventName', callback);

    return <Provider store={store}>{getStory(context)}</Provider>;
  },
});
