import React, { InputHTMLAttributes, FC } from "react";
import { Box, Button, Text } from "grommet";
import { Upload, Trash } from "grommet-icons";
import FirebaseImage from "../firebase-image";
import FileInput from "../file-input";
import { SOverlayActions } from "./styles";

export interface IComponentProps extends InputHTMLAttributes<HTMLInputElement> {
  onInputFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDelete?: () => any;
  label?: string;
  imageRef?: string;
  name: string;
}

export const ImageUploadComponent: FC<IComponentProps> = ({ onInputFileChange, onDelete, label, imageRef, children, name, ...props }) => {
  const deleteButton = (
    <Button disabled={props.disabled} onClick={onDelete}>
      <Box align="center">
        <Box background="status-critical" pad="medium" style={{ borderRadius: "50%" }}>
          <Trash />
        </Box>
      </Box>
    </Button>
  );
  const uploadButton = (
    <Button as="span" disabled={props.disabled}>
      <Box align="center">
        <Box background={imageRef ? "white" : "brand"} pad="medium" style={{ borderRadius: "50%" }}>
          <Upload />
        </Box>
        {label && <Text textAlign="center" color="dark-3" size="small" margin={{ top: "xsmall" }} children={label} />}
      </Box>
    </Button>
  );

  return (
    <Box style={{ position: "relative" }} border={{ style: "dashed" }} overflow="hidden" fill>
      {imageRef && <FirebaseImage imageRef={imageRef}>{url => <img alt="cover" src={url} />}</FirebaseImage>}
      <SOverlayActions autoHide={!!imageRef}>
        <Box direction="row" align="start">
          <Box style={{ flex: 1 }}>
            <FileInput name={name} onChange={onInputFileChange} {...props}>
              {children ? children : uploadButton}
            </FileInput>
          </Box>
          {!!imageRef && onDelete && <Box style={{ flex: 1 }}>{deleteButton}</Box>}
        </Box>
      </SOverlayActions>
    </Box>
  );
};

export default ImageUploadComponent;
