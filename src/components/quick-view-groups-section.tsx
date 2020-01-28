import React, { useState } from "react";
import { Box, Button, Text } from "grommet";
import { Close } from "grommet-icons";
import { IGuest } from "../store/types";
import AlgoliaGroupSearch from "./algolia-group-search";
import { QuickViewSectionHeading } from "./quick-view-section-heading";

interface IProps {
  guest: IGuest;
  onAddGroup: (groupId: string) => any;
  onRemoveGroup: (groupId: string) => any;
}

export const QuickViewGroupsSection: React.FC<IProps> = ({ guest, onAddGroup, onRemoveGroup }) => {
  const [editMode, setEditMode] = useState(false);
  return (
    <>
      <QuickViewSectionHeading
        title="Groups"
        showToggle={!!guest.groupIds && guest.groupIds.length > 0}
        onToggle={() => setEditMode(!editMode)}
        toggleLabel={editMode && guest.groupIds && guest.groupIds.length > 0 ? "close" : "edit"}
      />

      {editMode ? (
        <>
          <Box direction="row" align="start">
            <Box fill="horizontal">
              <AlgoliaGroupSearch selectedIds={guest.groupIds} onSelect={({ id }) => onAddGroup(id)} />
            </Box>
            <Button plain={undefined} margin={{ left: "xxsmall" }} onClick={() => setEditMode(false)}>
              <Box background="light-2" pad="small" children="Cancel" />
            </Button>
          </Box>
          {guest.groupIds &&
            guest.groupIds.map(groupId => (
              <Box background="light-2" pad="xsmall" direction="row" gap="small" align="center" alignSelf="start">
                <Text>{groupId}</Text>
                <Button plain={undefined} onClick={() => onRemoveGroup(groupId)}>
                  <Box pad={{ right: "xsmall" }} children={<Close size="small" />} />
                </Button>
              </Box>
            ))}
        </>
      ) : (
        <>
          {guest.groupIds && guest.groupIds.length ? (
            <Box direction="row" wrap>
              {guest.groupIds.map(groupId => (
                <Text key={groupId}>{groupId}</Text>
              ))}
            </Box>
          ) : (
            <Box direction="row" align="start">
              <Text size="small" color="dark-4" margin={{ right: "xxsmall" }} children="Not part of any groups, " />
              <Button plain onClick={() => setEditMode(true)} children={<Text size="small" children="add some?" />} />
            </Box>
          )}
        </>
      )}
    </>
  );
};
