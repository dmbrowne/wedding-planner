import React, { HTMLAttributes } from "react";
import { Grommet, Button, Box, Text, ButtonProps } from "grommet";

interface IMenuItemProps extends ButtonProps, Omit<HTMLAttributes<HTMLButtonElement>, "color"> {
  active?: boolean;
}

const MenuItem: React.FC<IMenuItemProps> = ({ children, active, ...props }) => (
  <Grommet theme={{ button: { border: { radius: "32px" } } }}>
    <Button hoverIndicator="light-3" color="transparent" primary {...props}>
      <Box pad="small">
        <Text color={active ? "dark-1" : "dark-6"} weight={600} children={children} />
      </Box>
    </Button>
  </Grommet>
);

export default MenuItem;
