import React, { useState, useEffect, useRef, useContext } from "react";
import { RouteComponentProps } from "react-router-dom";
import { firestore } from "firebase";
import { Heading, Box, ResponsiveContext, Image, Button, Text } from "grommet";
import styled from "styled-components";
import { debounce } from "debounce";
import { Add } from "grommet-icons";
import { Node } from "slate";

import { IStory, IChapter } from "../store/types";
import SContainer from "../components/container";
import FirebaseImage from "../components/firebase-image";
import RichText from "../components/editor";
import ImageUpload from "../components/image-upload";

const SChapterImage = styled(Image)`
  border-radius: "50%";
`;

interface IProps extends RouteComponentProps<{ weddingId: string; storyId: string }> {}

const EditStory: React.FC<IProps> = ({ match }) => {
  const { storyId, weddingId } = match.params;
  const { current: db } = useRef(firestore());
  const [story, setStory] = useState<IStory>();
  const [chapters, setChapters] = useState<IChapter[]>();
  const screenSize = useContext(ResponsiveContext);
  const { current: saveText } = useRef(
    debounce((chapterId: string, val: Node[]) => {
      db.doc(`stories/${storyId}/chapters/${chapterId}`).update({ [`text.slate`]: val });
    }, 1000)
  );
  const addChapter = () => {
    if (!chapters || chapters.length === 0) {
      db.collection(`stories/${storyId}/chapters`).add({ order: 1 });
    } else {
      const { order } = chapters.reverse()[0];
      db.collection(`stories/${storyId}/chapters`).add({ order: order + 1 });
    }
  };

  const removeChapter = (chapterId: string) => db.doc(`stories/${storyId}/chapters/${chapterId}`).delete();
  const uploadStoragePath = (chapterId: string) => `weddings/${weddingId}/stories/${storyId}/chapter-${chapterId}`;
  const updateChapterImage = (chapterId: string, imageRef: string) => {
    db.doc(`stories/${storyId}/chapters/${chapterId}`).update({ imageRef });
  };

  useEffect(() => {
    return db.doc(`stories/${storyId}`).onSnapshot(doc => setStory({ id: doc.id, ...(doc.data() as IStory) }));
  }, []);

  useEffect(() => {
    return db
      .collection(`stories/${storyId}/chapters`)
      .orderBy("order")
      .onSnapshot(snap => {
        setChapters(snap.docs.map(doc => ({ id: doc.id, ...(doc.data() as IChapter) })));
      });
  }, []);

  return (
    <SContainer>
      <Heading level={1} children={story?.name} />
      {chapters?.map(chapter => (
        <Box key={chapter.id} direction={screenSize === "small" ? "column" : "row"} gap="medium" margin={{ vertical: "medium" }}>
          <Box height={{ max: "300px" }} align="center" style={{ flex: 1 }}>
            {chapter.imageRef ? (
              <FirebaseImage imageRef={chapter.imageRef}>
                {url => <SChapterImage style={{ borderRadius: "50%", maxWidth: "300px" }} src={url} fit="cover" />}
              </FirebaseImage>
            ) : (
              <ImageUpload
                name={`${chapter.id}-image`}
                uploadRefPath={uploadStoragePath(chapter.id)}
                onUploadSuccess={snap => updateChapterImage(chapter.id, snap.ref.fullPath)}
              />
            )}
          </Box>
          <Box height="300px" style={{ flex: 1 }}>
            <RichText initialValue={chapter?.text?.slate} onValueUpdate={val => saveText(chapter.id, val)} />
          </Box>
        </Box>
      ))}
      <Box align="center">
        <Button plain onClick={addChapter} margin={{ vertical: "large" }}>
          <Box pad="xsmall">
            <Box background="brand" alignSelf="center" style={{ borderRadius: "50%" }} pad="small" children={<Add size="large" />} />
            <Text margin={{ top: "small" }}>Add a chapter to your story</Text>
          </Box>
        </Button>
      </Box>
    </SContainer>
  );
};

export default EditStory;
