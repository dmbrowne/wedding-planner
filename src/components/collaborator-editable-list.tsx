import React, { useState } from "react";
import CollaboratorSelectList from "./collaborator-select-list";
import CollaboratorMiniAvatarList from "./collaborator-mini-avatar-list";
import { Button, Box } from "grommet";
import { Edit } from "grommet-icons";

const CollaboratorEditableList: React.FC<{ selectedIds: string[]; onSelect: (ids: string[]) => any }> = ({ selectedIds, onSelect }) => {
  const [editMode, setEditMode] = useState(false);

  const editListButton = (
    <Button plain onClick={() => setEditMode(true)}>
      <Box pad="xsmall" border={{ color: "dark-6", size: "small" }} background="light-3" round>
        <Edit />
      </Box>
    </Button>
  );

  return (
    <>
      {editMode ? (
        <CollaboratorSelectList selectedIds={selectedIds} onSelect={onSelect} onClose={() => setEditMode(false)} />
      ) : (
        <CollaboratorMiniAvatarList ids={selectedIds} children={editListButton} />
      )}
    </>
  );
};

export default CollaboratorEditableList;
