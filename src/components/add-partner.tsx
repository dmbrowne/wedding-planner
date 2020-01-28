import React from "react";
import { Heading, Text } from "grommet";
import AlgoliaGuestSearch, { IProps as IAlgoliaSearchProps } from "./algolia-guest-search";
import { IGuest } from "../store/types";
import { INewGuest } from "../store/use-new-guests-reducer";

export interface IProps extends Pick<IAlgoliaSearchProps, "unsavedGuests" | "hideGuests"> {
  onSelectPartner: (guest: IGuest | INewGuest) => any;
}

const AddPartner: React.FC<IProps> = ({ onSelectPartner, ...props }) => {
  return (
    <>
      <Heading level={3} as="header" margin={{ bottom: "small" }}>
        Add partner / +1
      </Heading>
      <Text color="dark-6" margin={{ bottom: "medium" }}>
        Search guests that currently don't have a partner, to select them as a partner or +1
      </Text>
      <AlgoliaGuestSearch onSelect={guest => onSelectPartner(guest)} filters="hasPartner = 0" {...props} />
    </>
  );
};

export default AddPartner;
