import React, { useRef } from "react";
import { firestore } from "firebase/app";
import { Heading, Box, Text, Button } from "grommet";
import { Trash } from "grommet-icons";
import { IAdminInvite } from "../store/types";

interface Props {
  pendingRequests: IAdminInvite[];
}
const PendingCollaborationInviteRequests: React.FC<Props> = ({ pendingRequests }) => {
  const { current: db } = useRef(firestore());
  const deleteInviteRequest = (inviteId: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this co-edit invitation request?");
    if (confirmed) {
      db.doc(`adminInvites/${inviteId}`).delete();
    }
  };

  return (
    <>
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
    </>
  );
};

export default PendingCollaborationInviteRequests;
