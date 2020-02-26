import React from "react";
import { Box } from "grommet";
import BreadcrumbBar from "./breadcrumb-bar";
import TopMenu from "./top-menu";

const TopNav = () => {
  return (
    <Box
      fill="horizontal"
      pad={{ horizontal: "medium", vertical: "small" }}
      background="#1d1d1d"
      direction="row"
      align="center"
      justify="between"
    >
      <div>
        <BreadcrumbBar />
      </div>
      <TopMenu />
    </Box>
  );
};

export default TopNav;
