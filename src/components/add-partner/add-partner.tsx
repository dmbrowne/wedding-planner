import React, { FC } from "react";
import { Heading, Text } from "grommet";
import AlgoliaGuestSearch, { IProps as IAlgoliaSearchProps } from "../algolia-guest-search";
import { IGuest } from "../../store/types";
import { INewGuest } from "../../store/use-new-guests-reducer";

export interface IProps extends Pick<IAlgoliaSearchProps, "unsavedGuests" | "hideGuests"> {
  onSelectPartner: (guest: IGuest | INewGuest) => any;
}

/**
 * Search for guests using algolia. This component needs to access to the `<AlgoliaSearchKeyProvider />`, make sure it is included higher up in the app.
 */
export const AddPartner: FC<IProps> = ({ onSelectPartner, ...props }) => {
  return (
    <>
      <Heading level={3} as="header" margin={{ bottom: "small" }} children="Add partner" />
      <Text color="dark-6" margin={{ bottom: "medium" }} as="p">
        Search guests that currently don't have a partner, to select them as a partner
      </Text>
      <AlgoliaGuestSearch onSelect={guest => onSelectPartner(guest)} filters="hasPartner = 0" {...props} />
    </>
  );
};

export default AddPartner;
