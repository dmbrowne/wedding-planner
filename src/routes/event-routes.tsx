import React from "react";
import { RouteComponentProps, Switch } from "react-router-dom";
import AuthenticatedRoute from "../components/authenticated-route";
import EventGuestlist from "../screens/event-guestlist";
import CreateEvent from "../screens/create-event";

export const EventsRoute: React.FC<RouteComponentProps<{ weddingId: string }>> = ({ match }) => (
  <Switch>
    <AuthenticatedRoute exact path={`${match.path}/create`} component={CreateEvent} />
    <AuthenticatedRoute path={`${match.path}/:eventId/guestlist`} component={EventGuestlist} />
  </Switch>
);
