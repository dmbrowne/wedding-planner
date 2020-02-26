import React, { useState, useEffect } from "react";
import { Box, Layer, Text, Button } from "grommet";
import firebase, { firestore } from "firebase/app";
import { RouteComponentProps, Redirect } from "react-router-dom";

import { Spinner } from "gestalt";
import CreateNewWedding from "../components/create-new-wedding";
import { IUser } from "../store/types";
import WeddingsList from "../components/weddings-list";
import useUserWeddingList from "../hooks/use-user-wedding-list";

const WeddingSelect: React.FC<RouteComponentProps> = ({ history }) => {
  const db = firestore();
  const [user, setUser] = useState<IUser | void>();
  const [backgroundAccountSetupInProgress, setBackgroundAccountSetupInProgress] = useState<boolean | undefined>(undefined);
  const weddingList = useUserWeddingList();
  const [weddingFormIsVisible, setWeddingFormVisibility] = useState(false);
  const auth = firebase.auth().currentUser;

  useEffect(() => {
    if (auth)
      return db.doc(`users/${auth.uid}`).onSnapshot(snap => {
        if (!snap.exists) setBackgroundAccountSetupInProgress(true);
        else setBackgroundAccountSetupInProgress(false);
        setUser(snap.data() as any);
      });
  }, [auth]);

  if (!user || weddingList === null) {
    return <Box fill align="center" justify="center" children={<Spinner show accessibilityLabel="loading user" />} />;
  }

  if (backgroundAccountSetupInProgress) {
    return (
      <Box fill align="center" justify="center">
        <Spinner show accessibilityLabel="loading user" />
        <Text>Setting up your account, this shouldn't take more than 10 seconds...</Text>
      </Box>
    );
  }

  return (
    <>
      <Box width={{ max: "1224px" }} pad="medium" fill margin="auto">
        {user.accountType === "planner" && (
          <WeddingsList
            weddings={weddingList}
            onViewWedding={weddingId => history.push(`/weddings/${weddingId}`)}
            onAddWedding={() => setWeddingFormVisibility(true)}
          />
        )}
        {user.accountType === "normal" &&
          (weddingList.length === 0 ? (
            <>
              <Text>You haven't added any wedding details yet</Text>
              <Button margin="small" alignSelf="start" primary label="Start" onClick={() => setWeddingFormVisibility(true)} />
            </>
          ) : (
            !weddingFormIsVisible && <Redirect to={`/weddings/${weddingList[0].id}`} />
          ))}
      </Box>
      {weddingFormIsVisible && (
        <Layer full animation="slide">
          <CreateNewWedding
            onClose={() => setWeddingFormVisibility(false)}
            onCreateSuccess={weddingId => history.push(`/weddings/${weddingId}`)}
          />
        </Layer>
      )}
    </>
  );
};

export default WeddingSelect;
