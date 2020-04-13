import React from "react";
import { action } from "@storybook/addon-actions";
import { AddPartner } from "./add-partner";
import { AlgoliaSearchKeyProvider } from "../algolia-search-key";
import { text } from "@storybook/addon-knobs";
import withAuth from "../../storybook/decorators/with-auth";
import { weddingId } from "../../storybook/default-options";

export default {
  title: "Components|Add partner",
  component: AddPartner,
  subcomponents: {
    AlgoliaSearchKeyProvider: AlgoliaSearchKeyProvider,
  },
  decorators: [
    (storyFn: any) => <AlgoliaSearchKeyProvider weddingId={text("AlgoliaSearchKeyProvider weddingId", weddingId)} children={storyFn()} />,
    withAuth,
  ],
};

export const Component = () => <AddPartner onSelectPartner={action("onSelectPartner")} />;

Component.story = {
  name: "add-partner",
};
