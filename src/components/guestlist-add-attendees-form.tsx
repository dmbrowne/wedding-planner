import React, { useEffect } from "react";
import { Box, Button, Text, Heading, InfiniteScroll } from "grommet";
import { Close } from "grommet-icons";
import { useStateSelector } from "../store/redux";
import { uninvitedEventGuestsSelector } from "../selectors/selectors";
import { IGuest } from "../store/types";

interface IProps {
  onLoadMore: () => void;
  loadAllGuests: () => void;
  onClose: () => void;
  onAdd: (guest: IGuest) => void;
}

const GuestlistAddAttendeesForm: React.FC<IProps> = ({ onClose, onAdd, loadAllGuests, onLoadMore }) => {
  const uninvitedGuests = useStateSelector(uninvitedEventGuestsSelector);

  useEffect(() => {
    loadAllGuests();
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
          <InfiniteScroll items={uninvitedGuests} onMore={onLoadMore}>
            {(guest: IGuest) => (
              <Box key={guest.id} pad="small" hoverIndicator="light-1" onClick={() => onAdd(guest)}>
                <Text>{guest.name}</Text>
              </Box>
            )}
          </InfiniteScroll>
          {!uninvitedGuests.length && (
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
