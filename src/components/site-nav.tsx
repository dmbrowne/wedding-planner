import React from "react";
import { withRouter, RouteComponentProps } from "react-router-dom";

import { Box } from "grommet";
import MenuItem from "./menu-item";

interface IProps extends RouteComponentProps {
  rootPath?: string;
}

const SiteNav: React.FC<IProps> = ({ history, rootPath = "" }) => {
  return (
    <Box direction="row" pad="small" gap="xsmall">
      <MenuItem
        active={history.location.pathname.startsWith(`${rootPath}/guests`)}
        onClick={() => history.push(`${rootPath}/guests`)}
        children="Guests"
      />
      <MenuItem
        active={history.location.pathname.startsWith(`${rootPath}/events`)}
        onClick={() => history.push(`${rootPath}/events`)}
        children="Events"
      />
    </Box>
  );
};

export default withRouter(SiteNav);
