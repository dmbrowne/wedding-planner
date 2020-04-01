import React, { FC } from "react";
import { Layer, Box, Button, Heading } from "grommet";
import { GrommetBoxProps, GrommetLayerProps } from "../../@types/props";
import { Close } from "grommet-icons";

interface IProps {
  layerProps?: Omit<GrommetLayerProps, "ref">;
  contentContainerProps?: GrommetBoxProps;
  title?: string;
  onClose: () => void;
}

export const Modal: FC<IProps> = ({ children, contentContainerProps = {}, layerProps = {}, title, onClose }) => {
  return (
    <Layer {...layerProps}>
      <Box width="500px" height="500px" pad="medium" overflow="auto" {...contentContainerProps}>
        <Button icon={<Close />} alignSelf="end" a11yTitle="close" onClick={onClose} />
        {!!title && <Heading level={3}>{title}</Heading>}
        {children}
      </Box>
    </Layer>
  );
};

export default Modal;
