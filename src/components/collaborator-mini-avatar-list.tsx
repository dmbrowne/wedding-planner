import React from "react";
import { useStateSelector } from "../store/redux";
import { Avatar, Tooltip } from "gestalt";
import { Box } from "grommet";

const CollaboratorMiniAvatarList: React.FC<{ ids: string[] }> = ({ ids, children }) => {
  const collaborators = useStateSelector(state => state.activeWedding.collaborators);
  return (
    <Box direction="row" gap="xsmall" wrap>
      {ids.map(id => (
        <Tooltip key={id} text={collaborators[id].name || collaborators[id].email} {...({ inline: true } as any)}>
          <Avatar name={collaborators[id].name || collaborators[id].email} size="md" />
        </Tooltip>
      ))}
      {children}
    </Box>
  );
};

export default CollaboratorMiniAvatarList;
