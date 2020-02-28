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

const validationSchema = yup.object().shape({
  name: yup.string().required(),
  description: yup.string(),
  ...dateAndTimeValidation,
  multiService: yup.boolean(),
  place: yup.object().when("multiService", {
    is: true,
    otherwise: yup.object().required("Address is required"),
    then: yup
      .object()
      .nullable()
      .notRequired(),
  }),
});

interface IProps extends RouteComponentProps<{ weddingId: string }> {
  mainEvent?: boolean;
}

const CreateEvent: React.FC<IProps> = ({ match, history, mainEvent }) => {
  const db = firestore();
  const { weddingId } = match.params;
  const { user: auth } = useContext(AuthContext);
  const weddingName = useStateSelector(state => state.activeWedding.wedding?.name);
  const availableCollaborators = useStateSelector(state => state.activeWedding.wedding?._private.collaborators);
  const [users, setUsers] = useState<{ [id: string]: IUser }>({});
  const [collaborators, setCollaborators] = useState(new Set<string>());
  const [showCollabModal, setShowCollabModal] = useState(false);

  useEffect(() => {
    if (availableCollaborators) {
      availableCollaborators.forEach(userId => {
        if (mainEvent) onSelectCollaborator(userId, true);

        db.collection(`users`)
          .doc(userId)
          .onSnapshot(snap => {
            setUsers({ ...users, [snap.id]: { id: snap.id, ...(snap.data() as IUser) } });
          });
      });
    }
  }, [availableCollaborators]);

  const onSelectCollaborator = (userId: string, value?: boolean) => {
    const exists = typeof value !== "undefined" ? value : collaborators.has(userId);
    const updatedCollaborators = new Set(collaborators);

    if (exists) updatedCollaborators.delete(userId);
    else updatedCollaborators.add(userId);

    setCollaborators(updatedCollaborators);
  };

  const removeCollaborator = (userId: string) => {
    const updatedCollaborators = new Set(collaborators);
    updatedCollaborators.delete(userId);
    setCollaborators(updatedCollaborators);
  };

  const onSubmit = ({ place, multiService, time, ...values }: TEventFormData) => {
    if (!auth) return;

    const eventDetails: Omit<IEvent, "id"> = {
      name: values.name,
      weddingId,
      main: !!mainEvent,
      description: values.description,
      startDate: firestore.Timestamp.fromDate(new Date(values.date)),
      _private: { owner: auth.uid },
    };

    if (collaborators.size > 0) eventDetails._private.collaborators = Array.from(collaborators);
    if (multiService) {
      eventDetails.allowRsvpPerService = true;
      eventDetails.services = {};
    }
    if (time) eventDetails.startTime = time;
    if (place && place.address_components) eventDetails.address = humaneAddress(place.address_components);
    if (place && place.geometry) {
      eventDetails.location = { lat: place.geometry.location.lat(), lng: place.geometry.location.lng() };
    }

    db.collection("events").add(eventDetails);
    history.push(`/weddings/${weddingId}/events`);
  };

  const formik = useFormik<TEventFormData>({
    initialValues: { name: mainEvent ? weddingName || "" : "", description: "", date: "", multiService: false, place: undefined },
    validationSchema,
    onSubmit,
    enableReinitialize: mainEvent,
  });
  console.log(formik.errors);
  return (
    <SContainer>
      <Heading level={1} children={mainEvent ? "Wedding event details" : "Create event"} />

      <form onSubmit={formik.handleSubmit}>
        <FormField
          label={mainEvent ? "Wedding name" : "Event name"}
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

        <Heading level={3} size="small" margin={{ top: "large" }} children="Services" />
        <Text as="p">Will the event be split up in to different services?</Text>
        <Text as="p">
          This is useful in the case where the event has a different location for different parts of the day (e.g. Wedding reception at the
          local church, dinner reception at the town restaurant, after party at Barney's tavern)
        </Text>
        <Label htmlFor="multi-service">
          <Text margin={{ bottom: "small" }}>Multi service</Text>
        </Label>
        <Switch
          id="multi-service"
          name="multiService"
          onChange={() => formik.setFieldValue("multiService", !formik.values.multiService)}
          switched={formik.values.multiService}
        />
        <Box margin={{ vertical: "medium" }}>
          {formik.values.multiService && <Text color="dark-6">You can add services once the event has been created</Text>}
          {!formik.values.multiService &&
            (formik.values.place ? (
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
            ))}
        </Box>

        <Heading level={3} size="small" margin={{ top: "large" }}>
          Collaborators
        </Heading>
        <Text>Give your wedding collaborators access to view and edit this event's details, guests and more</Text>
        <Box direction="row" gap="xsmall" wrap>
          {Array.from(collaborators).map((userId, idx) => (
            <Box margin={{ vertical: "small" }} background="light-4" pad="xsmall" direction="row" align="center" alignSelf="start">
              <Button plain icon={<FormCalendar />} onClick={() => removeCollaborator(userId)} />
              <Text size="small" color="dark-3" children={users[userId] || userId} />
            </Box>
          ))}
        </Box>
        <Button margin={{ top: "small" }} label="Add collaborators" onClick={() => setShowCollabModal(true)} />
        <Box margin={{ vertical: "large" }} align="end">
          <Button primary type="submit" label={mainEvent ? "Create wedding event" : "Add event"} />
        </Box>
      </form>
      {showCollabModal && (
        <Layer>
          <Box
            width={{ max: "600px" }}
            height={{ min: "300px", max: "600px" }}
            pad={{ horizontal: "medium", top: "medium", bottom: "xlarge" }}
          >
            <Button alignSelf="end" icon={<Close />} onClick={() => setShowCollabModal(false)} />
            {!availableCollaborators && (
              <>
                <Heading level="3" children="No collaborators available" margin={{ top: "none" }} />
                <Text margin={{ bottom: "medium" }}>
                  Cannot allow others to edit this event because you have not yet added any collaborators to your wedding.
                </Text>
                <Text size="small" color="dark-6" margin={{ bottom: "small" }}>
                  To give someone else permission to edit this event, you must first give them access to collaborate on your wedding. You
                  can do that in your <Link to="/weddings">wedding settings</Link>
                </Text>
                <Text size="small" color="dark-6">
                  Once they have accepted your collaboration invite, you can then give them permission to collaborate on this event
                </Text>
              </>
            )}
            {!!availableCollaborators && (
              <>
                <Heading level="3" children="Select collaborator(s)" margin={{ top: "none" }} />
                {availableCollaborators.map(userId => (
                  <CheckBox
                    label={users[userId] || userId}
                    checked={collaborators.has(userId)}
                    onChange={() => onSelectCollaborator(userId)}
                  />
                ))}
              </>
            )}
          </Box>
        </Layer>
      )}
    </SContainer>
  );
};

export default CreateEvent;
