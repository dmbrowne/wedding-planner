import React, { ReactNode } from "react";
import { Box, Text } from "grommet";
import { matchPath, withRouter } from "react-router";
import { RouteComponentProps, Link, Route } from "react-router-dom";
import { useStateSelector } from "../store/redux";
import { FormNext } from "grommet-icons";
import styled from "styled-components";

const WeddingNameBreadcrumb: React.FC<RouteComponentProps<{ weddingId: string }>> = ({ match }) => {
  const weddingName = useStateSelector(state => state.activeWedding.wedding?.name);
  return (
    <Link to={`/weddings/${match.params.weddingId}`}>
      <Text size="small" children={weddingName} />
    </Link>
  );
};

const EventNameBreadcrumb: React.FC<RouteComponentProps<{ weddingId: string; eventId: string }>> = ({ match }) => {
  const event = useStateSelector(state => state.events.eventsById[match.params.eventId]);
  return (
    <Link to={`/weddings/${match.params.weddingId}/events/${match.params.eventId}`}>
      <Text size="small" children={event && event.name} />
    </Link>
  );
};

const routes = [
  {
    // render wedding name
    path: "/weddings/:weddingId/:subname",
    component: WeddingNameBreadcrumb,
  },
  {
    path: "/weddings/:weddingId/guests/create",
    component: ({ match }: RouteComponentProps<{ weddingId: string }>) => (
      <Link to={`/weddings/${match.params.weddingId}/guests`}>
        <Text size="small" children="Guests" />
      </Link>
    ),
  },
  {
    path: "/weddings/:weddingId/stories/:storyId",
    component: ({ match }: RouteComponentProps<{ weddingId: string }>) => (
      <Link to={`/weddings/${match.params.weddingId}/stories`}>
        <Text size="small" children="Stories" />
      </Link>
    ),
  },
  {
    // render "events"
    path: "/weddings/:weddingId/events/:eventId",
    component: ({ match }: RouteComponentProps<{ weddingId: string; eventId: string }>) => (
      <Link to={`/weddings/${match.params.weddingId}/events`}>
        <Text size="small" children="Events" />
      </Link>
    ),
  },
  {
    // render event name
    path: "/weddings/:weddingId/events/:eventId/guestlist",
    component: EventNameBreadcrumb,
  },
];

const SNavChild = styled(Box).attrs(() => ({
  direction: "row",
  gap: "small",
  align: "center",
}))`
  display: flex;

  a {
    color: #fff;
  }
`;

const BreadcrumbBar = withRouter(({ location }) => {
  return (
    <nav>
      <SNavChild>
        {routes
          .reduce((accum: { path: string; component: ReactNode }[], { component: C, ...route }) => {
            const matches = matchPath(location.pathname, { path: route.path });
            return matches
              ? [
                  ...accum,
                  {
                    path: route.path,
                    component: <Route {...route} component={C} />,
                  },
                ]
              : accum;
          }, [])
          .map(({ path, component: C }, idx) => (
            <React.Fragment key={path}>
              {idx !== 0 && <Box margin={{ right: "small" }} children={<FormNext />} />}
              {C}
            </React.Fragment>
          ))}
      </SNavChild>
    </nav>
  );
});

export default BreadcrumbBar;
