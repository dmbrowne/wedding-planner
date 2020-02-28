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

  const noCollaboratorsMsg = (
    <>
      <Heading level={6} as="header" children="No collaborators available" margin={{ top: "none" }} />
      <Text margin={{ bottom: "medium" }}>
        Cannot allow others to edit this event because you have not yet added any collaborators to your wedding.
      </Text>
      <Text size="small" color="dark-6" margin={{ bottom: "small" }}>
        To give someone else permission to edit this event, you must first give them access to collaborate on your wedding. You can do that
        in your wedding settings
      </Text>
      <Text size="small" color="dark-6">
        Once they have accepted your collaboration invite, you can then give them permission to collaborate on this event
      </Text>
    </>
  );

  return (
    <Box border={{ side: "horizontal" }} pad={{ bottom: "xsmall" }}>
      {!collaborators.length ? (
        noCollaboratorsMsg
      ) : (
        <>
          <Heading level={6} as="header" children="Select Collaborators" />
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
        </>
      )}
      <Button plain alignSelf="end" onClick={onClose}>
        <Box pad="xsmall" border={{ size: "small" }}>
          <Text size="small" children="Close" />
        </Box>
      </Button>
    </Box>
  );
};

export default CollaboratorSelectList;
