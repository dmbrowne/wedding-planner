import React, { useRef } from "react";
import * as yup from "yup";
import { Text, Box } from "grommet";
import { Formik } from "formik";
import { IEvent } from "../store/types";
import { firestore } from "firebase/app";
import GoogleAutoCompleteSearch from "../components/google-autocomplete-search";
import { humaneToFormattedAddress, humaneAddress, dateAndTimeValidation } from "../utils";
import { RouteComponentProps } from "react-router-dom";
import DateAndTimeFormikForm from "../components/date-and-time-form-with-formik-context";
import { format } from "date-fns";
import { NameForm, SubmitActions } from "../components/name-form";

interface IProps extends RouteComponentProps<{ eventId: string; weddingId: string }> {
  event: IEvent;
}

const EventSettings: React.FC<IProps> = ({ event }) => {
  const { current: db } = useRef(firestore());
  const eventRef = db.doc(`events/${event.id}`);

  const updateName = ({ name }: { name: string }) => {
    eventRef.update({ name });
  };

  const updateEventField = (values: Partial<{ [field in keyof IEvent]: IEvent[field] }>) => {
    eventRef.update(values);
  };

  return (
    <Box style={{ width: "100%" }} width={{ max: "700px" }} margin={{ vertical: "medium", horizontal: "auto" }}>
      <Box margin="medium">
        <NameForm label="Event name" initialName={event.name} onSubmit={updateName} />
      </Box>
      <Box margin="medium">
        <Formik
          enableReinitialize
          initialValues={{
            date: format(event.startDate.toDate(), "yyyy-MM-dd"),
            serviceHasTime: !!event.startTime,
            time: event.startTime || "",
          }}
          validationSchema={yup.object().shape({ ...dateAndTimeValidation })}
          onSubmit={values => {
            updateEventField({
              startDate: firestore.Timestamp.fromDate(new Date(values.date)),
              ...(values.time ? { startTime: values.time } : {}),
            });
          }}
        >
          {props => (
            <form onReset={props.handleReset} onSubmit={props.handleSubmit}>
              <DateAndTimeFormikForm />
              <SubmitActions isFormDirty={props.dirty} onReset={props.resetForm} />
            </form>
          )}
        </Formik>
      </Box>
      <Box margin="medium">
        <Text>Address</Text>
        <Text size="small" color="dark-1" margin={{ vertical: "xsmall" }}>
          {event.address ? humaneToFormattedAddress(event.address) : "No address saved yet"}
        </Text>
        <GoogleAutoCompleteSearch
          onPlaceLoadSuccess={({ address_components: ac }) => (!!ac ? updateEventField({ address: humaneAddress(ac) }) : null)}
        />
      </Box>
    </Box>
  );
};

export default EventSettings;
