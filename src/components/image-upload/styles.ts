import { Box, BoxProps } from "grommet";
import { transparentize } from "polished";
import styled, { css } from "styled-components";

const overlayHoverStyles = css`
  &:hover {
    opacity: 1;
    background: ${props =>
      typeof props.theme.global?.colors?.brand === "string" ? transparentize(0.5, props.theme.global?.colors?.brand) : "transparent"};

    * {
      color: #fff;
    }
  }
`;

export const SOverlayActions = styled(Box as React.FC<BoxProps & JSX.IntrinsicElements["div"] & { autoHide?: boolean }>).attrs(() => ({
  align: "center",
  justify: "center",
}))`
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  opacity: ${props => (props.autoHide ? 0 : 1)};
  transition: opacity 300ms;
  ${props => (props.autoHide ? overlayHoverStyles : "")}
`;
