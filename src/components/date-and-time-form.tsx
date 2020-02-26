import React from "react";
import { Box, FormField, TextInput, Text } from "grommet";
import { Switch } from "gestalt";
import { useFormik } from "formik";
import { TEventFormData } from "../store/types";

const useFormikCreateEvent = (...args: [any]) => useFormik<TEventFormData>(...args);

interface IProps {
  formik: ReturnType<typeof useFormikCreateEvent>;
}

const DateAndTimeFormikFormComponent: React.FC<IProps> = ({ formik }) => {
  return (
    <Box direction="row" align="start" gap="large">
      <FormField label="Date" error={!!formik.touched.date && formik.errors.date}>
        <TextInput type="date" {...formik.getFieldProps("date")} />
      </FormField>
      <Box>
        <Text as="div" margin={{ vertical: "xsmall" }} color={formik.values.serviceHasTime ? "dark-1" : "dark-6"}>
          Time (optional)
        </Text>
        <Box direction="row" align="center" gap="small">
          <Switch
            onChange={() => {
              formik.setFieldValue("time", "");
              formik.setFieldValue("serviceHasTime", !formik.values.serviceHasTime);
            }}
            id="eventHasTime"
            switched={formik.values.serviceHasTime}
          />
          <FormField>
            <TextInput type="time" {...formik.getFieldProps("time")} disabled={!formik.values.serviceHasTime} />
          </FormField>
        </Box>
      </Box>
    </Box>
  );
};

export default DateAndTimeFormikFormComponent;
