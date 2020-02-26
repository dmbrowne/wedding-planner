import React from "react";
import { Box, FormField, TextInput, Text } from "grommet";
import { Switch } from "gestalt";
import { useFormikContext } from "formik";

const DateAndTimeFormikFormComponent: React.FC = () => {
  const { values, touched, errors, getFieldProps, setFieldValue } = useFormikContext<{
    date: string;
    serviceHasTime?: boolean;
    time?: string;
  }>();

  return (
    <Box direction="row" align="start" gap="large">
      <FormField label="Date" error={!!touched.date && errors.date}>
        <TextInput type="date" {...getFieldProps("date")} />
      </FormField>
      <Box>
        <Text as="div" margin={{ vertical: "xsmall" }} color={values.serviceHasTime ? "dark-1" : "dark-6"}>
          Time (optional)
        </Text>
        <Box direction="row" align="center" gap="small">
          <Switch
            onChange={() => {
              setFieldValue("time", "");
              setFieldValue("serviceHasTime", !values.serviceHasTime);
            }}
            id="eventHasTime"
            switched={values.serviceHasTime}
          />
          <FormField>
            <TextInput type="time" {...getFieldProps("time")} disabled={!values.serviceHasTime} />
          </FormField>
        </Box>
      </Box>
    </Box>
  );
};

export default DateAndTimeFormikFormComponent;
