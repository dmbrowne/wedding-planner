import React from "react";
import { withRouter, RouteComponentProps } from "react-router-dom";

import { Box, Text } from "grommet";

interface IProps extends RouteComponentProps {
  rootPath?: string;
}

const SiteNav: React.FC<IProps> = ({ history, rootPath = "" }) => {
  const isActive = (path: string) => history.location.pathname.startsWith(`${rootPath}/${path}`);
  return (
    <Box gap="xsmall">
      <Box hoverIndicator="light-3" color="transparent" pad="small" onClick={() => history.push(`${rootPath}/guests`)}>
        <Text color={isActive("guests") ? "dark-1" : "dark-6"} weight={600} children="Guests" />
      </Box>
      <Box hoverIndicator="light-3" color="transparent" pad="small" onClick={() => history.push(`${rootPath}/events`)}>
        <Text color={isActive("events") ? "dark-1" : "dark-6"} weight={600} children="Events" />
      </Box>
    </Box>
  );
};

export default withRouter(SiteNav);
