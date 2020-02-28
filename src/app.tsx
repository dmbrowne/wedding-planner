import React from "react";
import { Provider as ReduxProvider } from "react-redux";
import { Grommet, Box } from "grommet";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import styled, { ThemeProvider } from "styled-components";
import "gestalt/dist/gestalt.css";

import metroTheme from "./theme";
import { AuthProvider } from "./components/auth-context";
import Home from "./screens/home";
import AuthenticatedRoute from "./components/authenticated-route";
import Login from "./screens/login";
import WeddingSelect from "./screens/wedding-select";
import store from "./store/redux";
import "./utils/firebase";
import GoogleApiContextProvider from "./components/google-api-context";
import { WeddingPlanningRoutes } from "./routes/wedding-planning-routes";
import AcceptAdminInvite from "./screens/accept-admin-invite";

const StandardBox = styled(Box).attrs({ fill: "horizontal", background: "light-2" })`
  min-height: 100%;
`;

export const AppFrame = styled(Box).attrs({ direction: "row", background: "light-2" })`
  display: flex;
  height: 100%;
  overflow: hidden;
`;

export const Main = styled.div`
  overflow: auto;
  width: 100%;
`;

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ReduxProvider store={store}>
        <AuthProvider>
          <ThemeProvider theme={metroTheme}>
            <GoogleApiContextProvider>
              <Grommet theme={metroTheme} full>
                <Switch>
                  <AuthenticatedRoute path="/weddings/:weddingId" component={WeddingPlanningRoutes} />
                  <AuthenticatedRoute exact path="/weddings" component={WeddingSelect} />
                  <Route exact path="/join/:adminInviteId" component={AcceptAdminInvite} />
                  <Route path="/login" component={Login} />
                  <Route exact path="/" render={props => <StandardBox children={<Home {...props} />} />} />
                </Switch>
              </Grommet>
            </GoogleApiContextProvider>
          </ThemeProvider>
        </AuthProvider>
      </ReduxProvider>
    </BrowserRouter>
  );
};

export default App;
