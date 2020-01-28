import React, { HTMLAttributes } from "react";
import styled from "styled-components";
import { Button } from "grommet";

interface IProps extends HTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
}

const HiddenFileInput = styled.input.attrs(() => ({
  type: "file"
}))`
  clip: rect(1px, 1px, 1px, 1px);
  clip-path: inset(50%);
  position: absolute;
  width: 1px;
  height: 1px;
`;

const FileInput: React.FC<IProps> = ({ label, name, ...props }) => {
  return (
    <div>
      <label htmlFor={name}>
        <Button as="span" label={label} />
      </label>
      <HiddenFileInput name={name} id={name} {...props} />
    </div>
  );
};

export default FileInput;
