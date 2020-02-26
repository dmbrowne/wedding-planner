import React, { useContext, ReactNode } from "react";
import { GoogleApiContext } from "./google-api-context";
import { Box, Text } from "grommet";
import { Alert } from "grommet-icons";
import { Spinner } from "gestalt";

interface IApiGuardProps {
  loading?: ReactNode;
  errorComponent?: () => ReactNode;
}

const GoogleApiGuard: React.FC<IApiGuardProps> = ({ children, loading, errorComponent }) => {
  const { status } = useContext(GoogleApiContext);
  if (status === "error") {
    return errorComponent ? (
      <>{errorComponent()}</>
    ) : (
      <Box align="center">
        <Alert />
        <Text size="small" color="light-6">
          An error has occured.Please try refreshing the page
        </Text>
      </Box>
    );
  }
  if (status !== "ready") {
    return loading ? <>{loading}</> : <Spinner show accessibilityLabel="Wait for google api to load" />;
  }
  return <>{children}</>;
};

export function withGoogleApiGuard(apiGuardProps?: Partial<IApiGuardProps>) {
  return function googleApiGuardWrappedComponent<P>(Component: React.ComponentType<P>) {
    return (props: P) => (
      <GoogleApiGuard {...(apiGuardProps || {})}>
        <Component {...props} />
      </GoogleApiGuard>
    );
  };
}

export default GoogleApiGuard;
