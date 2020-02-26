import React, { useState, useEffect, useContext } from "react";
import { Button, Heading, Box, Layer } from "grommet";
import styled from "styled-components";
import { useMediaQuery } from "react-responsive";
import { RouteComponentProps } from "react-router-dom";
import { firestore } from "firebase/app";
import { Spinner, SegmentedControl } from "gestalt";

import { useStateSelector } from "../store/redux";
import { IPlusOneGuest, IGuest, IEventGuest } from "../store/types";
import GuestlistAddAttendeesForm from "../components/guestlist-add-attendees-form";
import { EventGuestModal } from "../components/event-guest-modal";
import { BulkRsvpEdit } from "../components/bulk-rsvp-edit";
import EventGuestListGuestsTable from "../components/event-guest-list-guests-table";
import EventGroupsListing from "../components/event-groups-listing";
import { eventGuestsSelector, ungroupedGuestsSelector } from "../selectors/selectors";
import useEventGuests from "../hooks/use-event-guests";
import { useWatchTopFiveDocuments, useWatchAllDocuments } from "../hooks/use-guest-groups";
import AddToGroupModal from "../components/add-to-group-modal";
import { GuestsContext } from "../components/guests-context";
import { Group } from "grommet-icons";
import { IGuestGroup } from "../store/guest-groups";

const SOuterWrap = styled(Box).attrs(() => ({ direction: "row", width: { max: "100%" }, fill: true }))`
  overflow: hidden;
`;

const SContentWrap = styled(Box).attrs(() => ({ fill: "vertical", pad: { bottom: "large" } }))`
  display: block;
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
  const db = firestore();
  const tabs = ["All guests", "Groups"] as ["All guests", "Groups"];
  const { eventId, weddingId } = match.params;
  const guestContext = useContext(GuestsContext);
  const eventGuestActions = useEventGuests(weddingId, eventId);
  const event = useStateSelector(state => state.events.eventsById[eventId]);
  const eventGuests = useStateSelector(state => state.events.eventGuests);
  const plusOnes = useStateSelector(state => state.events.plusOnes);
  const invitedGuests = useStateSelector(eventGuestsSelector);
  const ungroupedGuests = useStateSelector(ungroupedGuestsSelector);
  const [activeTab, setActiveTab] = useState(0);
  const [showAddGuestModal, setShowAddGuestModal] = useState(false);
  const [viewGuest, setViewGuest] = useState<{ eventGuestId: string; isPlusOne: boolean } | void>();
  const [checkedGuestIds, setCheckedGuestIds] = useState<Set<string>>(new Set());
  const [groupTabCheckedGuestIds, setGroupTabCheckedGuestIds] = useState<Set<string>>(new Set());
  const [showBulkRsvp, setShowBulkRsvp] = useState(false);
  const [allGuestsFetched, setAllGuestsFetched] = useState(false);
  const [allEventGuestsFetched, setAllEventGuestsFetched] = useState(false);
  const [showAddToGroupModal, setShowAddToGroupModal] = useState(false);
  const [groupsListingState, setGroupsListingState] = useState<"full" | "short" | "initial">("initial");
  const topFiveGroups = useWatchTopFiveDocuments(eventId, weddingId);
  const allGroups = useWatchAllDocuments(eventId, weddingId);

  const servicesOrderedByDate =
    event && event.services
      ? Object.entries(event.services)
          .map(([id, service]) => ({ ...service, id }))
          .sort((a, b) => (a.startDate < b.startDate ? -1 : 1))
      : undefined;

  useEffect(() => eventGuestActions.unsubscribe, []);
  useEffect(() => {
    return () => {
      if (topFiveGroups.unsubscribe) topFiveGroups.unsubscribe();
      if (allGroups.unsubscribe) allGroups.unsubscribe();
    };
  }, []);
  useEffect(() => {
    if (tabs[activeTab] === "Groups" && groupsListingState === "initial") {
      topFiveGroups.listen().then(() => setGroupsListingState("short"));
    }
  }, [activeTab]);

  const loadAllGuests = () => {
    if (!allGuestsFetched) {
      guestContext.fetchAllGuests();
      setAllGuestsFetched(true);
    }
    if (!allEventGuestsFetched) {
      eventGuestActions.loadAllDocuments();
      setAllEventGuestsFetched(true);
    }
  };

  const onAddGuestModalLoadMore = () => {
    guestContext.loadMore();
    eventGuestActions.loadMore();
  };

  const rsvpRespond = (eventGuestId: string, attending: boolean, serviceId?: string, isPlusOne?: boolean) => {
    const guestRef = isPlusOne ? db.doc(`events/${eventId}/plusOnes/${eventGuestId}`) : db.doc(`eventGuests/${eventGuestId}`);

    guestRef.update(serviceId ? { [`rsvp.${serviceId}`]: attending } : { rsvp: attending });
  };

  const updatePlusOneName = (plusOneId: string, name: string) => {
    firestore()
      .doc(`events/${eventId}/plusOnes/${plusOneId}`)
      .update({ name });
  };

  const addGuestToEvent = (guest: IGuest) => {
    db.collection("eventGuests").add({
      guestId: guest.id,
      name: guest.name,
      eventId,
      weddingId,
    });
  };

  const removeGuestFromEvent = (eventGuestId: string, isPlusOne?: boolean) => {
    if (isPlusOne) {
      const batch = db.batch();
      const plusOneRef = db.doc(`events/${eventId}/plusOnes/${eventGuestId}`);
      const mainGuestRef = db.doc(`eventGuests/${plusOnes[eventGuestId].mainEventGuestId}`);
      batch.update(mainGuestRef, { plusOnes: firestore.FieldValue.arrayRemove(eventGuestId) });
      batch.delete(plusOneRef);
      return batch.commit();
    }

    const guestPlusOneIds = eventGuests[eventGuestId].plusOnes;
    if (guestPlusOneIds) {
      const batch = db.batch();
      guestPlusOneIds.forEach(plusOneId => batch.delete(db.doc(`events/${eventId}/plusOnes/${plusOneId}`)));
      batch.delete(db.doc(`eventGuests/${eventGuestId}`));
      return batch.commit();
    }

    return db.doc(`eventGuests/${eventGuestId}`).delete();
  };

  const addPlusOne = (eventGuestId: string) => {
    const batch = db.batch();
    const plusOneRef = db.collection(`events/${eventId}/plusOnes`).doc();
    const guestRef = db.doc(`eventGuests/${eventGuestId}`);
    const plusOne: Omit<IPlusOneGuest, "id"> = { mainEventGuestId: eventGuestId, name: "", eventId, weddingId };
    batch.update(guestRef, { plusOnes: [plusOneRef.id] });
    batch.set(plusOneRef, plusOne);
    batch.commit();
  };

  const onBulkRsvp = (attendance: { [serviceId: string]: boolean } | boolean) => {
    const batch = db.batch();
    checkedGuestIds.forEach(guestId => {
      const isPlusOne = !!plusOnes[guestId];
      const ref = db.doc(`events/${eventId}/${isPlusOne ? "plusOnes" : "guests"}/${guestId}`);
      return batch.update(ref, { rsvp: attendance });
    });
    batch.commit().then(() => setShowBulkRsvp(false));
  };

  type OnRSVPArgs = { serviceId?: string; value: boolean; eventGuestId: string };

  const getEventGuestModalProps = ({ eventGuestId, isPlusOne }: { eventGuestId: string; isPlusOne: boolean }) => ({
    eventGuest: isPlusOne
      ? { ...(plusOnes[eventGuestId] as IPlusOneGuest), isPlusOne: true as true }
      : { ...(eventGuests[eventGuestId] as IEventGuest), isPlusOne: false as false },
    removeGuest: () => (setViewGuest(), removeGuestFromEvent(eventGuestId, isPlusOne)),
    onRemovePlusOne: (plusOneId: string) => removeGuestFromEvent(plusOneId, true),
    onUpdatePlusOneName: updatePlusOneName,
    onClose: () => setViewGuest(),
    onRsvp: ({ serviceId, value }: OnRSVPArgs) => rsvpRespond(eventGuestId, value, serviceId, isPlusOne),
    onPlusOneRsvp: ({ serviceId, value, eventGuestId: plusOneId }: OnRSVPArgs) => rsvpRespond(plusOneId, value, serviceId, true),
    rsvp: isPlusOne ? (plusOnes[eventGuestId].rsvp as any) : (eventGuests[eventGuestId].rsvp as any),
  });

  const getCheckedEventGuests = () => {
    const eventGuestIds: string[] = [];
    const checkedIds = tabs[activeTab] === "Groups" ? groupTabCheckedGuestIds : checkedGuestIds;
    checkedIds.forEach(id => {
      if (!plusOnes[id]) eventGuestIds.push(id);
    });
    return eventGuestIds;
  };

  const addGroupToEventGuests = (batch?: firestore.WriteBatch) => (groupId: string) => {
    const eventGuestIds = getCheckedEventGuests();
    const batchOp = batch || firestore().batch();
    eventGuestIds.forEach(eventGuestId => {
      batchOp.update(firestore().doc(`eventGuests/${eventGuestId}`), { groupId });
    });
    batchOp.commit();
    setShowAddToGroupModal(false);
  };

  const removeEventGuestFromGroup = (eventGuestId: string, groupId: string) => {
    const batch = db.batch();
    batch.update(db.doc(`eventGuests/${eventGuestId}`), { groupId: null });
    batch.update(db.doc(`events/${eventId}/guestGroups/${groupId}`), {
      memberIds: firestore.FieldValue.arrayRemove(eventGuestId),
    });
    batch.commit();
  };

  const onChangeGroupsListingMode = (mode: "full" | "short") => {
    if (mode === "full" && groupsListingState === "short") {
      if (topFiveGroups.unsubscribe) topFiveGroups.unsubscribe();
      allGroups.listen();
    } else if (mode === "short" && groupsListingState === "full") {
      if (allGroups.unsubscribe) allGroups.unsubscribe();
      topFiveGroups.listen();
    }
  };

  const updateGroupName = (groupId: string, val: string) => {
    firestore()
      .doc(`events/${eventId}/guestGroups/${groupId}`)
      .update({ name: val });
  };

  const deleteGroup = (groupId: string) => {
    db.runTransaction(transaction => {
      return transaction.get(db.doc(`events/${eventId}/guestGroups/${groupId}`)).then(groupSnap => {
        const memberIds = (groupSnap.data() as IGuestGroup).memberIds;
        transaction.delete(groupSnap.ref);
        memberIds.forEach(id => {
          transaction.update(db.doc(`eventGuests/${id}`), { groupId: null });
        });
      });
    }).catch(e => console.log(e));
  };

  if (!event) {
    return <Spinner show accessibilityLabel="Loading event data and guestlist" />;
  }

  return (
    <>
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
              <SegmentedControl selectedItemIndex={activeTab} onChange={({ activeIndex: idx }) => setActiveTab(idx)} items={tabs} />
            </Box>
            {tabs[activeTab] === "All guests" && (
              <>
                <Button
                  label="RSVP..."
                  alignSelf="start"
                  disabled={checkedGuestIds.size === 0}
                  onClick={() => setShowBulkRsvp(true)}
                  margin={{ bottom: "small" }}
                />
                <EventGuestListGuestsTable
                  event={event}
                  guests={invitedGuests}
                  onViewGuest={(eventGuestId, isPlusOne) => setViewGuest({ eventGuestId, isPlusOne: !!isPlusOne as any })}
                  onRemoveGuest={(id, isPlusOne) => removeGuestFromEvent(id, isPlusOne)}
                  onAddPlusOne={guestId => addPlusOne(guestId)}
                  compactMode={!!showAddGuestModal}
                  selectedRows={checkedGuestIds}
                  onSelectRows={setCheckedGuestIds}
                  onLoadMore={eventGuestActions.loadMore}
                />
              </>
            )}
            {tabs[activeTab] === "Groups" && (
              <>
                <EventGroupsListing
                  onUpdateGroupName={updateGroupName}
                  eventId={eventId}
                  onChangeGroupListingMode={onChangeGroupsListingMode}
                  groupListMode={groupsListingState}
                  removeEventGuestFromGroup={removeEventGuestFromGroup}
                  onDeleteGroup={groupId => deleteGroup(groupId)}
                />
                <Box margin={{ vertical: "medium" }}>
                  <Heading level={3}>Ungrouped guests</Heading>
                  <Button
                    label="Add to group..."
                    alignSelf="start"
                    icon={<Group />}
                    disabled={groupTabCheckedGuestIds.size === 0}
                    onClick={() => setShowAddToGroupModal(true)}
                    margin={{ bottom: "small" }}
                  />
                  <EventGuestListGuestsTable
                    columns={["checkbox", "attendance", "name", ...(showAddGuestModal ? [] : ["email"]), "remove"]}
                    event={event}
                    guests={ungroupedGuests}
                    onViewGuest={(eventGuestId, isPlusOne) => setViewGuest({ eventGuestId, isPlusOne: !!isPlusOne as any })}
                    onRemoveGuest={id => removeGuestFromEvent(id)}
                    compactMode={!!showAddGuestModal}
                    selectedRows={groupTabCheckedGuestIds}
                    onSelectRows={setGroupTabCheckedGuestIds}
                    hideHeader={true}
                    hidePlusOnes={true}
                  />
                </Box>
              </>
            )}
          </Box>
        </SContentWrap>
        {showAddGuestModal && (
          <AddGuestsContainer>
            <GuestlistAddAttendeesForm
              loadAllGuests={loadAllGuests}
              onLoadMore={onAddGuestModalLoadMore}
              onAdd={addGuestToEvent}
              onClose={() => setShowAddGuestModal(false)}
            />
          </AddGuestsContainer>
        )}
      </SOuterWrap>
      {viewGuest &&
        (event.allowRsvpPerService && servicesOrderedByDate ? (
          <EventGuestModal {...getEventGuestModalProps(viewGuest)} kind="multi" services={servicesOrderedByDate} />
        ) : (
          <EventGuestModal {...getEventGuestModalProps(viewGuest)} kind="single" services={servicesOrderedByDate} />
        ))}
      {showBulkRsvp && (
        <BulkRsvpEdit
          onClose={() => setShowBulkRsvp(false)}
          services={servicesOrderedByDate}
          onUpdate={onBulkRsvp}
          selectedGuestAmount={checkedGuestIds.size}
        />
      )}
      {showAddToGroupModal && (
        <AddToGroupModal
          weddingId={weddingId}
          eventId={eventId}
          getSelectedEventGuestIds={getCheckedEventGuests}
          onSelect={(groupId, batch) => addGroupToEventGuests(batch)(groupId)}
          onClose={() => setShowAddToGroupModal(false)}
        />
      )}
    </>
  );
};

export default EventGuestlist;
