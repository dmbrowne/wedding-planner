import React from "react";
import { Heading, Text } from "grommet";
import AlgoliaGuestSearch, { IProps as IAlgoliaSearchProps } from "./algolia-guest-search";
import { IGuest } from "../store/types";

export interface IProps extends Pick<IAlgoliaSearchProps, "unsavedGuests" | "hideGuests"> {
  onSelectPartner: (guest: IGuest) => any;
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
