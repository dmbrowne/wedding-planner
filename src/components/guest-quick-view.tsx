import React, { useState, useContext } from "react";
import { Layer, Box, Button } from "grommet";
import { Close } from "grommet-icons";
import { Avatar } from "gestalt";
import { IGuest } from "../store/types";
import EditBasicGuestDetails from "./edit-basic-guest-details";
import { GuestsContext } from "./guests-context";
import { QuickViewBasicDetails } from "./quick-view-basic-details";
import { QuickViewPartnerSection } from "./quick-view-partner-section";

const GuestQuickView: React.FC<{ guest: IGuest; onClose: () => void }> = ({ guest, onClose }) => {
  const [editMode, setEditMode] = useState(false);
  const { getDocumentRef, setCouple, unsetCouple } = useContext(GuestsContext);

  const onEditSubmit = (values: Partial<IGuest>) => {
    getDocumentRef(guest.id).update(values);
    setEditMode(false);
  };

  return (
    <Layer>
      <Box width="450px" height="450px" pad="medium" overflow="auto">
        <Box children={<Button icon={<Close />} alignSelf="end" onClick={onClose} />} />
        <Box width="100px" height={{ min: "100px" }} margin={{ horizontal: "auto" }}>
          <Avatar name={guest.name} />
        </Box>
        {editMode ? (
          <EditBasicGuestDetails {...guest} onSubmit={onEditSubmit} />
        ) : (
          <QuickViewBasicDetails {...guest} onEdit={() => setEditMode(true)} />
        )}
        <Box as="section" height={{ min: "auto" }}>
          <QuickViewPartnerSection guest={guest} onRemoveCouple={unsetCouple} onAddCouple={setCouple} />
        </Box>
      </Box>
    </Layer>
  );
};

export default GuestQuickView;
