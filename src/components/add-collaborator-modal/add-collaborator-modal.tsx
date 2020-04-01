import React, { FC, useRef, useContext } from "react";
import * as yup from "yup";
import { firestore } from "firebase/app";
import { addDays } from "date-fns";
import { Box, Button, TextInput } from "grommet";
import { Formik } from "formik";

import AuthContext from "../auth-context";
import { IAdminInvite } from "../../store/types";
import Modal from "../modal";

interface IProps {
  weddingId: string;
  onClose: () => void;
}

export const AddCollaboratorModal: FC<IProps> = ({ weddingId, onClose }) => {
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
    <Modal title="Invite someone to co-edit on your wedding" onClose={onClose}>
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
    </Modal>
  );
};

export default AddCollaboratorModal;
