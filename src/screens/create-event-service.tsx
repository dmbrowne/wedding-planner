import React, { useState } from "react";
import { Box, FormField, Heading, TextInput, TextArea, Text, Button } from "grommet";
import GoogleAutoCompleteSearch from "../components/google-autocomplete-search";
import { Switch } from "gestalt";
import { FormPrevious } from "grommet-icons";
import { IService } from "../store/types";
import shortid from "shortid";
import { firestore } from "firebase/app";
import { humaneAddress } from "../utils";
import { RouteComponentProps } from "react-router-dom";
import SContainer from "../components/container";

const CreateEventService: React.FC<RouteComponentProps<{ weddingId: string; eventId: string }>> = ({ match, history }) => {
  const { eventId, weddingId } = match.params;
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [selectedPlace, setSelectedPlace] = useState<google.maps.places.PlaceResult | null>(null);
  const [serviceHasTime, setServiceHasTime] = useState(false);
  const [dirtyFields, setDirtyFields] = useState<Set<string>>(new Set());

  const isDirty = (fieldName: string) => dirtyFields.has(fieldName);
  const isValid = !!name && !!selectedPlace && !!date;

  const onChange = (fieldName: string, cb: (val: any) => void) => {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const updatedDirtyFields = new Set(dirtyFields).add(fieldName);
      setDirtyFields(updatedDirtyFields);
      cb(e.target.value);
    };
  };

  const onSubmit = () => {
    // typescript work around
    if (!name || !selectedPlace || !date) return;

    const { address_components, geometry } = selectedPlace;
    const id = shortid.generate();

    const newService: IService = { id, name, startDate: firestore.Timestamp.fromDate(new Date(date)) };

    if (geometry) newService.location = { lat: geometry.location.lat(), lng: geometry.location.lng() };
    if (address_components) newService.address = humaneAddress(address_components);
    if (time) newService.startTime = time;

    firestore()
      .doc(`events/${eventId}`)
      .update({ [`services.${id}`]: newService });
    history.push(`/weddings/${weddingId}/events/${eventId}`);
  };

  return (
    <SContainer>
      <Heading level={1}>Add a service</Heading>

      <FormField required label="Name" margin={{ vertical: "medium" }} error={isDirty("name") && !name && "A name is required"}>
        <TextInput
          required
          placeholder="What do you want to be call the this part of the event"
          value={name}
          onChange={onChange("name", setName)}
        />
      </FormField>

      <Box direction="row" align="end" gap="large" margin={{ vertical: "medium" }}>
        <FormField required label="Date" error={isDirty("date") && !date && "Date of the service is required"}>
          <TextInput required type="date" value={date} onChange={onChange("date", setDate)} />
        </FormField>
        <Box>
          <Text color={serviceHasTime ? "dark-1" : "dark-6"}>Time (optional)</Text>
          <Box direction="row" align="center" gap="small">
            <Switch onChange={() => setServiceHasTime(!serviceHasTime)} id="eventHasTime" switched={serviceHasTime} />
            <FormField>
              <TextInput onChange={onChange("time", setTime)} type="time" value={time} disabled={!serviceHasTime} />
            </FormField>
          </Box>
        </Box>
      </Box>

      <Box background={selectedPlace ? "none" : "white"} margin={{ vertical: "medium" }}>
        {!selectedPlace ? (
          <FormField
            label="Where will this part of the event take place?"
            required
            error={isDirty("location") && !selectedPlace && "You must choose the where the service will be held"}
          >
            <GoogleAutoCompleteSearch
              name="location"
              onPlaceLoadSuccess={setSelectedPlace}
              placeholder="Search for an address, business nane or landmark"
            />
          </FormField>
        ) : (
          <>
            <Text>Where will this part of the event take place?</Text>
            <Text margin={{ top: "medium" }} children={<strong>{selectedPlace.name}</strong>} />
            {selectedPlace.formatted_address && (
              <Text color="dark-4" margin={{ bottom: "small" }} children={selectedPlace.formatted_address} />
            )}
            <Button alignSelf="start" label="change" gap="xsmall" icon={<FormPrevious />} onClick={() => setSelectedPlace(null)} />
          </>
        )}
      </Box>

      <Box margin={{ vertical: "medium" }}>
        <Text>Description (optional)</Text>
        <Text margin={{ bottom: "small" }} color="dark-3">
          What does this service entail, what is it, what will happen etc.?
        </Text>
        <TextArea value={description} onChange={onChange("description", setDescription)} rows={10} />
      </Box>

      <Button primary alignSelf="end" label="Add" disabled={!isValid} onClick={onSubmit} />
    </SContainer>
  );
};

export default CreateEventService;
