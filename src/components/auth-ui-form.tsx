import React, { useState } from "react";
import { auth, functions } from "firebase/app";
import { Box, Text, TextInput, Button } from "grommet";
import { Spinner } from "gestalt";

export interface IProps {
  onSuccess?: (user: auth.UserCredential) => void;
  presetEmail?: string;
  emailDisabled?: boolean;
}

const AuthUiForm: React.FC<IProps> = ({ onSuccess, presetEmail, emailDisabled }) => {
  const checkAccountExistence = functions().httpsCallable("doesAccountExist");
  const [email, setEmail] = useState(presetEmail || "");
  const [password, setPassword] = useState("");
  const [authMode, setAuthMode] = useState<"login" | "register" | void>();
  const [showSpinner, setShowSpinner] = useState(false);
  const [authError, setAuthError] = useState("");

  const doesAccountExist = () =>
    checkAccountExistence({ email }).then(({ data: exists }) => {
      if (exists) setAuthMode("login");
      else setAuthMode("register");
      return;
    });

  const onFormSubmit = () => {
    setAuthError("");
    setShowSpinner(true);
    if (!authMode) {
      doesAccountExist().then(() => setShowSpinner(false));
    } else {
      const action = () =>
        authMode === "login" ? auth().signInWithEmailAndPassword(email, password) : auth().createUserWithEmailAndPassword(email, password);
      action()
        .then(onSuccess)
        .catch(e => setAuthError(e.message));
    }
  };

  const formIsValid = () => {
    if (!authMode) return !!email;
    else return !!password;
  };

  return (
    <>
      <Box margin={{ vertical: "medium" }}>
        <TextInput
          placeholder="Email address"
          value={email}
          onChange={e => setEmail(e.target.value)}
          disabled={!!authMode || emailDisabled}
        />
      </Box>
      {!!authMode && (
        <Box margin={{ vertical: "medium" }}>
          <Text margin={{ bottom: "small" }} size="small" color="dark-6">
            {authMode === "login" ? "Enter you password" : "Set a password to setup your account"}
          </Text>
          <TextInput type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
        </Box>
      )}

      {!!authError && <Text margin="small" color="status-error" children={authError} />}

      <Box direction="row" align="center" gap="small" margin={{ top: "small" }}>
        <Button
          disabled={!formIsValid() || showSpinner}
          label={!authMode ? "Next" : authMode === "login" ? "Login" : "Create account"}
          alignSelf="center"
          onClick={onFormSubmit}
          primary
        />
        <Spinner show={showSpinner} accessibilityLabel="loading" {...{ size: "sm" }} />
      </Box>
    </>
  );
};

export default AuthUiForm;
