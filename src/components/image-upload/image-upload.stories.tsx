import React, { ReactNode } from "react";
import { ImageUpload } from ".";
import { FirebaseImageComponent } from "../firebase-image";
import { ImageUploadComponent } from "./component";
import Center from "../../styled-components/storybook-components";

export default {
  title: "Components|Image Upload",
  component: ImageUpload,
  subcomponents: {
    FirebaseImage: FirebaseImageComponent,
    ImageUploadComponent,
  },
};

export const ToStorybook = () => <ImageUpload uploadRefPath="/image/blah" onUploadSuccess={() => {}} name="image" />;

ToStorybook.story = {
  name: "image-upload",
  decorators: [
    (storyFn: () => ReactNode) => (
      <Center>
        <div style={{ height: 200 }}>{storyFn()}</div>
      </Center>
    ),
  ],
};
