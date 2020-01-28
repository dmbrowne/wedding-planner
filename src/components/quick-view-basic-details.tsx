import React from "react";
import { Button, Text } from "grommet";
import { Edit } from "grommet-icons";
import { IGuest } from "../store/types";

interface IProps extends IGuest {
  onEdit: () => void;
}

export const QuickViewBasicDetails: React.FC<IProps> = ({ onEdit, ...guest }) => (
  <>
    <Text size="xlarge" alignSelf="center" margin={{ vertical: "xsmall" }}>
      <strong>{guest.preferredName || guest.name}</strong>
    </Text>
    {guest.preferredName && (
      <Text alignSelf="center" margin={{ vertical: "xsmall" }}>
        {guest.name}
      </Text>
    )}
    <Button label="Edit" icon={<Edit />} alignSelf="center" margin={{ vertical: "xsmall" }} onClick={onEdit} />
  </>
);
