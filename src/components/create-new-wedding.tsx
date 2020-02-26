import React, { useState, useContext } from "react";
import { Box, Button, Heading, Text, FormField, TextInput } from "grommet";
import { Close, FormClose } from "grommet-icons";
import { Pulsar } from "gestalt";
import shortid from "shortid";
import * as yup from "yup";
import addDays from "date-fns/addDays";

import { firestore } from "firebase/app";
import AuthContext from "./auth-context";
import { IGuest, IAdminInvite } from "../store/types";
import NewWeddingForm, { TSubmitValue } from "../components/new-wedding-form";

type TBrideOrGroom = Omit<IGuest, "id" | "weddingId">;

interface IProps {
  onClose: () => void;
  onCreateSuccess: (weddingId: string) => void;
}

const CreateNewWedding: React.FC<IProps> = ({ onClose, onCreateSuccess }) => {
  const db = firestore();
  const { user: auth } = useContext(AuthContext);
  const [createProgress, setCreateProgress] = useState<"initial" | "pending" | "success">("initial");
  const [sharedEmails, setSharedEmails] = useState<string[]>([]);
  const [newSharedEmail, setNewSharedEmail] = useState("");
  const emailSchema = yup
    .string()
    .email()
    .required();

  const addWeddingIdToUserWhiteList = (batcher: firestore.WriteBatch) => (weddingId: string) => {
    if (!auth) throw new Error("Not logged in!");
    const ref = db.doc(`users/${auth.uid}`);
    batcher.update(ref, { weddingIds: firestore.FieldValue.arrayUnion(weddingId) });
  };

  const createBrideAndGroom = (batcher: firestore.WriteBatch) => (
    couple: [TBrideOrGroom, TBrideOrGroom],
    weddingId: string
  ): [string, string] => {
    const ids = [shortid.generate(), shortid.generate()];
    const partner1 = {
      ...couple[0],
      partnerId: ids[1],
      weddingId,
      weddingTitle: couple[0].weddingParty,
    };
    const partner2 = {
      ...couple[1],
      weddingId,
      partnerId: ids[0],
      weddingTitle: couple[0].weddingParty,
    };
    batcher.set(db.doc(`guests/${ids[0]}`), partner1);
    batcher.set(db.doc(`guests/${ids[1]}`), partner2);
    return [ids[0], ids[1]];
  };

  const createNewWedding = (batcher: firestore.WriteBatch) => (weddingName: string) => {
    const ref = db.collection("weddings").doc();
    batcher.set(ref, { name: weddingName, owner: auth?.uid });
    return ref.id;
  };

  const onCreateNewWedding = (values: TSubmitValue) => {
    setCreateProgress("pending");
    const batch = db.batch();
    const weddingId = createNewWedding(batch)(values.weddingName);
    addWeddingIdToUserWhiteList(batch)(weddingId);
    const coupleIds = createBrideAndGroom(batch)([values.partners[0], values.partners[1]], weddingId);
    batch.update(db.doc(`weddings/${weddingId}`), { couple: coupleIds });
    batch
      .commit()
      // wait for commit promise before continue as it is important this batch is performed whilst online
      .then(() => {
        setCreateProgress("success");
        createWeddingInviteRecords(weddingId);
        onCreateSuccess(weddingId);
      })
      .catch(e => console.log(e));
  };

  const newSharedEmailIsValid = emailSchema.isValidSync(newSharedEmail);

  const addSharedEmail = (email: string) => {
    setSharedEmails([...sharedEmails, email]);
    setNewSharedEmail("");
  };

  const removeSharedEmail = (idx: number) => {
    setSharedEmails(sharedEmails.filter((_, i) => i !== idx));
  };

  const createWeddingInviteRecords = (weddingId: string) => {
    const batch = db.batch();
    sharedEmails.forEach(email => {
      if (!auth) return;
      const ref = db.collection("adminInvites").doc();
      const data: Omit<IAdminInvite, "id"> = {
        weddingId,
        email,
        from: auth.uid,
        expires: firestore.Timestamp.fromDate(addDays(new Date(), 1)),
      };
      batch.set(ref, data);
    });
    batch.commit();
  };

  return (
    <Box pad="large" fill overflow="auto">
      <Box direction="row" gap="medium">
        <Button icon={<Close />} plain onClick={onClose} />
        <Heading level={1}>It's time to jump the broom!</Heading>
      </Box>
      <Box width={{ max: "1224px" }}>
        {createProgress === "pending" ? (
          <Box fill align="center" justify="center" children={<Pulsar size={200} />} />
        ) : createProgress === "success" ? (
          <Text>Wedding has been created</Text>
        ) : (
          <>
            <NewWeddingForm
              onCancel={onClose}
              onSubmit={onCreateNewWedding}
              formFooter={
                <Box width={{ max: "large" }} margin={{ bottom: "medium" }}>
                  <Heading level={5}>Allow others to edit your wedding details</Heading>
                  <Text size="small">
                    Invite your partner to share the wedding planning. You can also invite other people such as wedding / event planners,
                    giving them select access to part of the wedding
                  </Text>
                  <Text as="p" size="small">
                    Just enter thier email address(es) below, and we will send them an invite
                  </Text>
                  <Box direction="row" gap="xsmall" wrap>
                    {sharedEmails.map((email, idx) => (
                      <Box
                        margin={{ vertical: "small" }}
                        background="light-4"
                        pad="xsmall"
                        direction="row"
                        align="center"
                        alignSelf="start"
                      >
                        <Button plain icon={<FormClose />} onClick={() => removeSharedEmail(idx)} />
                        <Text size="small" color="dark-3" children={email} />
                      </Box>
                    ))}
                  </Box>
                  <Box key={0} direction="row" align="center" gap="small">
                    <Box width="250px">
                      <FormField>
                        <TextInput value={newSharedEmail} onChange={e => setNewSharedEmail(e.target.value)} size="small" />
                      </FormField>
                    </Box>
                    <Button plain active disabled={!newSharedEmailIsValid} onClick={() => addSharedEmail(newSharedEmail)}>
                      <Box elevation="xsmall" pad={{ vertical: "xsmall", horizontal: "medium" }}>
                        <Text size="small">Add</Text>
                      </Box>
                    </Button>
                  </Box>
                </Box>
              }
            />
          </>
        )}
      </Box>
    </Box>
  );
};

export default CreateNewWedding;
