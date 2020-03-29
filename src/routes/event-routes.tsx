import React from "react";
import { RouteComponentProps, Switch } from "react-router-dom";
import AuthenticatedRoute from "../components/authenticated-route";
import Events from "../screens/events";
import EventDetail from "../screens/event-detail";
import EventGuestlist from "../screens/event-guestlist";
import EventsWatcher, { AmenitiesWatcher } from "../components/events-watcher";
import CreateAmenity from "../screens/create-amenity";
import CreateEventService from "../screens/create-event-service";
import CreateEvent from "../screens/create-event";

const EventRoute: React.FC<RouteComponentProps<{ weddingId: string; eventId: string }>> = ({ match }) => (
  <AmenitiesWatcher eventId={match.params.eventId}>
    <Switch>
      <AuthenticatedRoute path={`${match.path}/guestlist`} component={EventGuestlist} />
      <AuthenticatedRoute path={`${match.path}/add-amenity`} component={CreateAmenity} />
      <AuthenticatedRoute path={`${match.path}/add-service`} component={CreateEventService} />
      <AuthenticatedRoute path={`${match.path}/`} component={EventDetail} />
    </Switch>
  </AmenitiesWatcher>
);

export const EventsRoute: React.FC<RouteComponentProps<{ weddingId: string }>> = ({ match }) => (
  <EventsWatcher weddingId={match.params.weddingId}>
    <Switch>
      <AuthenticatedRoute exact path={`${match.path}/`} component={Events} />
      <AuthenticatedRoute exact path={`${match.path}/create`} component={CreateEvent} />
      <AuthenticatedRoute path={`${match.path}/:eventId`} component={EventRoute} />
    </Switch>
  </EventsWatcher>
);
