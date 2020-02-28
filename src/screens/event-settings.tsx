import React, { useRef } from "react";
import * as yup from "yup";
import { Text, Box, Heading } from "grommet";
import { Formik } from "formik";
import { Switch } from "gestalt";
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

  const toggleMultiService = (value: boolean) => {
    const deleteConfirmed = window.confirm(
      "Changing this option will cause the RSVP of all guests that are currently invited to 'Not responded'." +
        " You will either have to ask your guests to resubmit thier RSVP, or you can manually update your guests RSVP in the guest list"
    );

    if (deleteConfirmed) {
      updateEventField({ services: value ? {} : (firestore.FieldValue.delete() as any) });
    }
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
        {!event.services && (
          <>
            <Text size="small" color={!!event.services ? "light-4" : "dark-1"} margin={{ vertical: "xsmall" }}>
              {event.address ? humaneToFormattedAddress(event.address) : "No address saved yet"}
            </Text>
            <GoogleAutoCompleteSearch
              onPlaceLoadSuccess={({ address_components: ac }) => (!!ac ? updateEventField({ address: humaneAddress(ac) }) : null)}
            />
          </>
        )}
        {!!event.services && (
          <Text color="dark-6" size="small" children="As this event has services, you should define address details per service" />
        )}
      </Box>
      <Box margin="medium" direction="row" align="start" justify="between">
        <Box>
          <Text>Allow RSVP per service</Text>
          <Text size="small" margin={{ top: "xsmall" }}>
            If the event is made up of different activities / services, this option allows each guest to confirm thier attendance to each
            activity or service individually. If the event does not consist of multple services, this option should be turned off
          </Text>
        </Box>
        <Switch
          id="allow-rsvp-per-service"
          disabled={!event.services}
          switched={event.allowRsvpPerService}
          onChange={({ value }) => updateEventField({ allowRsvpPerService: value })}
        />
      </Box>
      <Box margin={{ vertical: "medium" }} background="white" border={{ color: "status-critical" }} pad={{ horizontal: "medium" }}>
        <Heading level={3} children="Danger zone" size="small" color="status-critical" margin={{ bottom: "xsmall" }} />
        <Text margin={{ bottom: "medium" }}>Changing these options will result in actions that aren't reversible</Text>
        <Box margin={{ vertical: "medium" }} direction="row" align="start" justify="between">
          <Box>
            <Text>Services</Text>
            <Text size="small" color="dark-6" margin={{ top: "xsmall" }}>
              Break this event down into different activities, which also would enable the option of allowing guest to RSVP per activity
              instead of the event as a whole
            </Text>
          </Box>
          <Switch id="multi-service" switched={!!event.services} onChange={({ value }) => toggleMultiService(value)} />
        </Box>
      </Box>
    </Box>
  );
};

export default EventSettings;
