import React, { ReactNode } from "react";
import { Box, Text, Button } from "grommet";
import { Close } from "grommet-icons";

interface IProps {
  render?: () => ReactNode;
  onDelete?: () => void;
}
const Tag: React.FC<IProps> = ({ render, children, onDelete }) => {
  return (
    <Box background="light-2" pad="xsmall" direction="row" gap="small" align="center" alignSelf="start">
      {children}
      {onDelete && (
        <Button plain={undefined} onClick={onDelete}>
          <Box pad={{ right: "xsmall" }} children={<Close size="small" />} />
        </Button>
      )}
    </Box>
  );
};

export default Tag;
