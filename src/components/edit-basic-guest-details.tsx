import React from "react";
import { Button, FormField, TextInput } from "grommet";
import { Formik, Field } from "formik";
import * as yup from "yup";

interface IEditProps {
  name: string;
  preferredName?: string;
  email?: string;
  onSubmit: (values: { name: string; preferredName?: string; email?: string }) => void;
}

const editValidationScheme = yup.object().shape({
  name: yup.string().required(),
  preferredName: yup.string(),
  email: yup.string().email()
});

const EditBasicGuestDetails: React.FC<IEditProps> = ({ name, preferredName, email, onSubmit }) => {
  return (
    <Formik validationSchema={editValidationScheme} initialValues={{ name, preferredName, email }} onSubmit={onSubmit}>
      {({ errors, handleSubmit }) => (
        <form onSubmit={handleSubmit}>
          <Field name="name">
            {({ field, meta }: any) => (
              <FormField error={meta.error} label="Name" help="Full name" htmlFor={`name`}>
                <TextInput id={`name`} {...field} />
              </FormField>
            )}
          </Field>
          <Field name="preferredName">
            {({ field, meta }: any) => (
              <FormField
                error={meta.error}
                label="Preferred name"
                htmlFor={`preferred-name`}
                children={<TextInput placeholder="Full name will be used otherwise" id={`preferred-name`} {...field} />}
              />
            )}
          </Field>
          <Field name="email">
            {({ field, meta }: any) => (
              <FormField error={meta.error} label="Email" htmlFor={`email`}>
                <TextInput id={`email`} {...field} />
              </FormField>
            )}
          </Field>
          <Button type="submit" label="Save" disabled={!errors} />
        </form>
      )}
    </Formik>
  );
};

export default EditBasicGuestDetails;
