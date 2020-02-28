import React from "react";
import { weddingCollaboratorsOrderedByEmailSelector } from "../selectors/selectors";
import { useStateSelector } from "../store/redux";
import { Box, Text, CheckBox, Heading, Button } from "grommet";

interface IProps {
  selectedIds: string[];
  onSelect: (ids: string[]) => any;
  onClose: () => void;
}

const CollaboratorSelectList: React.FC<IProps> = ({ selectedIds, onSelect, onClose }) => {
  const collaborators = useStateSelector(weddingCollaboratorsOrderedByEmailSelector);

  const onCheck = (id: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = e.target;
    const updatedIds = [...selectedIds];
    if (!checked) {
      if (updatedIds.includes(id)) updatedIds.splice(updatedIds.indexOf(id), 1);
    } else {
      if (!updatedIds.includes(id)) updatedIds.push(id);
    }
    onSelect(updatedIds);
  };

  return (
    <Box border={{ side: "horizontal" }} pad={{ bottom: "xsmall" }}>
      <Heading level={6} as="header">
        Select Collaborators
      </Heading>
      <Box height={{ min: "100px", max: "200px" }} overflow="auto">
        {collaborators.map(collaborator => (
          <Box key={collaborator.id} margin={{ vertical: "small" }}>
            <CheckBox
              label={collaborator.name || collaborator.email}
              checked={selectedIds?.includes(collaborator.id)}
              onChange={onCheck(collaborator.id)}
            />
          </Box>
        ))}
      </Box>
      <Button plain alignSelf="end" onClick={onClose}>
        <Box pad="xsmall" border={{ size: "small" }}>
          <Text size="small" children="Close" />
        </Box>
      </Button>
    </Box>
  );
};

export default CollaboratorSelectList;
