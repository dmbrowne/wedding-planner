import React from "react";
import { Box, Text, Heading } from "grommet";

const TableSeating = () => {
  return (
    <Box pad={{ horizontal: "medium" }}>
      <Heading level={1}>Table seating plan</Heading>
      <Text>Organise your guests for the wedding in to a seating plan</Text>

      <Heading level={2} margin={{ vertical: "xlarge" }} color="dark-4">
        Coming soon
      </Heading>
    </Box>
  );
};

export default TableSeating;
