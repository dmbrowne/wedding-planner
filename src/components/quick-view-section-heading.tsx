import React from "react";
import { Box, Button, Text, Heading } from "grommet";

interface IQuickViewSectionHeading {
  title: string;
  showToggle: boolean;
  onToggle: () => void;
  toggleLabel: string;
}

export const QuickViewSectionHeading: React.FC<IQuickViewSectionHeading> = ({
  title,
  showToggle,
  onToggle,
  toggleLabel
}) => (
  <Box direction="row" gap="small" align="center" margin={{ top: "medium", bottom: "xsmall" }}>
    <Heading level={3} size="small" margin="none" children={title} />
    {showToggle && (
      <Button plain onClick={onToggle} children={<Text size="small" color="dark-4" children={toggleLabel} />} />
    )}
  </Box>
);
