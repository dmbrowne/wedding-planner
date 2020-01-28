import React, { HTMLAttributes, useState, useEffect } from "react";
import { Box, BoxProps, Text, Layer } from "grommet";
import styled from "styled-components";
import { Add } from "grommet-icons";
import firebase, { firestore } from "firebase/app";
import shortid from "shortid";
import { RouteComponentProps } from "react-router-dom";

import NewWeddingForm from "../components/new-wedding-form";
import { IWedding } from "../store/reducers";
import { IGuest } from "../store/types";

type TBrideOrGroom = Omit<IGuest, "fetching" | "id" | "weddingId">;

const Listing = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-gap: ${({ theme }) => theme.global?.spacing};
`;

const RoundedBox = styled(Box)`
  border-radius: 8px;
`;
const FixedCard: React.FC<BoxProps & HTMLAttributes<HTMLDivElement>> = props => (
  <RoundedBox height="150px" {...props} />
);

const WeddingSelect: React.FC<RouteComponentProps> = ({ history }) => {
  const [user, setUser] = useState<{ email: string; weddingIds: string[] } | void>();
  const [weddingFormIsVisible, setWeddingFormVisibility] = useState(false);
  const [weddingsList, setWeddingsList] = useState<(IWedding & { id: string })[]>([]);
  const auth = firebase.auth().currentUser;

  useEffect(() => {
    const unsubscribe = auth
      ? firestore()
          .doc(`users/${auth.uid}`)
          .onSnapshot(snap => {
            setUser(snap.data() as any);
          })
      : () => Promise.resolve();

    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    if (user) {
      const { weddingIds } = user;
      Promise.all(
        weddingIds.map(id =>
          firestore()
            .doc(`weddings/${id}`)
            .get()
        )
      ).then(snaps => {
        const weddings = snaps.reduce(
          (accum: (IWedding & { id: string })[], snap) => [...accum, { id: snap.id, ...(snap.data() as any) }],
          []
        );
        setWeddingsList(weddings);
      });
    }
  }, [user]);

  const addWeddingIdToUserWhiteList = (weddingId: string) => {
    if (!auth) return Promise.resolve(weddingId);
    return firestore()
      .collection("user")
      .doc(auth.uid)
      .update({ weddingIds: firebase.firestore.FieldValue.arrayUnion(weddingId) })
      .then(() => weddingId);
  };

  const createBrideAndGroom = (
    couple: [TBrideOrGroom, TBrideOrGroom],
    weddingId: string
  ): Promise<[string, string]> => {
    const ids = [shortid.generate(), shortid.generate()];
    return Promise.all(
      couple.map((partner, idx) =>
        firestore()
          .doc(`guests/${ids[idx]}`)
          .set({ ...partner, weddingId })
      )
    ).then(() => [ids[0], ids[1]]);
  };

  const createNewWedding = (weddingName: string) => {
    return firestore()
      .collection("weddings")
      .add({
        name: weddingName
      });
  };

  const onCreateNewWedding = (values: { weddingName: string; partner1Name: string; partner2Name: string }) => {
    createNewWedding(values.weddingName)
      .then(({ id }) => addWeddingIdToUserWhiteList(id))
      .then(weddingId => {
        return createBrideAndGroom([{ name: values.partner1Name }, { name: values.partner2Name }], weddingId).then(
          coupleIds =>
            firestore()
              .doc(`weddings/${weddingId}`)
              .update({ couple: coupleIds })
        );
      })
      .then(id => history.push(`/wedding/${id}`));
  };

  return (
    <>
      <Box width={{ max: "1224px" }} pad={{ horizontal: "medium" }} fill margin="auto">
        <Listing>
          {weddingsList.map(wedding => (
            <FixedCard
              elevation="small"
              pad="medium"
              key={wedding.id}
              onClick={() => history.push(`/wedding/${wedding.id}`)}
            >
              <Text size="medium">{wedding.name}</Text>
              <Text size="small" color="dark-6" children={wedding.id} />
            </FixedCard>
          ))}
          <FixedCard
            elevation="small"
            align="center"
            justify="center"
            gap="small"
            onClick={() => setWeddingFormVisibility(true)}
          >
            <Text color="brand">Add a new wedding</Text>
            <Add color="brand" />
          </FixedCard>
        </Listing>
      </Box>
      {weddingFormIsVisible && (
        <Layer full animation="slide">
          <Box pad="large" fill>
            <NewWeddingForm onCancel={() => setWeddingFormVisibility(false)} onSubmit={onCreateNewWedding} />
          </Box>
        </Layer>
      )}
    </>
  );
};

export default WeddingSelect;
