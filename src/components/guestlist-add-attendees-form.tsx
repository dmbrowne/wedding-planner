import React, { useContext, useEffect } from "react";
import { Box, Button, Text, Heading, InfiniteScroll } from "grommet";
import { Close } from "grommet-icons";
import { GuestsContext } from "./guests-context";
import { useStateSelector } from "../store/redux";
import { allGuestsListingSelector, uninvitedEventGuestsSelector } from "../selectors";

interface IProps {
  onClose: () => void;
  onAdd: (guestId: string) => void;
}

const GuestlistAddAttendeesForm: React.FC<IProps> = ({ onClose, onAdd }) => {
  const { loadMore, startWatch, unsubscribeGuestListingWatch } = useContext(GuestsContext);
  const uninvitedGuests = useStateSelector(uninvitedEventGuestsSelector);
  const guests = useStateSelector(allGuestsListingSelector);
  const hasMore = useStateSelector(state => state.guests.hasMore);

  useEffect(() => {
    const alreadyWatching = !!unsubscribeGuestListingWatch;
    if (!alreadyWatching) {
      startWatch();
    }
  }, []);

  return (
    <>
      <Box direction="row" as="header" align="center">
        <Button icon={<Close />} onClick={onClose} />
        <Heading level={2} children="Add Guest's" />
      </Box>
      <Box fill>
        <Box
          round
          height="80%"
          background="white"
          fill="horizontal"
          margin={{ bottom: "medium" }}
          overflow="auto"
          style={{ display: "block" }}
        >
          {!!guests.length ? (
            <InfiniteScroll items={uninvitedGuests} onMore={hasMore ? loadMore : undefined}>
              {guest => (
                <Box
                  pad="small"
                  hoverIndicator="light-1"
                  // background={idx % 2 ? "light-1" : "transparent"}
                  onClick={() => onAdd(guest.id)}
                >
                  <Text>{guest.name}</Text>
                </Box>
              )}
            </InfiniteScroll>
          ) : (
            <Box fill justify="center">
              <Text
                color="dark-2"
                textAlign="center"
                children={<em>All guests are currently added to this event</em>}
              />
            </Box>
          )}
        </Box>
        <Button label="Add" primary />
      </Box>
    </>
  );
};

export default GuestlistAddAttendeesForm;
