import React from "react";
import { addons } from "@storybook/addons";
import { useChannel, useAddonState } from "@storybook/api";
import { STORY_CHANGED } from "@storybook/core-events";
import { AddonPanel } from "@storybook/components";
import ReactJson from "react-json-view";

const StatePanel = () => {
  const [storeState, setStoreState] = useAddonState(null);
  const emit = useChannel({
    "withRedux/store-loaded": ({ state }) => setStoreState({ ...state }),
  });
  return <>{!!storeState && <ReactJson src={storeState} />}</>;
};

// Register the addon with a unique name.
addons.register("weddingPlanner/withRedux", api => {
  // Also need to set a unique name to the panel.
  addons.addPanel("weddingPlanner/withRedux/statePanel", {
    title: "Redux state",
    render: ({ active, key }) => (
      <AddonPanel key={key} active={active}>
        <StatePanel />
      </AddonPanel>
    ),
  });
});
