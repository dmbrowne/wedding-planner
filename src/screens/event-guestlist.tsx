import React, { useState, ReactNode } from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableCell,
  Button,
  TableBody,
  Heading,
  Box,
  Layer,
  Text,
  CheckBox,
  Grommet
} from "grommet";
import { FormUp } from "grommet-icons";
import styled from "styled-components";
import { useMediaQuery } from "react-responsive";
import GuestlistPlusOneRow from "../components/guestlist-plus-one-row";
import GuestListAttendeeRow from "../components/guest-list-attendee-row";
import GuestlistAddAttendeesForm from "../components/guestlist-add-attendees-form";
import { RouteComponentProps } from "react-router-dom";
import { EventGuestsWatcher, PlusOnesWatcher } from "../components/events-watcher";
import { useStateSelector } from "../store/redux";
import { eventGuestsSelector } from "../selectors";
import { firestore } from "firebase";
import shortid from "shortid";
import { IPlusOneGuest, IGuest } from "../store/types";
import { Spinner, SegmentedControl } from "gestalt";
import { EventGuestModal } from "../components/event-guest-modal";
import { BulkRsvpEdit } from "../components/bulk-rsvp-edit";
import EventGuestListGuestsTable from "../components/event-guest-list-guests-table";

const SOuterWrap = styled(Box).attrs(() => ({ direction: "row", width: { max: "100%" }, fill: true }))`
  overflow: hidden;
`;

const SContentWrap = styled(Box).attrs(() => ({ fill: "vertical" }))`
  overflow: auto;
  flex: 1;
`;

const AddGuestsContainer: React.FC = ({ children }) => {
  const isLandscapeIPadOrHigher = useMediaQuery({ query: "(min-width: 1024px)" });
  return !isLandscapeIPadOrHigher ? (
    <Layer children={children} />
  ) : (
    <Box background="light-3" fill="vertical" pad={{ horizontal: "medium" }} basis="1/3" as="section">
      {children}
    </Box>
  );
};

const EventGuestlist: React.FC<RouteComponentProps<{ eventId: string; weddingId: string }>> = ({ match }) => {
  const { eventId, weddingId } = match.params;
  const event = useStateSelector(state => state.events.eventsById[eventId]);
  const servicesOrderedByDate =
    event &&
    event.services &&
    Object.entries(event.services)
      .map(([id, service]) => ({ ...service, id }))
      .sort((a, b) => (a.startDateTime < b.startDateTime ? -1 : 1));
  const eventGuests = useStateSelector(state => state.events.eventGuests);
  const plusOnes = useStateSelector(state => state.events.plusOnes);
  const [showAddGuestModal, setShowAddGuestModal] = useState(false);
  const [viewGuest, setViewGuest] = useState<((IGuest | IPlusOneGuest) & { isPlusOne: boolean }) | void>();
  const [checkedGuestIds, setCheckedGuestIds] = useState<Set<string>>(new Set());
  const [showBulkRsvp, setShowBulkRsvp] = useState(false);

  const rsvpRespond = (guestId: string, attending: boolean, serviceId?: string, isPlusOne?: boolean) => {
    firestore()
      .doc(`events/${eventId}`)
      .collection(isPlusOne ? "plusOnes" : "guests")
      .doc(guestId)
      .update(serviceId ? { [`rsvp.${serviceId}`]: attending } : { rsvp: attending });
  };

  const updatePlusOneName = (plusOneId: string, name: string) => {
    firestore()
      .doc(`events/${eventId}/plusOnes/${plusOneId}`)
      .update({ name });
  };

  const addGuestToEvent = (guestId: string, isPlusOne?: boolean) => {
    firestore()
      .doc(`events/${eventId}`)
      .collection(isPlusOne ? "plusOnes" : "guests")
      .doc(guestId)
      .set({
        eventId,
        weddingId
      });
  };

  const removeGuestFromEvent = (guestId: string, isPlusOne?: boolean) => {
    const db = firestore();

    if (isPlusOne) {
      const batch = db.batch();
      const plusOneRef = db.doc(`events/${eventId}/plusOnes/${guestId}`);
      const mainGuestRef = db.doc(`events/${eventId}/guests/${plusOnes[guestId].guestId}`);
      batch.update(mainGuestRef, { plusOnes: firestore.FieldValue.arrayRemove(guestId) });
      batch.delete(plusOneRef);
      return batch.commit();
    }

    return db.doc(`events/${eventId}/guests/${guestId}`).delete();
  };

  const addPlusOne = (guestId: string) => {
    const db = firestore();
    const batch = db.batch();
    const plusOneId = shortid.generate();
    const guestRef = db.doc(`events/${eventId}/guests/${guestId}`);
    const plusOneRef = db.doc(`events/${eventId}/plusOnes/${plusOneId}`);
    const plusOne: Omit<IPlusOneGuest, "id"> = { guestId, name: "", eventId, weddingId };
    batch.update(guestRef, { plusOnes: firestore.FieldValue.arrayUnion(plusOneId) });
    batch.set(plusOneRef, plusOne);
    batch.commit();
  };

  const onBulkRsvp = (attendance: { [serviceId: string]: boolean } | boolean) => {
    const db = firestore();
    const batch = db.batch();
    checkedGuestIds.forEach(guestId => {
      const isPlusOne = !!plusOnes[guestId];
      const ref = db.doc(`events/${eventId}/${isPlusOne ? "plusOnes" : "guests"}/${guestId}`);
      return batch.update(ref, { rsvp: attendance });
    });
    batch.commit().then(() => setShowBulkRsvp(false));
  };

  if (!event) {
    return <Spinner show accessibilityLabel="Loading event data and guestlist" />;
  }

  return (
    <EventGuestsWatcher eventId={eventId}>
      <PlusOnesWatcher eventId={eventId}>
        <SOuterWrap>
          <SContentWrap>
            <Box pad={{ horizontal: "medium" }}>
              <header>
                <Heading level={1} margin={{ bottom: "small" }} children="Guestlist" />
                <Heading level={2} size="small" color="dark-6" children="The Wedding" margin={{ top: "small" }} />
              </header>
              <Box height="40px" align="end">
                {!showAddGuestModal && <Button label="Add guests" primary onClick={() => setShowAddGuestModal(true)} />}
              </Box>
              <Box background="light-1" pad="xxsmall" margin={{ vertical: "small" }}>
                <SegmentedControl selectedItemIndex={0} onChange={() => {}} items={["All guests", "Groups"]} />
              </Box>
              <Button
                label="RSVP..."
                alignSelf="start"
                disabled={checkedGuestIds.size === 0}
                onClick={() => setShowBulkRsvp(true)}
              />
              <EventGuestListGuestsTable
                event={event}
                onViewGuest={(guest, isPlusOne) => setViewGuest({ ...guest, isPlusOne: !!isPlusOne })}
                onRemoveGuest={(id, isPlusOne) => removeGuestFromEvent(id, isPlusOne)}
                onAddPlusOne={guestId => addPlusOne(guestId)}
                compactMode={!!showAddGuestModal}
                selectedRows={checkedGuestIds}
                onSelectRows={setCheckedGuestIds}
              />
            </Box>
          </SContentWrap>
          {showAddGuestModal && (
            <AddGuestsContainer>
              <GuestlistAddAttendeesForm onAdd={addGuestToEvent} onClose={() => setShowAddGuestModal(false)} />
            </AddGuestsContainer>
          )}
        </SOuterWrap>
        {viewGuest && (
          <EventGuestModal
            removeGuest={() => {
              setViewGuest();
              removeGuestFromEvent(viewGuest.id, viewGuest.isPlusOne);
            }}
            onRemovePlusOne={plusOneId => removeGuestFromEvent(plusOneId, true)}
            onUpdatePlusOneName={updatePlusOneName}
            onClose={() => setViewGuest()}
            guest={viewGuest}
            onRsvp={({ serviceId, value, guestId }) => rsvpRespond(guestId, value, serviceId, viewGuest.isPlusOne)}
            onPlusOneRsvp={({ serviceId, value, guestId }) => rsvpRespond(guestId, value, serviceId, true)}
            {...(!!servicesOrderedByDate
              ? {
                  kind: "multi",
                  services: servicesOrderedByDate,
                  rsvp: (viewGuest.isPlusOne ? plusOnes[viewGuest.id].rsvp : eventGuests[viewGuest.id].rsvp) as {
                    [serviceId: string]: boolean;
                  }
                }
              : {
                  kind: "single",
                  rsvp: (viewGuest.isPlusOne ? plusOnes[viewGuest.id].rsvp : eventGuests[viewGuest.id].rsvp) as boolean
                })}
          />
        )}
        {showBulkRsvp && (
          <BulkRsvpEdit
            onClose={() => setShowBulkRsvp(false)}
            services={servicesOrderedByDate}
            onUpdate={onBulkRsvp}
            selectedGuestAmount={checkedGuestIds.size}
          />
        )}
      </PlusOnesWatcher>
    </EventGuestsWatcher>
  );
};

export default EventGuestlist;
