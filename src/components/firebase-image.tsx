import React, { useState, ReactNode, memo } from "react";
import firebase from "firebase/app";

const FirebaseImageComponent: React.FC<{ imageRef: string; children: (url: string) => ReactNode }> = ({ imageRef, children }) => {
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
