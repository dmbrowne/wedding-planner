import React, { useState, useEffect } from "react";
import { Box, Text, Layer, Heading, Button } from "grommet";
import styled from "styled-components";
import { Add, Close } from "grommet-icons";
import firebase, { firestore } from "firebase/app";
import shortid from "shortid";
import { RouteComponentProps } from "react-router-dom";

import NewWeddingForm, { TSubmitValue } from "../components/new-wedding-form";
import { IWedding } from "../store/reducers";
import { IGuest } from "../store/types";
import { Button as GestaltButton, Pulsar } from "gestalt";
import RoundedCard from "../components/rounded-card";

type TBrideOrGroom = Omit<IGuest, "id" | "weddingId">;

const Listing = styled.div`
  display: grid;
  grid-gap: ${({ theme }) => theme.global?.spacing};

  @media (min-width: 600px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

type TWedding = { id: string } & ((IWedding & { exists: true }) | { exists: false });

const WeddingSelect: React.FC<RouteComponentProps> = ({ history }) => {
  const [user, setUser] = useState<{ email: string; weddingIds?: string[] } | void>();
  const [weddingFormIsVisible, setWeddingFormVisibility] = useState(false);
  const [weddingsList, setWeddingsList] = useState<TWedding[]>([]);
  const [createProgress, setCreateProgress] = useState<"initial" | "pending" | "success">("initial");
  const auth = firebase.auth().currentUser;

  useEffect(() => {
    const unsubscribe = auth
      ? firestore()
          .doc(`users/${auth.uid}`)
          .onSnapshot(snap => setUser(snap.data() as any))
      : () => Promise.resolve();

    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    if (user) {
      const { weddingIds } = user;
      if (!weddingIds) return;
      Promise.all(
        weddingIds.map(id =>
          firestore()
            .doc(`weddings/${id}`)
            .get()
        )
      ).then(snaps => {
        const weddings = snaps.reduce(
          (accum: TWedding[], snap) => [
            ...accum,
            snap.exists
              ? { id: snap.id, exists: true as true, ...(snap.data() as IWedding) }
              : { id: snap.id, exists: false as false }
          ],
          []
        );
        setWeddingsList(weddings);
      });
    }
  }, [user]);

  const addWeddingIdToUserWhiteList = (batcher: firestore.WriteBatch) => (weddingId: string) => {
    if (!auth) throw new Error("Not logged in!");
    const ref = firestore().doc(`users/${auth.uid}`);
    batcher.update(ref, { weddingIds: firebase.firestore.FieldValue.arrayUnion(weddingId) });
  };

  const createBrideAndGroom = (batcher: firestore.WriteBatch) => (
    couple: [TBrideOrGroom, TBrideOrGroom],
    weddingId: string
  ): [string, string] => {
    const ids = [shortid.generate(), shortid.generate()];
    couple.forEach((partner, idx) => {
      const ref = firestore().doc(`guests/${ids[idx]}`);
      const dupedIds = [...ids];
      dupedIds.splice(idx, 1);
      batcher.set(ref, { ...partner, partnerId: dupedIds[0], weddingId });
    });
    return [ids[0], ids[1]];
  };

  const createNewWedding = (batcher: firestore.WriteBatch) => (weddingName: string) => {
    const ref = firestore()
      .collection("weddings")
      .doc();
    batcher.set(ref, { name: weddingName });
    return ref.id;
  };

  const onCreateNewWedding = (values: TSubmitValue) => {
    setCreateProgress("pending");
    const batch = firestore().batch();
    const weddingId = createNewWedding(batch)(values.weddingName);
    addWeddingIdToUserWhiteList(batch)(weddingId);
    const coupleIds = createBrideAndGroom(batch)([values.partners[0], values.partners[1]], weddingId);
    batch.update(firestore().doc(`weddings/${weddingId}`), { couple: coupleIds });
    batch
      .commit()
      .then(() => {
        setCreateProgress("success");
        history.push(`/wedding/${weddingId}`);
      })
      .catch(e => console.log(e));
  };

  const removeWedding = (weddingId: string) => {
    if (auth) {
      firestore()
        .doc(`users/${auth.uid}`)
        .update({ weddingIds: firestore.FieldValue.arrayRemove(weddingId) });
    }
  };

  return (
    <>
      <Box width={{ max: "1224px" }} pad="medium" fill margin="auto">
        <Listing>
          {weddingsList.map(wedding => (
            <RoundedCard
              elevation="small"
              pad="medium"
              key={wedding.id}
              onClick={wedding.exists ? () => history.push(`/wedding/${wedding.id}`) : undefined}
            >
              {wedding.exists ? (
                <>
                  <Text size="medium">{wedding.name}</Text>
                  <Text size="small" color="dark-6" children={wedding.id} />
                </>
              ) : (
                <>
                  <Text size="medium" color="neutral-4" children="This wedding can't be found" />
                  <Text size="small" color="dark-6" children={wedding.id} margin={{ bottom: "small" }} />
                  <Text size="small" children="It may have been deleted, remove it from your account?" />
                  <Box width="small" margin={{ top: "small" }}>
                    <GestaltButton size="sm" color="red" text="Remove" onClick={() => removeWedding(wedding.id)} />
                  </Box>
                </>
              )}
            </RoundedCard>
          ))}
          <RoundedCard
            elevation="small"
            align="center"
            justify="center"
            gap="small"
            onClick={() => setWeddingFormVisibility(true)}
          >
            <Text color="brand">Add a new wedding</Text>
            <Add color="brand" />
          </RoundedCard>
        </Listing>
      </Box>
      {weddingFormIsVisible && (
        <Layer full animation="slide">
          <Box pad="large" fill>
            <Box direction="row" gap="medium">
              <Button icon={<Close />} plain onClick={() => setWeddingFormVisibility(false)} />
              <Heading level={1}>It's time to jump the broom!</Heading>
            </Box>
            <Box width={{ max: "1224px" }}>
              {createProgress === "pending" ? (
                <Box fill align="center" justify="center" children={<Pulsar size={200} />} />
              ) : createProgress === "success" ? (
                <Text>Wedding has been created</Text>
              ) : (
                <NewWeddingForm onCancel={() => setWeddingFormVisibility(false)} onSubmit={onCreateNewWedding} />
              )}
            </Box>
          </Box>
        </Layer>
      )}
    </>
  );
};

export default WeddingSelect;
