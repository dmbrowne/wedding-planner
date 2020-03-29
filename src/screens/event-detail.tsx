import React from "react";
import { Heading, Box, Text, Button, BoxProps } from "grommet";
import styled from "styled-components";
import RoundedCard from "../components/rounded-card";
import { AddCircle, FormNextLink, SettingsOption } from "grommet-icons";
import { matchPath } from "react-router";
import { RouteComponentProps } from "react-router-dom";
import { useStateSelector } from "../store/redux";
import { Spinner, Tooltip } from "gestalt";
import { orderMapByChildKey } from "../utils";
import { orderedAmenitiesSelector } from "../selectors/selectors";
import { IEvent } from "../store/types";
import AuthenticatedRoute from "../components/authenticated-route";
import EventSettings from "./event-settings";

const Container = styled(Box).attrs({ vertical: "medium" })`
  display: block;
`;

const SHorizontalScrollContainer = styled(Box).attrs({ wrap: false, direction: "row", pad: { right: "medium" } })`
  overflow: auto;
`;
const SHorizontalScrollItem = styled<any>(Box).attrs((props: any) => ({
  margin: props.first ? { left: "medium", right: "small" } : props.last ? { right: "medium", left: "small" } : { horizontal: "small" },
}))`
  flex: 0 0 auto;
`;

type TSectionHeading = { title: string } & ({ onClick?: () => void; buttonLabel?: string } | { onClick: () => void; buttonLabel: string });

const SectionHeading: React.FC<TSectionHeading> = ({ title, onClick, buttonLabel, ...props }) => (
  <Box as="header" direction="row" align="center" {...props}>
    <Heading level={2} children={title} />
    {!!onClick && (
      <Box pad={{ top: "small", left: "small" }}>
        <Button plain onClick={onClick}>
          <Box direction="row" gap="xxsmall">
            <Text color="brand" children={buttonLabel} />
            <FormNextLink color="brand" />
          </Box>
        </Button>
      </Box>
    )}
  </Box>
);

interface ISectionProps extends Omit<TSectionHeading, "title">, Omit<BoxProps, "onClick"> {
  title?: string;
  titleProps?: BoxProps;
}

const Section: React.FC<ISectionProps> = ({ children, title, onClick, buttonLabel, titleProps, ...props }) => (
  <Box as="section" margin={{ horizontal: "medium", bottom: "medium" }} {...props}>
    {title && <SectionHeading title={title} onClick={onClick} buttonLabel={buttonLabel} {...titleProps} />}
    {children}
  </Box>
);

const HorizontalListAddButton: React.FC<{ label: string; onClick: () => void }> = ({ label, onClick }) => (
  <Button plain onClick={onClick}>
    <Box align="center" gap="small" pad="small">
      <Box round pad="xsmall" background="white" elevation="small">
        <AddCircle color="brand" size="32px" />
      </Box>
      <Text color="brand" children={label} />
    </Box>
  </Button>
);

interface IEventDetailProps extends RouteComponentProps<{ eventId: string }> {
  event: IEvent;
}

const EventDetail: React.FC<IEventDetailProps> = ({ match, history, event }) => {
  const amenities = useStateSelector(orderedAmenitiesSelector);
  const { numberOfGuests = 0, attending = 0, notAttending = 0 } = event || {};

  return (
    <>
      <Section title="Guests" onClick={() => history.push(`${match.url}/guestlist`)} buttonLabel="View / edit guestlist">
        <Text as="p" margin={{ top: "0" }}>
          <Text size="large" as="span" children={`${numberOfGuests} `} />
          Guests currently invited in total
        </Text>
        <Text as="p" color="dark-3" margin="none">
          <Text as="span" color="neutral-1" children={`${attending} `} />
          Attending
        </Text>
        <Text as="p" color="dark-3" margin="none">
          <Text as="span" color="status-critical" children={`${notAttending} `} />
          Not attending
        </Text>
        <Text as="p" color="dark-3" margin="none">
          <Text as="span" color="status-warning" children={numberOfGuests - (attending + notAttending) + " "} />
          Not confirmed
        </Text>
      </Section>

      <Section
        titleProps={{ margin: { horizontal: "medium" } }}
        margin={{ vertical: "medium" }}
        title="Nearby amenities"
        onClick={amenities.length > 5 ? () => {} : undefined}
        buttonLabel="View all / edit amenities order"
      >
        {amenities.length === 0 && <Text margin={{ horizontal: "medium", bottom: "medium" }} children="No amenities added yet" />}
        <SHorizontalScrollContainer>
          {amenities.slice(0, 5).map((amenity, idx) => (
            <SHorizontalScrollItem key={amenity.id} first={idx === 0}>
              <RoundedCard margin={{ vertical: "xxsmall" }} elevation="xsmall" width="350px" height="200px" pad="medium">
                <Heading level="3" size="small" as="header" children={amenity.name} />
              </RoundedCard>
            </SHorizontalScrollItem>
          ))}
          <SHorizontalScrollItem align="center" justify="center" width={{ min: "200px" }} last>
            <HorizontalListAddButton label="add amenity" onClick={() => history.push(`${match.url}/add-amenity`)} />
          </SHorizontalScrollItem>
          <Box width={{ min: "1px" }} />
        </SHorizontalScrollContainer>
      </Section>
    </>
  );
};

const EventDetailRoutes: React.FC<RouteComponentProps<{ eventId: string; weddingId: string }>> = ({ match, history, location }) => {
  const eventId = match.params.eventId;
  const event = useStateSelector(state => state.events.eventsById[eventId]);

  if (!event) {
    return <Spinner show accessibilityLabel="Loading event details" />;
  }
  const isSettingRoute = !!matchPath(location.pathname, {
    path: match.url + "/settings",
  });
  return (
    <Container>
      <Box direction="row" align="start" justify="between">
        <Heading level={1} margin={{ horizontal: "medium" }} children={event.name} />
        <Tooltip {...({ inline: true, text: "Settings" } as any)}>
          <Button
            onClick={() => history.push(match.url + (isSettingRoute ? "" : "/settings"))}
            icon={<SettingsOption size="32px" color={isSettingRoute ? "selected" : "dark-1"} />}
            margin={{ right: "small" }}
          />
        </Tooltip>
      </Box>
      <AuthenticatedRoute exact path={match.url + "/"} render={props => <EventDetail {...props} event={event} />} />
      <AuthenticatedRoute path={match.url + "/settings"} render={props => <EventSettings {...props} event={event} />} />
    </Container>
  );
};

export default EventDetailRoutes;
