import React, { useRef, useEffect, useState } from "react";
import firebase from "firebase/app";
import { ui } from "../firebase";
import { RouteComponentProps } from "react-router-dom";
import { Heading, Text } from "grommet";

const Login: React.FC<RouteComponentProps> = ({ location, history }) => {
  const [uiLoaded, setUiLoaded] = useState(false);
  const loginElementRef = useRef<null | HTMLDivElement>(null);

  let signInSuccessUrl = "/";

  if (location.search) {
    const params = location.search.slice(1).split("&");
    const urlParams = params.length
      ? params.reduce((accum, param) => {
          const [key, value] = param.split("=");
          return { ...accum, [key]: value };
        }, {} as { [key: string]: string })
      : {};

    signInSuccessUrl = urlParams["redirect"] || signInSuccessUrl;
  }

  const createNewUser = async (auth: firebase.auth.UserCredential) => {
    const { user, additionalUserInfo } = auth;
    if (user && additionalUserInfo) {
      if (additionalUserInfo.isNewUser) {
        const { uid, displayName, email } = user;
        await firebase
          .firestore()
          .collection("users")
          .doc(uid)
          .set({ email, name: displayName });
        return true;
      } else {
        return true;
      }
    } else {
      if (auth.user) {
        await firebase.auth().signOut();
      }
      throw Error("Error retriving auth credentials after sign in");
    }
  };

  useEffect(() => {
    if (loginElementRef.current && !uiLoaded) {
      ui.start(loginElementRef.current, {
        signInOptions: [{ provider: firebase.auth.EmailAuthProvider.PROVIDER_ID, requireDisplayName: false }],
        callbacks: {
          uiShown: () => setUiLoaded(true),
          signInSuccessWithAuthResult: authResult => {
            createNewUser(authResult)
              .then(() => history.push(signInSuccessUrl))
              .catch(() => history.push("/"));
            return false;
          }
        }
      });
    }
  }, []);

  return (
    <>
      <Heading level={1}>Log in</Heading>
      {!uiLoaded && <Text>Loading sign in form...</Text>}
      <div ref={loginElementRef} />
    </>
  );
};

export default Login;
