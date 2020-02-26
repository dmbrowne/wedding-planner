import React, { InputHTMLAttributes } from "react";
import styled from "styled-components";
import { Button } from "grommet";

interface IProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  name: string;
}

export const SHiddenFileInput = styled.input.attrs(() => ({
  type: "file",
}))`
  clip: rect(1px, 1px, 1px, 1px);
  clip-path: inset(50%);
  position: absolute;
  width: 1px;
  height: 1px;
`;

const FileInput: React.FC<IProps> = ({ label, name, children, disabled, ...props }) => {
  return (
    <div>
      <label htmlFor={name}>{children || <Button as="span" disabled={disabled} label={label} />}</label>
      <SHiddenFileInput name={name} id={name} disabled={disabled} {...props} />
    </div>
  );
};

export default FileInput;
