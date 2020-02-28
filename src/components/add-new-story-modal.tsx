import React, { useState } from "react";
import * as yup from "yup";
import { Layer, Box, Button, Heading, Text, TextInput } from "grommet";
import { Close } from "grommet-icons";
import { Formik } from "formik";
import CollaboratorEditableList from "./collaborator-editable-list";

interface IProp {
  onSubmit: (values: { name: string; collaborators: string[] }) => any;
  onClose: () => any;
}

const AddNewStoryModal: React.FC<IProp> = ({ onSubmit, onClose }) => {
  const [collaboratorIds, setCollaboratorIds] = useState<string[]>([]);
  const handleSubmit = (values: { name: string }) => {
    onSubmit({ ...values, collaborators: collaboratorIds });
  };
  return (
    <Layer>
      <Box width="500px" pad="medium">
        <Button icon={<Close />} alignSelf="end" onClick={onClose} />
        <Heading level={3}>Create new story</Heading>
        <Text>What's the story title?</Text>
        <Text size="small" margin={{ bottom: "medium" }} color="dark-3">
          Suggestions: "How we met", "The story so far", "Our story"
        </Text>
        <Formik
          initialValues={{ name: "" }}
          validationSchema={yup.object().shape({ name: yup.string().required() })}
          onSubmit={handleSubmit}
        >
          {props => (
            <form onSubmit={props.handleSubmit}>
              <TextInput name="name" {...props.getFieldProps("name")} />
              <Box margin={{ top: "small" }}>
                <Heading level={5} size="small" margin={{ bottom: "small" }} children="Collaborators" />
                <CollaboratorEditableList selectedIds={collaboratorIds} onSelect={setCollaboratorIds} />
              </Box>
              <Box margin={{ top: "medium" }} align="end">
                <Button primary label="Continue" type="submit" disabled={!props.isValid} />
              </Box>
            </form>
          )}
        </Formik>
      </Box>
    </Layer>
  );
};

export default AddNewStoryModal;
