import React from "react";
import { useDispatch, Provider as ReduxProvider } from "react-redux";
import { Grommet, grommet as grommetTheme, Box } from "grommet";
import { BrowserRouter, Route, RouteComponentProps, Switch } from "react-router-dom";

import "./firebase";

import SiteNav from "./components/site-nav";
import { AuthProvider } from "./components/auth-context";
import Home from "./screens/home";
import Attendees from "./screens/guests";
import CreateGuests from "./screens/create-guests";
import AuthenticatedRoute from "./components/authenticated-route";
import Login from "./screens/login";
import WeddingSelect from "./screens/wedding-select";
import styled, { ThemeProvider } from "styled-components";
import WeddingHome from "./screens/wedding-home";
import { setWeddingId } from "./store/reducers";
import store, { useStateSelector } from "./store/redux";
import { AlgoliaSearchKeyProvider } from "./components/algolia-search-key";
import { GuestsProvider } from "./components/guests-context";
import "gestalt/dist/gestalt.css";

const ContentContainer = styled.div`
  width: 100%;
  max-width: 1248px;
  padding: 0 24px;
  margin: auto;
  box-sizing: border-box;
`;

const WeddingPlanningRoutes: React.FC<RouteComponentProps<{ weddingId: string }>> = ({ match }) => {
  const dispatch = useDispatch();
  const { activeWeddingId } = useStateSelector(state => state);
  if (activeWeddingId !== match.params.weddingId) {
    dispatch(setWeddingId(match.params.weddingId));
  }

  return (
    <Route>
      <AlgoliaSearchKeyProvider>
        <GuestsProvider>
          <SiteNav rootPath={match.url} />
          <ContentContainer>
            <Switch>
              <AuthenticatedRoute path={`${match.path}/guests/create`} component={CreateGuests} />
              <AuthenticatedRoute path={`${match.path}/guests`} component={Attendees} />
              <AuthenticatedRoute component={WeddingHome} />
            </Switch>
          </ContentContainer>
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
              <Box fill>
                <div>
                  <Switch>
                    <AuthenticatedRoute path="/wedding/:weddingId" component={WeddingPlanningRoutes} />
                    <AuthenticatedRoute path="/wedding" component={WeddingSelect} />
                    <Route path="/login" component={Login} />
                    <Route exact path="/" component={Home} />
                  </Switch>
                </div>
              </Box>
            </Grommet>
          </ThemeProvider>
        </AuthProvider>
      </ReduxProvider>
    </BrowserRouter>
  );
};

export default App;
