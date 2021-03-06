import React, { ReactNode } from "react";
import { Box } from "grommet";

import AuthUiForm, { IProps as IAuthFromProps } from "../auth-ui-form";
import { ReactComponent as Logo } from "../../icons/jumpbroom.svg";

interface IProps extends IAuthFromProps {
  preFormContent?: ReactNode;
}

export const AuthUi: React.FC<IProps> = ({ preFormContent, ...props }) => {
  return (
    <Box
      pad={{ vertical: "large", horizontal: "medium" }}
      width={{ max: "500px" }}
      style={{ borderRadius: "16px" }}
      border={{ side: "all", color: "light-6" }}
    >
      <Box align="center" margin={{ bottom: "large" }} children={<Logo />} />
      {preFormContent}

      <AuthUiForm {...props} />
    </Box>
  );
};

export default AuthUi;
