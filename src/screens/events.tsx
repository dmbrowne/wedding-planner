import React from "react";
import { Heading, Text, Box, Button, BoxProps } from "grommet";
import { AddCircle } from "grommet-icons";
import styled from "styled-components";
import { RouteComponentProps } from "react-router-dom";
import { format } from "date-fns";

import { ReactComponent as Cake } from "../icons/cake.svg";
import RoundedCard from "../components/rounded-card";
import { useStateSelector } from "../store/redux";
import { orderedEventsListSelector, getWeddingEventSelector } from "../selectors/selectors";
import theme from "../theme";
import SContainer from "../components/container";

const SEventCard = styled<React.FC<BoxProps & { large?: boolean }>>(RoundedCard).attrs(props => ({
  width: { max: props.large ? "924px" : "800px" },
  elevation: "xsmall",
  height: "auto",
  justify: typeof props.justify !== "undefined" ? props.justify : "center",
  pad: typeof props.pad !== "undefined" ? props.pad : "medium",
}))`
  width: 100%;
`;

const Events: React.FC<RouteComponentProps> = ({ history, match }) => {
  const goToEvent = (eventId: string) => history.push(`${match.url}/${eventId}`);
  const events = useStateSelector(orderedEventsListSelector);
  const weddingEvent = useStateSelector(getWeddingEventSelector);

  return (
    <SContainer>
      <Heading level={1}>Events</Heading>
      {!weddingEvent && (
        <Box margin={{ bottom: "large" }}>
          <Heading level={2} margin={{ bottom: "none" }} children="You haven't setup an event for the wedding yet..." />
          <Box direction="row" gap="medium">
            <Box height="160px" width="160px" style={{ opacity: 0.2 }} children={<Cake color={theme.global.colors.brand} />} />
            <Box justify="center">
              <Text>Add details for the big day</Text>
              <Button primary label="Start" onClick={() => history.push(match.url + "/create-wedding")} />
            </Box>
          </Box>
        </Box>
      )}
      {!!weddingEvent && (
        <SEventCard large direction="row" pad="none" justify="start" margin={{ bottom: "large" }} border={{ color: "accent-1" }}>
          <Box background="accent-1" pad="medium" width="125px" style={{ borderTopLeftRadius: 8, borderBottomLeftRadius: 8 }}>
            <Text textAlign="center" color="white">
              <strong>{format(weddingEvent.startDate.toDate(), "do MMM")}</strong>
            </Text>
            <Text textAlign="center" color="white">
              <strong>{format(weddingEvent.startDate.toDate(), "yyyy")}</strong>
            </Text>
          </Box>
          <Box pad="medium">
            <Button plain onClick={() => goToEvent(weddingEvent.id)}>
              <Heading level={3} as="header" children={weddingEvent.name} margin={{ bottom: "small" }} />
            </Button>
          </Box>
        </SEventCard>
      )}
      {events.map(event => (
        <Box key={event.id} direction="row" gap="medium" margin={{ vertical: "medium" }}>
          <Box
            background="white"
            elevation="medium"
            style={{ borderRadius: "50%" }}
            justify="center"
            align="center"
            width="100px"
            height="100px"
          >
            <Text textAlign="center">{format(event.startDate.toDate(), "do MMM yyyy")}</Text>
          </Box>
          <SEventCard>
            <Button plain onClick={() => goToEvent(event.id)}>
              <Heading level={2} as="header" size={event.main ? "medium" : "small"} color="brand" children={event.name} />
            </Button>
            {event.description && <Text margin={{ top: "small", bottom: "medium" }}>{event.description}</Text>}
          </SEventCard>
        </Box>
      ))}
      <SEventCard large>
        <Heading level={3} as="header" children="Add an event" margin={{ bottom: "small" }} />
        <Text color="dark-6" margin={{ top: "small", bottom: "medium" }}>
          Add an event to organise that's not the wedding, but part of the occassion (e.g. Bridal shower, Bachelorette party, Hen night,
          Stag party, pre-wedding drinks)
        </Text>
        <Button plain alignSelf="start" onClick={() => history.push(match.url + "/create")} icon={<AddCircle size="32px" />} />
      </SEventCard>
    </SContainer>
  );
};

export default Events;
