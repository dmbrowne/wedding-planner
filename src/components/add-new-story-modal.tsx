import React, { useState } from "react";
import * as yup from "yup";
import { Layer, Box, Button, Heading, Text, TextInput } from "grommet";
import { Close } from "grommet-icons";
import { Formik } from "formik";
import CollaboratorEditableList from "./collaborator-editable-list";
import Modal from "./modal";

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
    <Modal title="Create new story" onClose={onClose} contentContainerProps={{ height: undefined }}>
      <Text>What's the story title?</Text>
      <Text size="small" margin={{ bottom: "medium" }} color="dark-3">
        Suggestions: "How we met", "The story so far", "Our story"
      </Text>
      <Formik initialValues={{ name: "" }} validationSchema={yup.object().shape({ name: yup.string().required() })} onSubmit={handleSubmit}>
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
    </Modal>
  );
};

export default AddNewStoryModal;
