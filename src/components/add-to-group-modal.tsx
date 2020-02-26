import React, { useState, useEffect } from "react";
import { Layer, Box, Heading, InfiniteScroll, Text, Button } from "grommet";
import { useStateSelector } from "../store/redux";
import { orderedGuestGroupsSelector } from "../selectors/selectors";
import AlgoliaGroupSearch, { IAlgoliaGuestGroup } from "./algolia-group-search";
import useGuestGroups from "../hooks/use-guest-groups";
import { IGuestGroup } from "../store/guest-groups";
import EventGuest from "./event-guest";
import { firestore } from "firebase/app";
import { Close, Add } from "grommet-icons";

interface IProps {
  weddingId: string;
  eventId: string;
  onSelect: (groupId: string, batch?: firestore.WriteBatch) => any;
  onClose: () => void;
  getSelectedEventGuestIds: () => string[];
}

const AddToGroupModal: React.FC<IProps> = ({ eventId, weddingId, onSelect, onClose, getSelectedEventGuestIds }) => {
  const { loadMore, unsubscribe } = useGuestGroups(eventId, weddingId);
  const guestGroups = useStateSelector(orderedGuestGroupsSelector);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<IAlgoliaGuestGroup[]>([]);

  const lowerCaseSearchResultGroupNames = searchResults.map(group => group.name.trim().toLowerCase());
  const exactGroupMatchFound = query && lowerCaseSearchResultGroupNames.includes(query.trim().toLowerCase());

  useEffect(() => unsubscribe, []);

  const createNewGuestGroupAndSelect = () => {
    const db = firestore();
    const batch = db.batch();
    const eventGuestIds = getSelectedEventGuestIds();
    const ref = db.collection(`events/${eventId}/guestGroups`).doc();
    batch.set(ref, { name: query, weddingId, memberIds: eventGuestIds });
    onSelect(ref.id, batch);
  };

  const addToExistingGroup = (groupId: string) => {
    const db = firestore();
    const batch = db.batch();
    const eventGuestIds = getSelectedEventGuestIds();
    const ref = db.doc(`events/${eventId}/guestGroups/${groupId}`);
    eventGuestIds.forEach(eventGuestId => {
      batch.update(ref, { memberIds: firestore.FieldValue.arrayUnion(eventGuestId) });
    });
    onSelect(ref.id, batch);
  };

  const addNewGroupButton = (
    <Button hoverIndicator="light-1" alignSelf="start" onClick={createNewGuestGroupAndSelect} active>
      <Box pad="xsmall" direction="row" align="center" gap="small">
        <Add size="small" />
        <Text size="small">Create group</Text>
      </Box>
    </Button>
  );

  const renderSearchResults = () => (
    <>
      {!exactGroupMatchFound && (
        <Box pad={{ vertical: "small" }}>
          <Text size="small" color="dark-3" margin={{ bottom: "small" }}>
            An exact match for '{query}' hasn't been found, create <strong>'{query}'</strong> and add the selected guests to it?
          </Text>
          {addNewGroupButton}
        </Box>
      )}
      {searchResults.map((group: IAlgoliaGuestGroup) => (
        <Box pad={{ vertical: "small" }} onClick={() => addToExistingGroup(group.id)} border="bottom">
          <Heading level={3} size="small" children={group.name} />
          {group.memberNames.map((name, idx) => {
            const isLastItem = idx === group.memberIds.length - 1;
            return <Text size="small" color="dark-6" children={name + isLastItem ? "" : ", "} />;
          })}
        </Box>
      ))}
    </>
  );

  const createNewGroupMessage = () => (
    <Box pad={{ vertical: "small" }}>
      <Text size="small" color="dark-3" margin={{ bottom: "small" }}>
        Cannot find any groups using the search terms provided, would you like to create a new group called '{query}' instead and add the
        selected guests to it?
      </Text>
      {addNewGroupButton}
    </Box>
  );

  const renderGroupsListing = () => (
    <Box height="large" overflow="auto">
      <InfiniteScroll items={guestGroups} onMore={loadMore}>
        {(group: IGuestGroup) => (
          <Box pad="small" onClick={() => addToExistingGroup(group.id)} border="bottom">
            <Heading level={4} size="small" as="header" children={group.name} />
            <Box direction="row" wrap gap="xxsmall">
              {group.memberIds.map((eventGuestId, idx) => {
                const isLastItem = idx === group.memberIds.length - 1;
                return (
                  <EventGuest key={eventGuestId} id={eventGuestId}>
                    {({ eventGuest }) => <Text size="small" color="dark-6" children={eventGuest.name + (isLastItem ? "" : ", ")} />}
                  </EventGuest>
                );
              })}
            </Box>
          </Box>
        )}
      </InfiniteScroll>
    </Box>
  );

  return (
    <Layer>
      <Box width="500px" height="500px" pad="medium">
        <Button icon={<Close />} onClick={onClose} alignSelf="end" />
        <Heading level={3}>Add to group...</Heading>
        <AlgoliaGroupSearch query={query} onChange={setQuery} onResult={setSearchResults} />
        {query ? (searchResults.length > 0 ? renderSearchResults() : createNewGroupMessage()) : renderGroupsListing()}
      </Box>
    </Layer>
  );
};

export default AddToGroupModal;
