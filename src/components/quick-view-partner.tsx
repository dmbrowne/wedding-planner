import React from "react";
import { Box, Text } from "grommet";
import { Avatar } from "gestalt";
import Guest from "./guest";
import Tag from "./tag";

export const QuickViewPartner: React.FC<{
  partnerId: string;
  onRemovePartner: () => void;
  editMode: boolean;
}> = ({ partnerId, onRemovePartner, editMode }) => (
  <Guest id={partnerId}>
    {({ guest: partner }) => {
      return editMode ? (
        <Tag onDelete={onRemovePartner}>
          <Box direction="row" align="center">
            <Box width="30px" children={<Avatar name={partner.name} />} margin={{ right: "small" }} />
            <Text>{partner.name}</Text>
          </Box>
        </Tag>
      ) : (
        <Text color="dark-4">{partner.name}</Text>
      );
    }}
  </Guest>
);
