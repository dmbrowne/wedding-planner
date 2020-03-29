import React, { useEffect, useRef, useState } from "react";
import { firestore } from "firebase/app";
import { Box, Text, Button } from "grommet";
import { Avatar } from "gestalt";
import { useStateSelector } from "../store/redux";
import { weddingCollaboratorsOrderedByEmailSelector } from "../selectors/selectors";
import { IAdminInvite } from "../store/types";
import PendingCollaborationInviteRequests from "./pending-collaboration-invite-requests";

interface Props {
  onAddCollaborator: () => any;
  showPendingInvites: boolean;
  weddingId: string;
}

const CollaboratorsList: React.FC<Props> = ({ onAddCollaborator, weddingId, showPendingInvites }) => {
  const { current: db } = useRef(firestore());
  const collaborators = useStateSelector(weddingCollaboratorsOrderedByEmailSelector);
  const [pendingRequests, setPendingRequests] = useState<IAdminInvite[]>([]);

  useEffect(() => {
    return db
      .collection("adminInvites")
      .where("weddingId", "==", weddingId)
      .onSnapshot(snap => setPendingRequests(snap.docs.map(doc => ({ id: doc.id, ...(doc.data() as IAdminInvite) }))));
  }, []);

  return (
    <>
      {collaborators.length === 0 && <Text>No collaborators have been added yet.</Text>}
      {!!collaborators.length &&
        collaborators.map(collaborator => (
          <Box key={collaborator.id} direction="row" gap="xsmall" margin={{ vertical: "xxsmall" }} align="center">
            <Avatar name={collaborator.name || collaborator.email} size="sm" />
            <Text>{collaborator.name || collaborator.email}</Text>
          </Box>
        ))}
      {showPendingInvites && <PendingCollaborationInviteRequests pendingRequests={pendingRequests} />}
      {onAddCollaborator && (
        <Box>
          <Text size="small" color="dark-6" margin={{ vertical: "small" }}>
            Invite others to collaborate on organising your wedding?
          </Text>
          <Button label="Invite" alignSelf="start" onClick={onAddCollaborator} />
        </Box>
      )}
    </>
  );
};

export default CollaboratorsList;
