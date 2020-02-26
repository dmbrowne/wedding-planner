import React from "react";
import firebase from "firebase/app";
import ImageUploadComponent, { IComponentProps } from "./component";

interface IProps extends Omit<IComponentProps, "onInputFileChange" | "imageRef" | "onDelete"> {
  fileTypeWhiteList?: MimeType["type"][];
  uploadRefPath: string;
  onUploadSuccess: (snap: firebase.storage.UploadTaskSnapshot) => void;
  onDeleteSuccess?: (snap: firebase.storage.UploadTaskSnapshot) => void;
  previewImageRef?: string;
}

const ImageUpload: React.FC<IProps> = ({
  uploadRefPath,
  fileTypeWhiteList,
  onUploadSuccess,
  onDeleteSuccess,
  previewImageRef,
  ...props
}) => {
  const allowedFileTypes = fileTypeWhiteList || ["image/png", "image/jpeg"];
  const storageRef = firebase.storage().ref();

  const onUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const file = e.target.files[0];
    if (!allowedFileTypes.some(kind => file.type === kind)) return;

    const contentType = file.type && file.type.split("/")[1];
    const imagesRef = storageRef.child(uploadRefPath);

    imagesRef.put(file, contentType ? { contentType } : undefined).then(onUploadSuccess);
  };

  const onDelete = () => {
    if (!previewImageRef) return;
    const confirmed = window.confirm("Delete this image?");
    if (confirmed) {
      storageRef
        .child(previewImageRef)
        .delete()
        .then(onDeleteSuccess);
    }
  };

  return (
    <ImageUploadComponent
      imageRef={previewImageRef}
      onInputFileChange={onUpload}
      onDelete={onDeleteSuccess ? onDelete : undefined}
      {...props}
    />
  );
};

export default ImageUpload;
