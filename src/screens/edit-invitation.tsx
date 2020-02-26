import React from "react";
import { Heading, Text } from "grommet";
import SContainer from "../components/container";

const EditInvitation = () => {
  return (
    <SContainer>
      <Heading level={1}>Event name</Heading>
      <Text>Edit invitation for events other than the main wedding</Text>
    </SContainer>
  );
};

export default EditInvitation;
