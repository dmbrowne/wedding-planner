import React from "react";
import { Heading } from "grommet";
import { RouteComponentProps } from "react-router-dom";
import TopNav from "../components/top-nav";

const home: React.FC<RouteComponentProps> = () => {
  return (
    <div>
      <TopNav />
      <Heading level="1">Welcome to wedding planner</Heading>
    </div>
  );
};

export default home;
