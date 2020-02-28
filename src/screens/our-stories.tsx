import React, { useState, useEffect, useRef, useContext } from "react";
import { Text, Heading, Box, Button } from "grommet";
import { firestore } from "firebase/app";
import { Spinner } from "gestalt";
import { RouteComponentProps, Link } from "react-router-dom";
import { Add } from "grommet-icons";

import SContainer from "../components/container";
import AuthContext from "../components/auth-context";
import RoundedCard from "../components/rounded-card";
import AddNewStoryModal from "../components/add-new-story-modal";
import GridListing from "../styled/grid-listing";
import { IStory } from "../store/types";

interface IProps extends RouteComponentProps<{ weddingId: string }> {}
type TFetchStatus = "initial" | "inProgress" | "success" | "error";

const OurStories: React.FC<IProps> = ({ match, history }) => {
  const { weddingId } = match.params;
  const { current: db } = useRef(firestore());
  const { user: auth } = useContext(AuthContext);
  const [fetchOwnedStatus, setFetchOwnedStatus] = useState<TFetchStatus>("initial");
  const [fetchCollabedStatus, setFetchCollabedStatus] = useState<TFetchStatus>("initial");
  const [ownedStories, setOwnerStories] = useState<IStory[]>([]);
  const [collabedStories, setCollabedStories] = useState<IStory[]>([]);
  const [showNewStoryModal, setShowNewStoryModal] = useState(false);

  useEffect(() => {
    if (auth) {
      const ref = db.collection(`stories`).where("weddingId", "==", weddingId);

      setFetchOwnedStatus("inProgress");
      const unsubscribeOwnedStories = ref.where("_private.owner", "==", auth.uid).onSnapshot(snap => {
        const fetchedStories = snap.docs.map(doc => ({ id: doc.id, ...(doc.data() as IStory) }));
        setOwnerStories(fetchedStories);
        setFetchOwnedStatus("success");
      });

      setFetchCollabedStatus("inProgress");
      const unsubscribeCollabStories = ref.where("_private.collaborators", "array-contains", auth.uid).onSnapshot(snap => {
        const fetchedStories = snap.docs.map(doc => ({ id: doc.id, ...(doc.data() as IStory) }));
        setCollabedStories(fetchedStories);
        setFetchCollabedStatus("success");
      });

      return () => {
        unsubscribeOwnedStories();
        unsubscribeCollabStories();
      };
    }
  }, [auth]);

  const fetchStatePredicate = (status: TFetchStatus, or?: boolean) => {
    return or
      ? fetchOwnedStatus === status || fetchCollabedStatus === status
      : fetchOwnedStatus === status && fetchCollabedStatus === status;
  };
  const createStory = ({ name, collaborators }: { name: string; collaborators: string[] }) => {
    if (!auth) return;
    const newStory: Omit<IStory, "id"> = {
      name,
      weddingId,
      _private: { owner: auth.uid, ...(!!collaborators.length ? { collaborators } : {}) },
    };
    const ref = db.collection(`stories`).doc();
    ref.set(newStory).then(() => {
      history.push(`${match.url}/${ref.id}`);
    });
  };
  const allStories = [...ownedStories, ...collabedStories].sort((a, b) => (a.name > b.name ? 1 : a.name < b.name ? -1 : 0));
  const showUi = fetchStatePredicate("inProgress", true) || fetchStatePredicate("success", true);

  return (
    <SContainer>
      <Heading level={1}>Stories</Heading>

      {showUi && (
        <GridListing>
          {fetchStatePredicate("inProgress", true) && <Spinner accessibilityLabel="Loading stories" show />}
          {fetchStatePredicate("success") &&
            allStories.map(story => (
              <Button plain key={story.id} onClick={() => history.push(`${match.url}/${story.id}`)}>
                <RoundedCard elevation="small" pad={{ horizontal: "medium" }}>
                  <Heading level={3} size="small" children={story.name} />
                </RoundedCard>
              </Button>
            ))}
          <RoundedCard elevation="small" justify="center">
            <Button plain onClick={() => setShowNewStoryModal(true)}>
              <Box align="center" gap="small">
                <Text color="brand">Add Story</Text>
                <Add color="brand" />
              </Box>
            </Button>
          </RoundedCard>
        </GridListing>
      )}
      {showNewStoryModal && <AddNewStoryModal onSubmit={createStory} onClose={() => setShowNewStoryModal(false)} />}
    </SContainer>
  );
};

export default OurStories;
