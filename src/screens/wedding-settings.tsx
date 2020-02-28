import React, { useEffect, useState, useContext, useRef } from "react";
import { Spinner, Avatar } from "gestalt";
import { Box, Text, Heading, Button, Layer, TextInput } from "grommet";
import * as yup from "yup";
import { firestore } from "firebase/app";
import { RouteComponentProps } from "react-router-dom";
import { Trash, Close } from "grommet-icons";
import { Formik } from "formik";
import { addDays } from "date-fns";

import { weddingCollaboratorsOrderedByEmailSelector } from "../selectors/selectors";
import { useStateSelector } from "../store/redux";
import { NameForm } from "../components/name-form";
import Guest from "../components/guest";
import { IAdminInvite } from "../store/types";
import AuthContext from "../components/auth-context";

const WeddingSettings: React.FC<RouteComponentProps<{ weddingId: string }>> = ({ match }) => {
  const { current: db } = useRef(firestore());
  const { current: newCollaboratorFormValidationSchema } = useRef(
    yup.object().shape({
      email: yup
        .string()
        .email()
        .required(),
    })
  );
  const { weddingId } = match.params;
  const { user: auth } = useContext(AuthContext);
  const collaborators = useStateSelector(weddingCollaboratorsOrderedByEmailSelector);
  const { wedding } = useStateSelector(state => state.activeWedding);
  const [pendingRequests, setPendingRequests] = useState<IAdminInvite[]>([]);
  const [showAddCollaboratorModal, setShowAddCollaboratorModal] = useState(false);
  console.log(pendingRequests);

  useEffect(() => {
    return db
      .collection("adminInvites")
      .where("weddingId", "==", weddingId)
      .onSnapshot(snap => setPendingRequests(snap.docs.map(doc => ({ id: doc.id, ...(doc.data() as IAdminInvite) }))));
  }, []);

  const deleteInviteRequest = (inviteId: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this co-edit invitation request?");
    if (confirmed) {
      db.doc(`adminInvites/${inviteId}`).delete();
    }
  };
  const updateWeddingName = ({ name }: { name: string }) => {
    db.doc(`weddings/${weddingId}`).update({ name });
  };
  const sendInviteRequest = ({ email }: { email: string }) => {
    if (!auth) return;
    const data: Omit<IAdminInvite, "id"> = {
      weddingId,
      email,
      from: auth.uid,
      expires: firestore.Timestamp.fromDate(addDays(new Date(), 1)),
    };
    db.collection("adminInvites").add(data);
  };
  const onNewCollaboratorSubmit = (values: { email: string }) => {
    sendInviteRequest(values);
    setShowAddCollaboratorModal(false);
  };

  if (!wedding?.name) {
    return <Spinner accessibilityLabel="Loading wedding details" show />;
  }

  return (
    <Box width={{ max: "700px" }} style={{ display: "block", margin: "auto" }}>
      <NameForm label="Wedding name" initialName={wedding.name} onSubmit={updateWeddingName} />
      <Box margin={{ vertical: "medium" }}>
        <Heading level={4} children="The couple" />
        {wedding.couple.map(guestId => (
          <Guest key={guestId} id={guestId}>
            {({ guest }) => (
              <Box direction="row" gap="xsmall" margin={{ vertical: "xxsmall" }} align="center">
                <Avatar name={guest.name} size="sm" />
                <Text>{guest.name}</Text>
              </Box>
            )}
          </Guest>
        ))}
      </Box>

      <Box margin={{ vertical: "medium" }}>
        <Heading level={4} children="Collaborators" />
        {collaborators.length === 0 && <Text>No collaborators have been added yet.</Text>}
        {!!collaborators.length &&
          collaborators.map(collaborator => (
            <Box direction="row" gap="xsmall" margin={{ vertical: "xxsmall" }} align="center">
              <Avatar name={collaborator.name || collaborator.email} size="sm" />
              <Text>{collaborator.name || collaborator.email}</Text>
            </Box>
          ))}
        {!!pendingRequests.length && (
          <>
            <Heading level="5" children="Pending collaboration invites" margin={{ bottom: "xsmall" }} />
            {pendingRequests.map(inviteRequest => (
              <Box
                key={inviteRequest.id}
                direction="row"
                pad={{ horizontal: "xsmall" }}
                align="center"
                justify="between"
                onClick={() => {}}
                hoverIndicator="dark-6"
              >
                <Text>{inviteRequest.email}</Text>
                <Button icon={<Trash color="dark-1" />} onClick={() => deleteInviteRequest(inviteRequest.id)} />
              </Box>
            ))}
          </>
        )}
        <Text size="small" color="dark-6" margin={{ vertical: "small" }}>
          Invite others to collaborate on organising your wedding?
        </Text>
        <Button label="Invite" alignSelf="start" onClick={() => setShowAddCollaboratorModal(true)} />
      </Box>

      {showAddCollaboratorModal && (
        <Layer>
          <Box width="500px" pad="medium">
            <Button icon={<Close />} alignSelf="end" onClick={() => setShowAddCollaboratorModal(false)} />
            <Heading level={3}>Invite someone to co-edit on your wedding</Heading>
            <Formik initialValues={{ email: "" }} validationSchema={newCollaboratorFormValidationSchema} onSubmit={onNewCollaboratorSubmit}>
              {fProps => (
                <form onSubmit={fProps.handleSubmit} onReset={fProps.handleReset}>
                  <Box align="end">
                    <TextInput name="email" placeholder="enter thier email" {...fProps.getFieldProps("email")} />
                    <Button primary margin={{ vertical: "medium" }} label="Send invite" type="submit" disabled={!fProps.isValid} />
                  </Box>
                </form>
              )}
            </Formik>
          </Box>
        </Layer>
      )}
    </Box>
  );
};

export default WeddingSettings;
