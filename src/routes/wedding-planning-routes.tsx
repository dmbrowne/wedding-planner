import React, { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { Box, Button } from "grommet";
import { Route, RouteComponentProps, Switch } from "react-router-dom";
import { useMediaQuery } from "react-responsive";
import { Menu } from "grommet-icons";
import { firestore } from "firebase/app";

import SiteNav from "../components/site-nav";
import AuthenticatedRoute from "../components/authenticated-route";
import { AlgoliaSearchKeyProvider } from "../components/algolia-search-key";
import { GuestsProvider } from "../components/guests-context";
import TopNav from "../components/top-nav";

import Attendees from "../screens/guests";
import CreateGuests from "../screens/create-guests";
import WeddingHome from "../screens/wedding-home";
import TableSeating from "../screens/table-seating";
import Invitations from "../screens/invitations";
import WebsiteConfig from "../screens/website-config";
import CoverEdit from "../screens/cover-edit";
import OurStories from "../screens/our-stories";

import { useStateSelector } from "../store/redux";
import { fetchWeddingSuccess, setWeddingCollaborators } from "../store/active-wedding";
import { IWedding, IUser } from "../store/types";

import { EventsRoute } from "./event-routes";
import { AppFrame, Main } from "../app";
import WeddingSettings from "../screens/wedding-settings";
import EditStory from "../screens/edit-story";

export const WeddingPlanningRoutes: React.FC<RouteComponentProps<{
  weddingId: string;
}>> = ({ match }) => {
  const { current: db } = useRef(firestore());
  const dispatch = useDispatch();
  const { weddingId } = match.params;
  const isDesktopOrHigher = useMediaQuery({ query: "(min-width: 1224px)" });
  const wedding = useStateSelector(state => state.activeWedding.wedding);
  const [menuOpen, setMenuOpen] = useState(false);
  const collaboratorIds = (wedding && wedding._private && wedding._private.collaborators) || [];

  if (!wedding) {
    // hack for now, until custom hooks that communicate with firebase and defensively coded against null weddingIds
    dispatch(fetchWeddingSuccess({ id: weddingId } as IWedding));
  }

  useEffect(() => {
    return db.doc(`weddings/${weddingId}`).onSnapshot(snap => {
      dispatch(fetchWeddingSuccess({ id: snap.id, ...(snap.data() as IWedding) }));
    });
  }, []);

  useEffect(() => {
    if (collaboratorIds.length > 0) {
      Promise.all(collaboratorIds.map(id => db.doc(`users/${id}`).get())).then(snaps => {
        const collaborators = snaps.reduce((accum, doc) => {
          return doc.exists ? { ...accum, [doc.id]: { id: doc.id, ...(doc.data() as IUser) } } : accum;
        }, {} as { [id: string]: IUser });
        dispatch(setWeddingCollaborators(collaborators));
      });
    }
  }, [wedding]);

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
                <AuthenticatedRoute exact path={`${match.path}/sections`} component={WebsiteConfig} />
                <AuthenticatedRoute exact path={`${match.path}/cover`} component={CoverEdit} />
                <AuthenticatedRoute exact path={`${match.path}/invitations`} component={Invitations} />
                <AuthenticatedRoute exact path={`${match.path}/stories`} component={OurStories} />
                <AuthenticatedRoute exact path={`${match.path}/stories/:storyId`} component={EditStory} />
                <AuthenticatedRoute exact path={`${match.path}/settings`} component={WeddingSettings} />
                <AuthenticatedRoute component={WeddingHome} />
              </Switch>
            </Main>
          </AppFrame>
        </GuestsProvider>
      </AlgoliaSearchKeyProvider>
    </Route>
  );
};
