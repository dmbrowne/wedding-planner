import React, { useState, useEffect } from "react";
import { IGuestGroup } from "../store/guest-groups";
import { Heading, Button, FormField, TextInput, Box, Text, Layer } from "grommet";
import { Edit, FormClose, FormCheckmark, Close } from "grommet-icons";
import EventGuest from "./event-guest";
import { useStateSelector } from "../store/redux";

interface IProps {
  guestGroup: IGuestGroup;
  onUpdateName: (val: string) => void;
  removeEventGuestFromGroup: (eventGuestId: string) => void;
  onDeleteGroup: () => void;
}

const GuestGroupModalContent: React.FC<IProps> = ({
  guestGroup,
  onUpdateName,
  removeEventGuestFromGroup,
  onDeleteGroup
}) => {
  const [groupName, setGroupName] = useState(guestGroup.name);
  const [editMode, setEditMode] = useState(false);
  const [editError, setEditError] = useState(false);

  useEffect(() => {
    setGroupName(guestGroup.name);
  }, [guestGroup.name]);

  const onChangeGroupName = (val: string) => {
    if (!val) setEditError(true);
    else setEditError(false);
    setGroupName(val);
  };

  const updateName = () => {
    onUpdateName(groupName);
    setEditMode(false);
  };
  return (
    <>
      {!editMode && (
        <>
          <Heading level={3} children={guestGroup.name} />
          <Button label="Change group name" icon={<Edit />} onClick={() => setEditMode(true)} />
        </>
      )}
      {editMode && (
        <>
          <FormField label="Group name" error={editError ? "A name is required" : undefined}>
            <TextInput
              value={groupName}
              onChange={e => onChangeGroupName(e.target.value)}
              placeholder="Enter a name for this group"
            />
          </FormField>
          <Box direction="row" justify="between">
            <Button label="Cancel" icon={<FormClose />} onClick={() => setEditMode(false)} />
            <Button label="Save" primary icon={<FormCheckmark />} onClick={updateName} />
          </Box>
        </>
      )}
      <Box margin={{ vertical: "small" }}>
        <Heading level={4} children="Members" margin={{ bottom: "small" }} />
        {guestGroup.memberIds.map(eventGuestId => (
          <EventGuest key={eventGuestId} id={eventGuestId}>
            {({ eventGuest }) => (
              <Box pad={{ vertical: "xsmall" }} direction="row" justify="between" align="center">
                <Text color="dark-3" children={eventGuest.name} />
                <Button plain onClick={() => removeEventGuestFromGroup(eventGuestId)}>
                  <Box pad="xxsmall" children={<Text size="small" color="status-critical" children="Remove" />} />
                </Button>
              </Box>
            )}
          </EventGuest>
        ))}
      </Box>

      <Button margin={{ vertical: "medium" }} color="status-critical" label="Delete group" onClick={onDeleteGroup} />
    </>
  );
};

interface IGroupModalProps extends Omit<IProps, "guestGroup"> {
  groupId: string;
  onClose: () => void;
}
const GuestGroupModal: React.FC<IGroupModalProps> = ({ groupId, onClose, ...props }) => {
  const group = useStateSelector(state => state.guestGroups.byId[groupId]);
  return (
    <Layer>
      <Box overflow="auto" width="500px" height="500px" pad="medium">
        <Button alignSelf="end" icon={<Close />} onClick={onClose} />
        <GuestGroupModalContent guestGroup={group} {...props} />
      </Box>
    </Layer>
  );
};

export default GuestGroupModal;
