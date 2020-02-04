import React, { useState, useEffect } from "react";
import { EventGuestModalPlusOneName } from "./event-guest-modal-plus-one-name";
import { IPlusOneGuest } from "../store/types";
import { Box, Button, Grommet } from "grommet";
import { FormClose, FormCheckmark, Edit, Trash } from "grommet-icons";

interface IProps {
  plusOneGuest: IPlusOneGuest;
  onUpdateName: (name: string) => void;
  onDelete: () => void;
}
const EventGuestModalPlusOne: React.FC<IProps> = ({ onUpdateName, plusOneGuest, children, onDelete }) => {
  const [editModeIsActive, setEditModeIsActive] = useState(false);
  const [editedName, setEditedName] = useState(plusOneGuest.name || "");

  useEffect(() => setEditedName(plusOneGuest.name || ""), [plusOneGuest.name]);

  const updateName = () => {
    onUpdateName(editedName);
    setEditModeIsActive(false);
  };

  const deleteGuest = () => {
    const shouldDelete = window.confirm("Are you sure you want to remove this +1?");
    if (shouldDelete) onDelete();
  };

  return (
    <>
      <EventGuestModalPlusOneName
        editMode={editModeIsActive}
        name={plusOneGuest.name}
        inputValue={editedName}
        onChange={setEditedName}
      />
      {!editModeIsActive && children}
      <Grommet theme={{ text: { medium: { size: "14px" } } }}>
        <Box direction="row" justify="between" margin={{ vertical: "medium" }}>
          {editModeIsActive ? (
            <>
              <Button label="Cancel" icon={<FormClose />} onClick={() => setEditModeIsActive(false)} />
              <Button label="Update" primary icon={<FormCheckmark />} onClick={updateName} />
            </>
          ) : (
            <>
              <Button label="Remove" color="status-critical" icon={<Trash size="small" />} onClick={deleteGuest} />
              <Button label="Change name" icon={<Edit size="small" />} onClick={() => setEditModeIsActive(true)} />
            </>
          )}
        </Box>
      </Grommet>
    </>
  );
};

export default EventGuestModalPlusOne;
