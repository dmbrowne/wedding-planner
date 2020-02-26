import React, { useState, useContext, useEffect } from "react";
import { RouteComponentProps } from "react-router-dom";
import { Box, Text, Button } from "grommet";
import { firestore, auth } from "firebase/app";
import { Spinner } from "gestalt";
import { Clear, Alert } from "grommet-icons";

import { ReactComponent as Logo } from "../icons/jumpbroom.svg";
import AuthContext from "../components/auth-context";
import { IAdminInvite, IUser } from "../store/types";
import { IWedding } from "../store/types";
import AuthUi from "../components/auth-ui";

const AcceptAdminInvite: React.FC<RouteComponentProps<{ adminInviteId: string }>> = ({ match }) => {
  const db = firestore();
  const { user: auth } = useContext(AuthContext);
  const [fetchError, setFetchError] = useState(false);
  const { adminInviteId } = match.params;
  const [wedding, setWedding] = useState<IWedding>();
  const [invite, setInvite] = useState<IAdminInvite>();
  const [userProfile, setUserProfile] = useState<IUser>();

  useEffect(() => {
    db.doc(`/adminInvites/${adminInviteId}`)
      .get()
      .then(doc => {
        if (!doc.exists) setFetchError(true);
        else setInvite({ id: doc.id, ...(doc.data() as IAdminInvite) });
      })
      .catch(() => setFetchError(true));
  }, []);

  useEffect(() => {
    if (invite) {
      db.doc(`/weddings/${invite.weddingId}`)
        .get()
        .then(doc => setWedding(doc.data() as IWedding));
    }
  }, [invite]);

  useEffect(() => {
    if (auth) {
      db.doc(`/users/${auth.uid}`)
        .get()
        .then(doc => setUserProfile({ id: doc.id, ...(doc.data() as IUser) }));
    }
  }, [auth]);

  const onUserCreateSuccess = (user: auth.UserCredential) => {
    // authstate should automatically change and switch the view to the logged in view with accept button;
  };

  if (!invite) {
    return <Box fill align="center" justify="center" pad="large" children={<Spinner show accessibilityLabel="Fetching invite" />} />;
  }

  if (fetchError) {
    return (
      <Box fill align="center" justify="center">
        <Logo />
        <Alert size="large" color="status-warning" />
        <Text>There is a problem with the invite, it may have expired. Try asking the person to send the invite again</Text>
      </Box>
    );
  }

  if (auth && auth.email !== invite.email) {
    return (
      <Box fill align="center" justify="center">
        <Box align="center" margin={{ bottom: "large" }} children={<Logo />} />
        <Clear size="large" color="status-error" />
        <Text>The user currently signed in does not have permission to view this invite. Please log out and try again</Text>
      </Box>
    );
  } else if (auth && auth.email === invite.email) {
    if (userProfile && userProfile.accountType === "normal" && userProfile.weddingIds.length >= 1) {
      return (
        <Box fill align="center" justify="center">
          <Box align="center" margin={{ bottom: "large" }} children={<Logo />} />
          <Alert size="large" color="status-warning" />
          <Text>
            Your account type only permits you access to one wedding. Either sign up for a "event planner" account, or contact support to
            remove your current wedding
          </Text>
        </Box>
      );
    }

    return (
      <Box fill align="center" justify="center">
        <Box
          pad={{ vertical: "large", horizontal: "medium" }}
          width={{ max: "500px" }}
          style={{ borderRadius: "16px" }}
          border={{ side: "all", color: "light-6" }}
        >
          <Box align="center" margin={{ bottom: "large" }} children={<Logo />} />
          <Text textAlign="center" margin={{ bottom: "medium" }}>
            You've been asked to collaborate on the wedding, titled:
          </Text>
          <Text size="large" color="brand" textAlign="center">
            <em>{!!wedding && wedding.name}</em>
          </Text>
          <Button label="Accept invite" margin={{ top: "large" }} primary />
        </Box>
      </Box>
    );
  }

  return (
    <Box fill align="center" justify="center">
      <AuthUi
        onSuccess={onUserCreateSuccess}
        preFormContent={
          <>
            <Text textAlign="center" margin={{ bottom: "medium" }}>
              You've been asked to collaborate on the wedding, titled:
            </Text>
            <Text size="large" color="brand" textAlign="center">
              <em>{!!wedding && wedding.name}</em>
            </Text>
            <Text textAlign="center" margin={{ top: "large" }}>
              Enter you email address to either login and accept, or create an account now and accept
            </Text>
          </>
        }
      />
    </Box>
  );
};

export default AcceptAdminInvite;
