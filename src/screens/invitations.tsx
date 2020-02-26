import React from "react";
import { Heading, Text, Box } from "grommet";

const Invitations = () => {
  return (
    <Box pad={{ horizontal: "medium" }}>
      <Heading level={1}>Invitations</Heading>
      <Text>Create separate invitations for other wedding events</Text>
      <Heading level={2} color="dark-4" margin={{ vertical: "xlarge" }}>
        Coming soon
      </Heading>
    </Box>
  );
};

export default Invitations;
