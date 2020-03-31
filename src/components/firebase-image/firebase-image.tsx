import React, { useState, ReactNode, memo, FC } from "react";
import firebase from "firebase/app";

interface IProps {
  /** reference path to resource on _firebase_ storage */
  imageRef: string;
  /** render prop with the download URL as it's only argument */
  children: (url: string) => ReactNode;
}

/**
 * This component does a lookup for a resource on firebase storage, and attempts to fetch the _downloadUrl_. Once the _doenloadURL_ has been fetched, the children prop is then rendered with the `downloadURL` argument.
 *
 * #### NOTE
 * the children prop does not wait for the `downloadURL` fetch is complete. children is immediately rendered and then re-rendered once the `downloadURL` is fetched.
 */
export const FirebaseImageComponent: FC<IProps> = ({ imageRef, children }: IProps) => {
  const [url, setUrl] = useState("");
  firebase
    .storage()
    .ref(imageRef)
    .getDownloadURL()
    .then(downloadurl => setUrl(downloadurl));

  return <>{children(url)}</>;
};

const FirebaseImage = memo(FirebaseImageComponent);

export default FirebaseImage;
