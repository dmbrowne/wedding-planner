import React from "react";
import { FormField, TextInput, Button, Box } from "grommet";
import { useFormik } from "formik";
import { Refresh } from "grommet-icons";
import * as yup from "yup";

export const SubmitActions: React.FC<{
  onReset: () => void;
  isFormDirty: boolean;
}> = ({ onReset, isFormDirty }) => (
  <Box justify="end" direction="row" gap="large">
    <Button onClick={onReset} disabled={!isFormDirty} icon={<Refresh />} />
    <Button disabled={!isFormDirty} type="submit" label="Update" />
  </Box>
);

export const NameForm: React.FC<{
  initialName: string;
  onSubmit: (values: { name: string }) => any;
  label: string;
}> = ({ initialName, onSubmit, label }) => {
  const nameForm = useFormik<{
    name: string;
  }>({
    initialValues: { name: initialName },
    onSubmit,
    validationSchema: yup.object().shape({
      name: yup
        .string()
        .min(3)
        .required(),
    }),
  });
  const resetName = () => nameForm.setFieldValue("name", initialName);
  return (
    <form onSubmit={nameForm.handleSubmit}>
      <FormField label={label} error={!!nameForm.touched.name && nameForm.errors.name}>
        <TextInput {...nameForm.getFieldProps("name")} />
      </FormField>
      <SubmitActions onReset={resetName} isFormDirty={nameForm.dirty} />
    </form>
  );
};
