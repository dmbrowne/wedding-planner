import { Box } from "grommet";
import styled from "styled-components";

const SContainer = styled(Box).attrs(() => ({
  pad: { horizontal: "medium" },
  margin: { bottom: "large" },
}))`
  display: block;
  width: 100%;
`;

export default SContainer;
