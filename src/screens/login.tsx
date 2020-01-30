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

  useEffect(() => {
    if (loginElementRef.current && !uiLoaded) {
      ui.start(loginElementRef.current, {
        signInOptions: [{ provider: firebase.auth.EmailAuthProvider.PROVIDER_ID, requireDisplayName: false }],
        callbacks: {
          uiShown: () => setUiLoaded(true),
          signInSuccessWithAuthResult: () => {
            history.push(signInSuccessUrl);
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
