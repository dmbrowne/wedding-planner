import React, { useState, useContext, useEffect, useRef } from "react";
import { RouteComponentProps } from "react-router-dom";
import { Box, Text, Button } from "grommet";
import { firestore, functions } from "firebase/app";
import { Spinner, Pulsar } from "gestalt";
import { Clear, Alert } from "grommet-icons";

import { ReactComponent as Logo } from "../icons/jumpbroom.svg";
import AuthContext from "../components/auth-context";
import { IAdminInvite, IUser } from "../store/types";
import { IWedding } from "../store/types";
import AuthUi from "../components/auth-ui";

interface IInvitationRespondProps {
  weddingName: string;
  onRespond: (accept: boolean) => any;
  pending: boolean;
}
const InvitationRespond: React.FC<IInvitationRespondProps> = ({ weddingName, onRespond, pending }) => {
  const [action, setAction] = useState<"accept" | "decline">();

  useEffect(() => {
    if (action) {
      onRespond(action === "accept");
    }
  }, [action]);

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
          <em>{weddingName}</em>
        </Text>
        {pending && <Text>{action === "accept" ? "Accepting..." : "Declining..."}</Text>}
        {pending ? (
          <Pulsar />
        ) : (
          <Box>
            <Button label="Accept invite" margin={{ top: "large" }} primary onClick={() => setAction("accept")} />
            <Button label="Reject invite" margin={{ top: "large" }} onClick={() => setAction("decline")} />
          </Box>
        )}
      </Box>
    </Box>
  );
};

const AcceptAdminInvite: React.FC<RouteComponentProps<{ adminInviteId: string }>> = ({ match, history }) => {
  const db = firestore();
  const { current: respondToInvitation } = useRef(functions().httpsCallable("weddingCollaborationInvitationRespond"));
  const { user: auth } = useContext(AuthContext);
  const [fetchError, setFetchError] = useState(false);
  const { adminInviteId } = match.params;
  const [wedding, setWedding] = useState<IWedding>();
  const [invite, setInvite] = useState<IAdminInvite>();
  const [userProfile, setUserProfile] = useState<IUser>();
  const [responseInProgress, setResponseInProgress] = useState(false);

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

  const invitationResponse = (accept: boolean) => {
    setResponseInProgress(true);
    respondToInvitation({ accept, inviteId: adminInviteId }).then(result => {
      setResponseInProgress(false);
      history.push(`/weddings/${result.data.weddingId}`);
    });
  };

  if (fetchError) {
    return (
      <Box fill align="center" justify="center">
        <Logo />
        <Alert size="large" color="status-warning" />
        <Text>There is a problem with the invite, it may have expired. Try asking the person to send the invite again</Text>
      </Box>
    );
  }

  if (!invite || !wedding) {
    return <Box fill align="center" justify="center" pad="large" children={<Spinner show accessibilityLabel="Fetching invite" />} />;
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
    if (userProfile?.accountType === "normal" && !!userProfile.weddingIds && !userProfile.weddingIds.includes(wedding.id)) {
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
    } else {
      return <InvitationRespond weddingName={!!wedding && wedding.name} onRespond={invitationResponse} pending={responseInProgress} />;
    }
  }

  return (
    <Box fill align="center" justify="center">
      <AuthUi
        presetEmail={invite.email}
        emailDisabled={true}
        preFormContent={
          <>
            <Text textAlign="center" margin={{ bottom: "medium" }}>
              You've been asked to collaborate on the wedding, titled:
            </Text>
            <Text size="large" color="brand" textAlign="center">
              <em>{!!wedding && wedding.name}</em>
            </Text>
            <Text textAlign="center" margin={{ top: "large" }}>
              Log in, or Register your account by clicking next
            </Text>
          </>
        }
      />
    </Box>
  );
};

export default AcceptAdminInvite;
