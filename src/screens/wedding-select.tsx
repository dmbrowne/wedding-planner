import React, { HTMLAttributes, useState, useEffect } from "react";
import { Box, BoxProps, Text, Layer } from "grommet";
import styled from "styled-components";
import { Add } from "grommet-icons";
import firebase from "firebase/app";

import NewWeddingForm from "../components/new-wedding-form";
import shortid from "shortid";
import { RouteComponentProps } from "react-router-dom";
import { IWedding } from "../store/reducers";

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
  const [weddingFormIsVisible, setWeddingFormVisibility] = useState(false);
  const [weddingsList, setWeddingsList] = useState<(IWedding & { id: string })[]>([]);
  const user = firebase.auth().currentUser;

  useEffect(() => {
    console.log(user);
    if (user) {
      firebase
        .firestore()
        .collection("weddings")
        .where("administrators", "array-contains", user.uid)
        .get()
        .then(querySnapshot => {
          const weddings = querySnapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
          console.log(weddings);
          setWeddingsList(weddings);
        })
        .catch(() => {});
    }
  }, [user]);

  const createNewWdding = (values: { weddingName: string; partner1Name: string; partner2Name: string }) => {
    firebase
      .firestore()
      .collection("weddings")
      .add({
        name: values.weddingName,
        couple: {
          [shortid.generate()]: {
            name: values.partner1Name
          },
          [shortid.generate()]: {
            name: values.partner2Name
          }
        }
      })
      .then(({ id }) => {
        history.push(`/wedding/${id}`);
      });
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
              <Text size="small" color="dark-6">
                {wedding.id}
              </Text>
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
            <NewWeddingForm onCancel={() => setWeddingFormVisibility(false)} onSubmit={createNewWdding} />
          </Box>
        </Layer>
      )}
    </>
  );
};

export default WeddingSelect;
