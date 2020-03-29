import React, { useRef, useContext } from "react";
import * as yup from "yup";
import { firestore } from "firebase/app";
import { addDays } from "date-fns";

import AuthContext from "../components/auth-context";
import { IAdminInvite } from "../store/types";
import { Layer, Box, Button, Heading, TextInput } from "grommet";
import { Close } from "grommet-icons";
import { Formik } from "formik";

const AddCollaboratorModal: React.FC<{ weddingId: string; onClose: () => void }> = ({ weddingId, onClose }) => {
  const { user: auth } = useContext(AuthContext);
  const { current: db } = useRef(firestore());
  const { current: newCollaboratorFormValidationSchema } = useRef(
    yup.object().shape({
      email: yup
        .string()
        .email()
        .required(),
    })
  );

  const sendInviteRequest = ({ email }: { email: string }) => {
    if (!auth) return;
    const data: Omit<IAdminInvite, "id"> = {
      weddingId,
      email,
      from: auth.uid,
      expires: firestore.Timestamp.fromDate(addDays(new Date(), 1)),
    };
    db.collection("adminInvites").add(data);
  };
  const onNewCollaboratorSubmit = (values: { email: string }) => {
    sendInviteRequest(values);
    onClose();
  };

  return (
    <Layer>
      <Box width="500px" pad="medium">
        <Button icon={<Close />} alignSelf="end" onClick={onClose} />
        <Heading level={3}>Invite someone to co-edit on your wedding</Heading>
        <Formik initialValues={{ email: "" }} validationSchema={newCollaboratorFormValidationSchema} onSubmit={onNewCollaboratorSubmit}>
          {fProps => (
            <form onSubmit={fProps.handleSubmit} onReset={fProps.handleReset}>
              <Box align="end">
                <TextInput name="email" placeholder="enter thier email" {...fProps.getFieldProps("email")} />
                <Button primary margin={{ vertical: "medium" }} label="Send invite" type="submit" disabled={!fProps.isValid} />
              </Box>
            </form>
          )}
        </Formik>
      </Box>
    </Layer>
  );
};

export default AddCollaboratorModal;
