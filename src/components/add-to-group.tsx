import React from "react";
import { Heading, Text } from "grommet";
import AlgoliaGroupSearch, { IProps as IAlgoliaSearchProps } from "./algolia-group-search";

const AddToGroup: React.FC<IAlgoliaSearchProps> = props => {
  return (
    <>
      <Heading level={3} as="header" margin={{ bottom: "small" }}>
        Add to group
      </Heading>
      <Text color="dark-6" margin={{ bottom: "medium" }}>
        add this guest to group so that invitations and RSVPs are grouped rather than individual. Useful for families,
        or where one guest may not have an email saved - others in the group can rsvp on that persons behalf
      </Text>
      <AlgoliaGroupSearch {...props} />
    </>
  );
};

export default AddToGroup;
