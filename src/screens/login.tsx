import React, { useContext, useEffect } from "react";
import { RouteComponentProps } from "react-router-dom";
import { Text, Box } from "grommet";
import AuthUi from "../components/auth-ui";
import AuthContext from "../components/auth-context";

const Login: React.FC<RouteComponentProps> = ({ location, history }) => {
  const { authenticated } = useContext(AuthContext);
  let signInSuccessUrl = "/weddings";

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
    if (authenticated) history.push(signInSuccessUrl);
  }, [authenticated]);

  return (
    <Box background="white" fill align="center" justify="center">
      <AuthUi
        onSuccess={() => history.push(signInSuccessUrl)}
        preFormContent={<Text>Login or register by entering your email address</Text>}
      />
    </Box>
  );
};

export default Login;
