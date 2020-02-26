import React, { useRef } from "react";
import { Box, Heading, Text, CheckBox } from "grommet";
import firebase from "firebase/app";
import { RouteComponentProps } from "react-router-dom";
import debounce from "debounce";

import RichText from "../components/editor";
import SContainer from "../components/container";
import { useStateSelector } from "../store/redux";
import ImageUpload from "../components/image-upload";
import { Node } from "slate";
import { Spinner } from "gestalt";

const CoverEdit: React.FC<RouteComponentProps<{ weddingId: string }>> = ({ match }) => {
  const db = firebase.firestore();
  const { wedding } = useStateSelector(state => state.activeWedding);
  const weddingDbRef = db.doc(`weddings/${wedding?.id}`);
  const { current: saveText } = useRef(debounce((key: string, val: Node[]) => weddingDbRef.update({ [key]: val }), 1000));
  const showWelcome = wedding?.cover?.showWelcome;

  const onSetShowWelcome = (show: boolean) => weddingDbRef.update({ [`cover.showWelcome`]: show });
  const onCoverTextUpdate = (slateVal: Node[]) => saveText("cover.message.slate", slateVal);
  const onWelcomeTextUpdate = (slateVal: Node[]) => saveText("cover.welcomeMessage.slate", slateVal);
  const onDeleteCoverImage = () => {
    weddingDbRef.update({ [`cover.imageRef`]: firebase.firestore.FieldValue.delete() });
  };
  const onDeleteWelcomeImage = () => {
    weddingDbRef.update({ [`cover.welcomeImageRef`]: firebase.firestore.FieldValue.delete() });
  };
  const onBackgroundColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    weddingDbRef.update({ [`cover.backgroundColor`]: e.target.value });
  };
  const saveCoverImageReference = (snap: firebase.storage.UploadTaskSnapshot) => {
    weddingDbRef.update({ [`cover.imageRef`]: snap.ref.fullPath });
  };
  const saveWelcomeImageRef = (snap: firebase.storage.UploadTaskSnapshot) => {
    weddingDbRef.update({ [`cover.welcomeImageRef`]: snap.ref.fullPath });
  };

  if (!wedding || !wedding.name) {
    return <Spinner accessibilityLabel="Loading wedding info" show={true} />;
  }

  return (
    <SContainer>
      <Heading level={1}>Website Cover</Heading>
      <Box direction="row" gap="medium">
        <Box style={{ flex: 1 }} height="300px">
          <ImageUpload
            name="cover-image"
            uploadRefPath={`weddings/${wedding?.id}/cover`}
            onUploadSuccess={saveCoverImageReference}
            previewImageRef={wedding?.cover?.imageRef}
            onDeleteSuccess={onDeleteCoverImage}
            label="Upload an image to use for the website header"
          />
        </Box>
        <Box style={{ flex: 1 }} height="300px" elevation="small">
          <RichText
            placeholder="Enter brief message to accompany your wedding title"
            initialValue={wedding?.cover?.message?.slate}
            onValueUpdate={onCoverTextUpdate}
          />
        </Box>
      </Box>
      <Box margin={{ top: "large" }}>
        <CheckBox
          label="Additional welcome message"
          checked={wedding.cover?.showWelcome || false}
          onChange={e => onSetShowWelcome(e.target.checked)}
        />
        <Box style={{ opacity: showWelcome ? 1 : 0.2 }} direction="row" gap="medium" margin={{ top: "medium" }}>
          <Box style={{ flex: 1 }} elevation={showWelcome ? "small" : undefined} height="300px">
            {showWelcome ? (
              <RichText
                placeholder="A welcoming message"
                initialValue={wedding.cover?.welcomeMessage?.slate}
                onValueUpdate={onWelcomeTextUpdate}
              />
            ) : wedding.cover?.welcomeMessage?.slate ? (
              <RichText
                placeholder="A welcoming message"
                disabled={true}
                initialValue={wedding.cover?.welcomeMessage?.slate}
                onValueUpdate={onWelcomeTextUpdate}
              />
            ) : null}
          </Box>
          <Box style={{ flex: 1 }} height="300px">
            <Text margin={{ top: "medium", bottom: "xsmall" }}>Background Colour</Text>
            <input disabled={!showWelcome} type="color" onChange={onBackgroundColorChange} value={wedding.cover?.backgroundColor || ""} />
            <Text margin={{ top: "medium", bottom: "xsmall" }}>Background Image</Text>
            <Box height="200px">
              <ImageUpload
                name="welcome-image"
                uploadRefPath={`weddings/${wedding?.id}/welcomeImage`}
                onUploadSuccess={saveWelcomeImageRef}
                previewImageRef={wedding?.cover?.welcomeImageRef}
                disabled={!showWelcome}
                onDeleteSuccess={onDeleteWelcomeImage}
              />
            </Box>
          </Box>
        </Box>
      </Box>
    </SContainer>
  );
};

export default CoverEdit;
