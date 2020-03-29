import React, { useState, useRef } from "react";
import { Spinner, Avatar, Switch } from "gestalt";
import { Box, Text, Heading, Button } from "grommet";
import { firestore } from "firebase/app";
import { RouteComponentProps } from "react-router-dom";

import { orderedEventsListSelector } from "../selectors/selectors";
import { useStateSelector } from "../store/redux";
import { NameForm } from "../components/name-form";
import Guest from "../components/guest";
import { IEvent } from "../store/types";
import AddCollaboratorModal from "../components/add-collaborator-modal";
import CollaboratorsList from "../components/collaborators-list";
import EventsWatcher from "../components/events-watcher";
import GridListing from "../styled/grid-listing";
import RoundedCard from "../components/rounded-card";
import { Add } from "grommet-icons";
import { format } from "date-fns";

const WeddingSettings: React.FC<RouteComponentProps<{ weddingId: string }>> = ({ match, history }) => {
  const weddingId = match.params.weddingId;
  const { current: db } = useRef(firestore());
  const weddingEvents = useStateSelector(orderedEventsListSelector);
  const { wedding } = useStateSelector(state => state.activeWedding);
  const [showAddCollaboratorModal, setShowAddCollaboratorModal] = useState(false);

  const updateWeddingField = (values: Partial<{ [field in keyof IEvent]: IEvent[field] }>) => {
    db.doc(`weddings/${weddingId}`).update(values);
  };
  const updateWeddingName = ({ name }: { name: string }) => {
    updateWeddingField({ name });
  };

  if (!wedding?.name) {
    return <Spinner accessibilityLabel="Loading wedding details" show />;
  }

  return (
    <Box style={{ display: "block" }} pad="medium">
      <NameForm label="Wedding name" initialName={wedding.name} onSubmit={updateWeddingName} />

      <Box as="section" margin={{ bottom: "medium" }}>
        <Heading level={4} children="The couple" />
        {wedding.couple.map(guestId => (
          <Guest key={guestId} id={guestId}>
            {({ guest }) => (
              <Box direction="row" gap="xsmall" margin={{ vertical: "xxsmall" }} align="center">
                <Avatar name={guest.name} size="sm" />
                <Text>{guest.name}</Text>
              </Box>
            )}
          </Guest>
        ))}
      </Box>

      <Box as="section" margin={{ top: "large", bottom: "medium" }}>
        <Heading level={4} children="Events / Services" />
        <GridListing>
          {weddingEvents.map(weddingEvent => (
            <RoundedCard elevation="small" key={weddingEvent.id} height={undefined}>
              <Box margin={{ horizontal: "medium" }}>
                <Heading level={5} color="brand" margin={{ bottom: "0px" }}>
                  {weddingEvent.name}
                  {weddingEvent.default && (
                    <Text as="span" size="small" style={{ fontWeight: 400 }} color="dark-6" children="&nbsp;[default]" />
                  )}
                </Heading>
                <Text size="small" margin={{ bottom: "small" }}>
                  {format(weddingEvent.startDate.toDate(), "d-MMM-yyyy")}
                </Text>
              </Box>
              <Box direction="row" margin={{ horizontal: "small", bottom: "small" }}>
                <Button>
                  <Box pad="small" children={<Text size="small">View</Text>} />
                </Button>
                <Button>
                  <Box pad="small" children={<Text size="small">Edit</Text>} />
                </Button>
                <Button>
                  <Box pad="small" children={<Text size="small">Manage guests</Text>} />
                </Button>
              </Box>
            </RoundedCard>
          ))}
          <RoundedCard elevation="small" height="130px">
            <Box align="center" fill justify="center" gap="small" onClick={() => history.push(`/weddings/${weddingId}/events/create`)}>
              <Text color="brand">Add event</Text>
              <Add color="brand" />
            </Box>
          </RoundedCard>
        </GridListing>
      </Box>

      <Box as="section" margin={{ vertical: "medium" }}>
        <Heading level={4} children="Collaborators" />
        <CollaboratorsList onAddCollaborator={() => setShowAddCollaboratorModal(true)} weddingId={weddingId} showPendingInvites />
      </Box>
      {showAddCollaboratorModal && <AddCollaboratorModal onClose={() => setShowAddCollaboratorModal(false)} weddingId={weddingId} />}
    </Box>
  );
};

const WeddingSettingsScreen: React.FC<RouteComponentProps<{ weddingId: string }>> = props => (
  <EventsWatcher weddingId={props.match.params.weddingId}>
    <WeddingSettings {...props} />
  </EventsWatcher>
);
export default WeddingSettingsScreen;
