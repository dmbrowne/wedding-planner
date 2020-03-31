import React, { ReactNode } from "react";
import styled from "styled-components";
import { Title, Subtitle, Description, Primary, Props, Stories } from "@storybook/addon-docs/blocks";
import ImageUpload from ".";
import { FirebaseImageComponent } from "../firebase-image";
import ImageUploadComponent from "./component";

export default {
  title: "Components|Image Upload",
  component: ImageUpload,
  subcomponents: {
    FirebaseImage: FirebaseImageComponent,
    ImageUploadComponent,
  },
  parameters: {
    docs: {
      page: () => (
        <>
          <Title />
          <Subtitle />
          <Description />
          <Primary />
          <Props />
          <Stories />
        </>
      ),
    },
  },
};

const Center = styled.div`
  width: 200px;
  height: 200px;
`;

export const Default = () => <ImageUpload uploadRefPath="/image/blah" onUploadSuccess={() => {}} name="image" />;

Default.story = {
  name: "image-upload",
  description: "description",
  decorators: [(storyFn: () => ReactNode) => <Center>{storyFn()}</Center>],
};
