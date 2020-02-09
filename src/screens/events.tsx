import React from "react";
import { Heading, Text, Box } from "grommet";
import RoundedCard from "../components/rounded-card";
import { AddCircle } from "grommet-icons";
import styled from "styled-components";
import { RouteComponentProps } from "react-router-dom";
import { useStateSelector } from "../store/redux";
import { orderedEventsListSelector } from "../selectors/selectors";

const SEventCard = styled(RoundedCard).attrs({
  hoverIndicator: "light-1",
  width: { max: "800px" },
  elevation: "xsmall",
  height: "auto",
  margin: { vertical: "medium" },
  justify: "center",
  pad: "medium"
})``;

const SContainer = styled(Box)`
  display: block;
`;

const Events: React.FC<RouteComponentProps> = ({ history, match }) => {
  const goToEvent = (eventId: string) => history.push(`${match.url}/${eventId}`);
  const events = useStateSelector(orderedEventsListSelector);

  return (
    <SContainer pad={{ horizontal: "medium" }}>
      <Heading level={1}>Events</Heading>
      <SEventCard>
        <Heading level={3} as="header" children="Add an event" margin={{ bottom: "small" }} />
        <Text color="dark-6" margin={{ top: "small", bottom: "medium" }}>
          Add another event to organise that's a part of the wedding (e.g. Bridal shower, Bachelorette party, Hen night,
          Stag party, pre-wedding drinks)
        </Text>
        <AddCircle size="32px" />
      </SEventCard>
      {events.map(event => (
        <SEventCard key={event.id} onClick={() => goToEvent(event.id)}>
          <Heading level={2} as="header" size={event.main ? "medium" : "small"} color="neutral-3">
            {event.name}
          </Heading>
          {event.description && <Text margin={{ top: "small", bottom: "medium" }}>{event.description}</Text>}
        </SEventCard>
      ))}
    </SContainer>
  );
};

export default Events;
