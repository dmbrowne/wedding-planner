import React, { HTMLAttributes } from "react";
import { Box, BoxProps } from "grommet";
import styled from "styled-components";

const RoundedBox = styled(Box)`
  border-radius: 8px;
  background: #fff;
`;

export const RoundedCard: React.FC<BoxProps & HTMLAttributes<HTMLDivElement>> = props => (
  <RoundedBox height="200px" {...props} />
);

export default RoundedCard;
