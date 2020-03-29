import React, { useEffect, useState, useContext } from "react";
import * as yup from "yup";
import { Box, Heading, FormField, TextInput, Text, Button, TextArea, Layer, CheckBox } from "grommet";
import { useFormik } from "formik";
import { Switch, Label } from "gestalt";
import { FormPrevious, Close, FormCalendar } from "grommet-icons";
import { Link, RouteComponentProps } from "react-router-dom";
import { firestore } from "firebase/app";

import GoogleAutoCompleteSearch from "../components/google-autocomplete-search";
import { useStateSelector } from "../store/redux";
import { IUser, IEvent, TEventFormData } from "../store/types";
import AuthContext from "../components/auth-context";
import { humaneAddress, dateAndTimeValidation } from "../utils";
import DateAndTimeForm from "../components/date-and-time-form";
import SContainer from "../components/container";
import CollaboratorEditableList from "../components/collaborator-editable-list";

const validationSchema = yup.object().shape({
  name: yup.string().required(),
  description: yup.string(),
  ...dateAndTimeValidation,
  place: yup.object().required("Address is required"),
  syncRSVP: yup.boolean(),
  syncGuests: yup.boolean(),
});

const CreateEvent: React.FC<RouteComponentProps<{ weddingId: string }>> = ({ match, history }) => {
  const db = firestore();
  const { weddingId } = match.params;
  const { user: auth } = useContext(AuthContext);
  const [selectedCollaboratorIds, setSelectedCollaboratorIds] = useState(new Set<string>());

  const getDefaultWeddingEvent = async () => {
    const snap = await db
      .collection("events")
      .where("weddingId", "==", weddingId)
      .where("default", "==", true)
      .limit(1)
      .get();
    if (snap.empty) throw new Error("default event not found.");
    return snap.docs[0].data();
  };

  const onSubmit = async ({ place, time, syncGuests, syncRSVP, ...values }: TEventFormData) => {
    if (!auth) return;

    let defaultWeddingEvent;
    if (syncGuests) defaultWeddingEvent = await getDefaultWeddingEvent();

    const eventDetails: Omit<IEvent, "id"> = {
      name: values.name,
      weddingId,
      description: values.description,
      startDate: firestore.Timestamp.fromDate(new Date(values.date)),
      ...(syncGuests && defaultWeddingEvent ? { syncEventId: defaultWeddingEvent.id } : {}),
      ...(syncGuests ? { syncEventRSVP: syncRSVP } : {}),
      _private: { owner: auth.uid },
    };

    if (time) eventDetails.startTime = time;
    if (selectedCollaboratorIds.size > 0) eventDetails._private.collaborators = Array.from(selectedCollaboratorIds);
    if (place && place.address_components) eventDetails.address = humaneAddress(place.address_components);
    if (place && place.geometry) {
      eventDetails.location = { lat: place.geometry.location.lat(), lng: place.geometry.location.lng() };
    }

    db.collection("events").add(eventDetails);
    history.push(`/weddings/${weddingId}/events`);
  };

  const formik = useFormik<TEventFormData>({
    initialValues: { name: "", description: "", date: "", place: undefined, syncRSVP: true, syncGuests: true },
    validationSchema,
    onSubmit,
  });

  return (
    <SContainer>
      <Heading level={1} children="Create event" />

      <form onSubmit={formik.handleSubmit}>
        <FormField
          label="Event name"
          help="This will be the title used on invitations"
          margin={{ vertical: "large" }}
          error={!!formik.touched.name && formik.errors.name}
        >
          <TextInput {...formik.getFieldProps("name")} />
        </FormField>

        <Box margin={{ vertical: "medium" }}>
          <DateAndTimeForm formik={formik} />
        </Box>

        <Box margin={{ vertical: "large" }}>
          <Text margin={{ left: "small", bottom: "small" }}>Description (optional)</Text>
          <TextArea {...formik.getFieldProps("description")} rows={6} />
        </Box>

        <Box margin={{ vertical: "medium" }}>
          {formik.values.place ? (
            <>
              <Text margin={{ top: "medium" }} children={<strong>{formik.values.place.name}</strong>} />
              {formik.values.place.formatted_address && (
                <Text color="dark-4" margin={{ bottom: "small" }} children={formik.values.place.formatted_address} />
              )}
              <Button
                alignSelf="start"
                label="change"
                gap="xsmall"
                icon={<FormPrevious />}
                onClick={() => formik.setFieldValue("selectedPlace", undefined)}
              />
            </>
          ) : (
            <>
              <Box background="white">
                <GoogleAutoCompleteSearch
                  placeholder="Search for an address where the event will take place"
                  onPlaceLoadSuccess={place => formik.setFieldValue("place", place)}
                />
              </Box>
              {formik.touched.place && formik.errors.place && <Text color="status-error">{formik.errors.place}</Text>}
            </>
          )}
        </Box>

        <Label htmlFor="sync-guests">
          <Text>Sync guests with main event</Text>
        </Label>
        <Switch onChange={({ value }) => formik.setFieldValue("syncGuests", value)} id="sync-guests" switched={formik.values.syncGuests} />
        <Text size="small">
          Syncing guests with main event means the guestlist for this event will be copied from the main event and update when the guestlist
          for the main event is modified
        </Text>

        {formik.values.syncGuests && (
          <Box margin={{ top: "medium" }}>
            <Label htmlFor="separate-rsvp">
              <Text>Sync RSVP with main event</Text>
            </Label>
            <Switch
              onChange={({ value }) => formik.setFieldValue("syncRSVP", value)}
              id="separate-rsvp"
              switched={formik.values.syncRSVP}
            />
            <Text size="small">
              Should RSVP's for this event will be tied to the main event (RSVP's for this event will be sync'd with RSVP's for the main
              event)
            </Text>
          </Box>
        )}

        <Heading level={3} size="small" margin={{ top: "large" }} children="Collaborators" />
        <Text>Give your wedding collaborators access to view and edit this event's details, guests and more</Text>
        <Box margin={{ vertical: "medium" }}>
          <CollaboratorEditableList
            selectedIds={Array.from(selectedCollaboratorIds)}
            onSelect={ids => setSelectedCollaboratorIds(new Set(ids))}
          />
        </Box>
        <Box margin={{ vertical: "large" }} align="end">
          <Button primary type="submit" label="Add event" />
        </Box>
      </form>
    </SContainer>
  );
};

export default CreateEvent;
