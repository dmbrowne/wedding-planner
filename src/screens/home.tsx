import React from "react";
import { Heading } from "grommet";
import { RouteComponentProps } from "react-router-dom";

const home: React.FC<RouteComponentProps> = () => {
  return (
    <div>
      <Heading level="1">Welcome to wedding planner</Heading>
    </div>
  );
};

export default home;
