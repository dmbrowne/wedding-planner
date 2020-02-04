import React, { useState } from "react";
import { useDispatch, Provider as ReduxProvider } from "react-redux";
import { Grommet, grommet as grommetTheme, Box, Button } from "grommet";
import { BrowserRouter, Route, RouteComponentProps, Switch } from "react-router-dom";
import { useMediaQuery } from "react-responsive";
import styled, { ThemeProvider } from "styled-components";
import { Menu } from "grommet-icons";
import "gestalt/dist/gestalt.css";

import SiteNav from "./components/site-nav";
import { AuthProvider } from "./components/auth-context";
import Home from "./screens/home";
import Attendees from "./screens/guests";
import CreateGuests from "./screens/create-guests";
import AuthenticatedRoute from "./components/authenticated-route";
import Login from "./screens/login";
import WeddingSelect from "./screens/wedding-select";
import WeddingHome from "./screens/wedding-home";
import { setWeddingId } from "./store/reducers";
import store, { useStateSelector } from "./store/redux";
import { AlgoliaSearchKeyProvider } from "./components/algolia-search-key";
import { GuestsProvider } from "./components/guests-context";
import Events from "./screens/events";
import EventDetail from "./screens/event-detail";
import EventGuestlist from "./screens/event-guestlist";
import EventsWatcher from "./components/events-watcher";
import "./firebase";

const StandardBox = styled(Box).attrs({ fill: "horizontal", background: "light-2" })`
  min-height: 100%;
`;

const AppFrame = styled(Box).attrs({ direction: "row", background: "light-2" })`
  display: flex;
  height: 100%;
  overflow: hidden;
`;

const Main = styled(Box).attrs({ height: "100%", fill: "horizontal" })`
  overflow: auto;
`;

const EventsRoute: React.FC<RouteComponentProps<{ weddingId: string }>> = ({ match }) => {
  const weddingId = match.params.weddingId;
  return (
    <EventsWatcher weddingId={weddingId}>
      <Switch>
        <AuthenticatedRoute path={`${match.path}/:eventId/guestlist`} component={EventGuestlist} />
        <AuthenticatedRoute path={`${match.path}/:eventId`} component={EventDetail} />
        <AuthenticatedRoute path={`${match.path}/`} component={Events} />
      </Switch>
    </EventsWatcher>
  );
};

const WeddingPlanningRoutes: React.FC<RouteComponentProps<{ weddingId: string }>> = ({ match }) => {
  const dispatch = useDispatch();
  const isDesktopOrHigher = useMediaQuery({ query: "(min-width: 1224px)" });
  const [menuOpen, setMenuOpen] = useState(false);
  const { activeWeddingId } = useStateSelector(state => state);

  if (activeWeddingId !== match.params.weddingId) {
    dispatch(setWeddingId(match.params.weddingId));
  }

  return (
    <Route>
      <AlgoliaSearchKeyProvider>
        <GuestsProvider>
          <AppFrame>
            <Box basis={isDesktopOrHigher ? "1/4" : "50px"} width={{ max: "300px" }}>
              <Box
                background="white"
                width={isDesktopOrHigher ? "auto" : menuOpen ? "300px" : "100%"}
                fill="vertical"
                style={{ position: !isDesktopOrHigher && menuOpen ? "fixed" : "static" }}
              >
                {!isDesktopOrHigher && <Button icon={<Menu />} onClick={() => setMenuOpen(!menuOpen)} />}
                {(isDesktopOrHigher || menuOpen) && <SiteNav rootPath={match.url} />}
              </Box>
            </Box>
            <Main>
              <Switch>
                <AuthenticatedRoute path={`${match.path}/events`} component={EventsRoute} />
                <AuthenticatedRoute path={`${match.path}/guests/create`} component={CreateGuests} />
                <AuthenticatedRoute path={`${match.path}/guests`} component={Attendees} />
                <AuthenticatedRoute component={WeddingHome} />
              </Switch>
            </Main>
          </AppFrame>
        </GuestsProvider>
      </AlgoliaSearchKeyProvider>
    </Route>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ReduxProvider store={store}>
        <AuthProvider>
          <ThemeProvider theme={grommetTheme}>
            <Grommet theme={grommetTheme} full>
              <Switch>
                <AuthenticatedRoute path="/wedding/:weddingId" component={WeddingPlanningRoutes} />
                <AuthenticatedRoute
                  path="/wedding"
                  render={props => <StandardBox children={<WeddingSelect {...props} />} />}
                />
                <Route path="/login" render={props => <StandardBox children={<Login {...props} />} />} />
                <Route exact path="/" render={props => <StandardBox children={<Home {...props} />} />} />
              </Switch>
            </Grommet>
          </ThemeProvider>
        </AuthProvider>
      </ReduxProvider>
    </BrowserRouter>
  );
};

export default App;
