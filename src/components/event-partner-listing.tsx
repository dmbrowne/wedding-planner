import React, { useContext, useState } from "react";
import { useStateSelector } from "../store/redux";
import { Pulsar } from "gestalt";
import { distinctPartnerGroups } from "../selectors/selectors";
import { Box, Text, Button } from "grommet";
import Guest from "./guest";
import { firestore } from "firebase/app";
import { fetchEventGuestSuccess } from "../store/events";
import { useDispatch } from "react-redux";
import { IEventGuest } from "../store/types";
import { GuestsContext } from "./guests-context";
import { Add, Subtract } from "grommet-icons";

export const EventPartnerListing: React.FC<{ eventId: string }> = ({ eventId }) => {
  const dispatch = useDispatch();
  const weddingId = useStateSelector(state => state.activeWedding.wedding && state.activeWedding.wedding.id);
  const { numberOfGuests = 0, numberOfPlusOnes = 0 } = useStateSelector(state => state.events.eventsById[eventId]);
  const eventGuests = useStateSelector(state => state.events.eventGuests);
  const eventGuestIdsForEvent = useStateSelector(state => state.events.eventGuestsByEventId[eventId]);
  const { listenToDocumentRef } = useContext(GuestsContext);
  const guests = useStateSelector(state => state.guests.byId);
  const partners = useStateSelector(distinctPartnerGroups);
  const [showAllPartners, setShowAllPartners] = useState(false);
  const allEventGuestsFetched = eventGuestIdsForEvent && eventGuestIdsForEvent.length === numberOfGuests - numberOfPlusOnes;
  const desiredGuestsHaveBeenFetched =
    eventGuestIdsForEvent &&
    eventGuestIdsForEvent.every(eventGuestId => {
      const { guestId } = eventGuests[eventGuestId];
      return !!guests[guestId];
    });
  // const desiredGuestsHaveBeenFetched = Object.values(eventGuests).every(({ guestId }) => !!guests[guestId]);
  const loadAllPartners = () => {
    if (!allEventGuestsFetched) {
      firestore()
        .collection("eventGuests")
        .where("weddingId", "==", weddingId)
        .where("eventId", "==", eventId)
        .orderBy("name", "asc")
        .get()
        .then(querySnap => {
          console.info("huh");
          querySnap.docChanges().forEach(({ doc, type }) => {
            if (type === "added") {
              dispatch(fetchEventGuestSuccess({ id: doc.id, ...(doc.data() as IEventGuest) }));
              if (!guests[doc.data().guestId]) {
                const unsubscribe = listenToDocumentRef(doc.data().guestId);
                if (unsubscribe) unsubscribe();
              }
            }
          });
        });
    }
  };

  if (!!eventGuestIdsForEvent && !desiredGuestsHaveBeenFetched) return <Pulsar />;

  const expandButtonProps = {
    pad: "xsmall" as "xsmall",
    direction: "row" as "row",
    gap: "small" as "small",
    justify: "center" as "center",
    align: "center" as "center",
    background: "white" as "white",
    hoverIndicator: "light-1" as "light-1",
  };

  const expandButton = (
    <Button
      plain
      margin={{ vertical: "xsmall" }}
      onClick={() => {
        loadAllPartners();
        setShowAllPartners(true);
      }}
    >
      <Box {...expandButtonProps}>
        <Add size="small" color="brand" />
        <Text size="small" color="brand">
          Show all
        </Text>
      </Box>
    </Button>
  );

  const condenseButton = (
    <Button plain margin={{ vertical: "xsmall" }} onClick={() => setShowAllPartners(false)}>
      <Box {...expandButtonProps}>
        <Subtract size="small" color="brand" />
        <Text size="small" color="brand">
          Show less
        </Text>
      </Box>
    </Button>
  );

  const getListingButton = () => {
    if (allEventGuestsFetched && partners.length < 5) {
      return null;
    } else if (!showAllPartners) {
      return expandButton;
    } else if (showAllPartners) {
      return condenseButton;
    }
  };

  return (
    <>
      {!!partners.length && showAllPartners && getListingButton()}
      {partners.slice(0, !showAllPartners ? 5 : undefined).map(eventGuestTuple => {
        const showDisclaimer = eventGuestTuple.some(({ id }) => !!eventGuests[id].groupId);
        const nonGroupMsg = (name: string) => `Only invitations sent to ${name} will be addressed to this couple`;
        const groupMsg = (name: string) => `is part of a group, the invitation sent to ${name} will be addressed to everyone in that group`;
        return (
          <Box
            elevation="xsmall"
            background={{ color: "accent-2", opacity: "medium" }}
            round="xsmall"
            margin={{ vertical: "small" }}
            pad="small"
            key={`${eventGuestTuple[0].id}-${eventGuestTuple[1].id}`}
          >
            {eventGuestTuple.map(eventGuest => (
              <Guest key={eventGuest.guestId} id={eventGuest.guestId}>
                {({ guest }) => (
                  <Box>
                    <Text>{guest.name}</Text>
                    {showDisclaimer && (
                      <Text
                        margin={{ bottom: "small" }}
                        size="small"
                        color="dark-3"
                        children={!eventGuest.groupId ? nonGroupMsg(guest.name) : groupMsg(guest.name)}
                      />
                    )}
                  </Box>
                )}
              </Guest>
            ))}
          </Box>
        );
      })}
      {!!partners.length && getListingButton()}
    </>
  );
};
