import React, { useState } from "react";
import { Box, Button, Text } from "grommet";
import { IGuest } from "../store/types";
import AlgoliaGuestSearch from "./algolia-guest-search";
import { QuickViewSectionHeading } from "./quick-view-section-heading";
import { QuickViewPartner } from "./quick-view-partner";

interface IProps {
  guest: IGuest;
  onRemoveCouple: (id1: string, id2: string) => any;
  onAddCouple: (id1: string, id2: string) => any;
}

export const QuickViewPartnerSection: React.FC<IProps> = ({ guest, onRemoveCouple, onAddCouple }) => {
  const [editMode, setEditMode] = useState(false);
  const onDeletePartner = (partnerId: string) => {
    onRemoveCouple(partnerId, guest.id);
    setEditMode(false);
  };
  return (
    <>
      <QuickViewSectionHeading
        title="Partner"
        showToggle={!!guest.partnerId}
        onToggle={() => setEditMode(!editMode)}
        toggleLabel={editMode ? "close" : "edit"}
      />
      {guest.partnerId ? (
        <QuickViewPartner
          partnerId={guest.partnerId}
          onRemovePartner={() => onDeletePartner(guest.partnerId as string)}
          editMode={editMode}
        />
      ) : editMode ? (
        <Box direction="row" align="start">
          <Box fill="horizontal">
            <AlgoliaGuestSearch
              filters="hasPartner = 0"
              onSelect={({ id }) => onAddCouple(id, guest.id)}
              hideGuests={[guest.id]}
            />
          </Box>
          <Button plain={undefined} margin={{ left: "xxsmall" }} onClick={() => setEditMode(false)}>
            <Box background="light-2" pad="small" children="Cancel" />
          </Button>
        </Box>
      ) : (
        <Box direction="row" align="start">
          <Text color="dark-4" size="small" margin={{ right: "xxsmall" }} children="No partner, " />
          <Button plain onClick={() => setEditMode(true)} children={<Text size="small" children="add one?" />} />
        </Box>
      )}
    </>
  );
};
