import React, { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { Box, Button } from "grommet";
import { Route, RouteComponentProps, Switch } from "react-router-dom";
import { useMediaQuery } from "react-responsive";
import { Menu } from "grommet-icons";
import SiteNav from "../components/site-nav";
import Attendees from "../screens/guests";
import CreateGuests from "../screens/create-guests";
import AuthenticatedRoute from "../components/authenticated-route";
import WeddingHome from "../screens/wedding-home";
import { fetchWeddingSuccess } from "../store/reducers";
import { IWedding } from "../store/types";
import { AlgoliaSearchKeyProvider } from "../components/algolia-search-key";
import { GuestsProvider } from "../components/guests-context";
import { firestore } from "firebase/app";
import { AppFrame, Main } from "../app";
import { EventsRoute } from "./event-routes";
import TopNav from "../components/top-nav";
import { useStateSelector } from "../store/redux";
import TableSeating from "../screens/table-seating";
import Invitations from "../screens/invitations";
import EditInvitation from "../screens/edit-invitation";
import WebsiteConfig from "../screens/website-config";
import CoverEdit from "../screens/cover-edit";

export const WeddingPlanningRoutes: React.FC<RouteComponentProps<{
  weddingId: string;
}>> = ({ match }) => {
  const { current: db } = useRef(firestore());
  const dispatch = useDispatch();
  const { weddingId } = match.params;
  const isDesktopOrHigher = useMediaQuery({ query: "(min-width: 1224px)" });
  const wedding = useStateSelector(state => state.activeWedding.wedding);
  const [menuOpen, setMenuOpen] = useState(false);

  if (!wedding) {
    dispatch(fetchWeddingSuccess({ id: weddingId } as IWedding));
  }

  useEffect(() => {
    return db.doc(`weddings/${weddingId}`).onSnapshot(snap => {
      dispatch(fetchWeddingSuccess({ id: snap.id, ...(snap.data() as IWedding) }));
    });
  }, []);

  return (
    <Route>
      <AlgoliaSearchKeyProvider>
        <GuestsProvider>
          <AppFrame>
            <Box basis={isDesktopOrHigher ? "1/4" : "50px"} width={{ max: "300px" }} elevation="small">
              <Box
                background="white"
                width={isDesktopOrHigher ? "auto" : menuOpen ? "300px" : "100%"}
                fill="vertical"
                style={{ position: !isDesktopOrHigher && menuOpen ? "fixed" : "static", zIndex: 10 }}
              >
                {!isDesktopOrHigher && <Button style={{ height: "64px" }} icon={<Menu />} onClick={() => setMenuOpen(!menuOpen)} />}
                {(isDesktopOrHigher || menuOpen) && <SiteNav onClose={() => setMenuOpen(false)} rootPath={match.url} />}
              </Box>
            </Box>
            <Main>
              <TopNav />
              <Switch>
                <AuthenticatedRoute path={`${match.path}/events`} component={EventsRoute} />
                <AuthenticatedRoute path={`${match.path}/guests/create`} component={CreateGuests} />
                <AuthenticatedRoute path={`${match.path}/guests`} component={Attendees} />
                <AuthenticatedRoute path={`${match.path}/table-seating`} component={TableSeating} />
                <AuthenticatedRoute exact path={`${match.path}/settings`} component={WebsiteConfig} />
                <AuthenticatedRoute exact path={`${match.path}/cover`} component={CoverEdit} />
                <AuthenticatedRoute exact path={`${match.path}/invitations`} component={Invitations} />
                <AuthenticatedRoute path={`${match.path}/invitations/:invitationId`} component={EditInvitation} />
                <AuthenticatedRoute component={WeddingHome} />
              </Switch>
            </Main>
          </AppFrame>
        </GuestsProvider>
      </AlgoliaSearchKeyProvider>
    </Route>
  );
};
