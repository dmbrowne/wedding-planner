import React from "react";
import { Heading, FormField, TextInput } from "grommet";

interface IProps {
  name?: string;
  editMode: boolean;
  inputValue: string;
  onChange: (name: string) => void;
}

export const EventGuestModalPlusOneName: React.FC<IProps> = ({ name, editMode, onChange, inputValue }) => {
  return !editMode ? (
    <Heading level={4} as="header" margin={{ bottom: "small" }} children={name || "Unamed guest"} color={!name ? "dark-6" : "dark-1"} />
  ) : (
    <FormField label="Name of +1">
      <TextInput placeholder="Enter name for +1" value={inputValue} onChange={e => onChange(e.target.value)} />
    </FormField>
  );
};
