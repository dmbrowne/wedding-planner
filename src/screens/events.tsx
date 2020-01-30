import React from "react";
import { Heading, Text } from "grommet";
import RoundedCard from "../components/rounded-card";
import { AddCircle } from "grommet-icons";
import styled from "styled-components";
import { RouteComponentProps } from "react-router-dom";

const SEventCard = styled(RoundedCard).attrs({
  hoverIndicator: "light-1",
  width: { max: "800px" },
  elevation: "xsmall",
  height: "auto",
  margin: { vertical: "medium" },
  justify: "center",
  pad: "medium"
})``;

const Events: React.FC<RouteComponentProps> = ({ history, match }) => {
  const goToEvent = (eventId: string) => history.push(`${match.url}/${eventId}`);

  return (
    <>
      <Heading level={1}>Events</Heading>
      <SEventCard onClick={() => goToEvent("1234")}>
        <Heading level={3} size="large" as="header" color="neutral-3" children="The Wedding" />
        <Text margin={{ top: "small", bottom: "medium" }}>"The big day"</Text>
      </SEventCard>
      <SEventCard>
        <Heading level={3} as="header" children="Add an event" margin={{ bottom: "small" }} />
        <Text color="dark-6" margin={{ top: "small", bottom: "medium" }}>
          Add another event to organise that's a part of the wedding (e.g. Bridal shower, Bachelorette party, Hen night,
          Stag party, pre-wedding drinks)
        </Text>
        <AddCircle size="32px" />
      </SEventCard>
    </>
  );
};

export default Events;
