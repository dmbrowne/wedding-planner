import React, { useState, ComponentType } from "react";
import { RouteComponentProps } from "react-router-dom";
import { Heading, Box, Text, FormField, Button, TextArea, Select } from "grommet";

import { useStateSelector } from "../store/redux";
import GoogleMap from "../components/google-map";
import NearbyPlaces from "../components/google-nearby-places";
import GoogleAutoCompleteSearch from "../components/google-autocomplete-search";
import { ReactComponent as Bed } from "../icons/bed.svg";
import { ReactComponent as Drink } from "../icons/drink.svg";
import { ReactComponent as Parking } from "../icons/parking.svg";
import { ReactComponent as Restaurant } from "../icons/restaurant.svg";
import { humaneAddress } from "../utils";
import { firestore } from "firebase/app";
import { IAmenity, EAmenityTypes } from "../store/types";
import SContainer from "../components/container";
import { orderedEventsListSelector } from "../selectors/selectors";

interface IProps extends RouteComponentProps<{ eventId: string; weddingId: string }> {}

const titles: { [key: string]: string } = {
  restaurant: "Restaurant",
  bar: "Bar",
  cafe: "Cafe",
  parking: "Parking",
  lodging: "Hotel",
  other: "Other",
};

const CreateAmenity: React.FC<IProps> = ({ match, history }) => {
  const { weddingId } = match.params;
  const allEvents = useStateSelector(orderedEventsListSelector);
  const [amenitiesType, setAmenitiesType] = useState<EAmenityTypes>();
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<google.maps.places.PlaceResult | null>(null);
  const [notes, setNotes] = useState("");
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const selectedEvent = useStateSelector(state => (selectedEventId ? state.events.eventsById[selectedEventId] : undefined));

  const iconTuples: Array<[EAmenityTypes, ComponentType]> = [
    [EAmenityTypes.restaurant, Restaurant],
    [EAmenityTypes.bar, Drink],
    [EAmenityTypes.parking, Parking],
    [EAmenityTypes.lodging, Bed],
    [EAmenityTypes.other, () => null],
  ];

  const submit = () => {
    if (!selectedPlace) return;

    const { name, address_components, geometry, icon } = selectedPlace;
    const doc: Omit<IAmenity, "id"> = {
      icon,
      name,
      weddingId,
      notes,
      // Using typescript casting because the google docs do not mark these fields as optional
      place_id: selectedPlace.place_id as string,
      formatted_address: selectedPlace.formatted_address as string,
      address: humaneAddress(address_components as google.maps.GeocoderAddressComponent[]),
      type: amenitiesType || EAmenityTypes.other,
      createdAt: firestore.Timestamp.fromDate(new Date()),
      ...(geometry ? { location: { lat: geometry.location.lat(), lng: geometry.location.lng() } } : {}),
    };
    // prettier-ignore
    firestore().collection(`amenities`).add(doc);
    history.push(`/weddings/${weddingId}/amenities`);
  };

  return (
    <SContainer>
      <Heading level={1} children="Add an amenity" />

      <Box as="section" margin={{ vertical: "large" }}>
        <Heading level={2} children="1. Select the type of amenity to add" />
        <Box direction="row" gap="medium">
          {iconTuples.map(([val, Icon]) => {
            return (
              <Button key={val} plain onClick={() => setAmenitiesType(val)} disabled={!!selectedPlace && amenitiesType !== val}>
                <Box
                  elevation={amenitiesType === val ? "medium" : "xsmall"}
                  background={amenitiesType === val ? "brand" : "light-1"}
                  pad="medium"
                  height="150px"
                  width="150px"
                  justify="center"
                  gap="xsmall"
                  color={amenitiesType === val ? "white" : undefined}
                >
                  <Icon />
                  <Text size="small" textAlign="center" children={titles[val]} />
                </Box>
              </Button>
            );
          })}
        </Box>
      </Box>

      <div style={{ opacity: !!amenitiesType ? "1" : "0.5" }}>
        <Box as="section" margin={{ vertical: "large" }}>
          <Heading level={2} children="2. Choose the amenity" />
          {selectedPlace && (
            <>
              <Text size="large">{selectedPlace.name}</Text>
              <Text color="dark-6" dangerouslySetInnerHTML={{ __html: selectedPlace.adr_address || "" }} />
            </>
          )}
          {!selectedPlace && (
            <Box margin={{ bottom: "small" }}>
              <Heading level={3} size="small" children="Search for the amenity" />
              <Box background="white">
                <FormField label="search for a place or an address">
                  <GoogleAutoCompleteSearch disabled={!amenitiesType} onPlaceLoadSuccess={setSelectedPlace} />
                </FormField>
              </Box>
            </Box>
          )}
          {!selectedPlace && amenitiesType && amenitiesType !== EAmenityTypes.other && (
            <>
              <Heading level={3} size="small" children="Or choose a nearby location" />
              <Select
                value={selectedEventId || ""}
                options={allEvents}
                valueKey="id"
                labelKey="name"
                valueLabel={<Box pad="small">{selectedEvent ? selectedEvent.name : "Select an event"}</Box>}
                onChange={({ option }) => setSelectedEventId(option.id)}
              />
              {selectedEvent && !selectedEvent.location && (
                <Text margin={{ top: "small" }}>
                  Cannot get list of nearby places because an address for the selected event has not been added yet
                </Text>
              )}
              {selectedEvent && selectedEvent.location && (
                <>
                  <div style={{ width: "100%", height: "40vh" }}>
                    <GoogleMap
                      lat={selectedEvent.location.lat}
                      lng={selectedEvent.location.lng}
                      onLoaded={gmap => setMap(gmap)}
                      mapOptions={{
                        clickableIcons: false,
                        fullscreenControl: false,
                        mapTypeControl: false,
                        maxZoom: 17,
                        streetViewControl: false,
                        scrollwheel: false,
                      }}
                    />
                  </div>
                  {map && (
                    <Box style={{ display: "block" }} height={{ max: "400px" }} overflow="auto">
                      <NearbyPlaces
                        map={map}
                        latLng={{ lat: selectedEvent.location.lat, lng: selectedEvent.location.lng }}
                        type={amenitiesType}
                        renderItem={(result, idx, getDetails) => (
                          <Box pad="small" background="white" onClick={() => getDetails(setSelectedPlace)}>
                            <Box border={idx > 0 ? "top" : undefined} direction="row" gap="medium" align="start">
                              <Text size="large" children={(idx + 1).toString()} />
                              <Box>
                                <Text children={result.name} />
                                <Text size="small" color="dark-6" children={result.vicinity} />
                              </Box>
                            </Box>
                          </Box>
                        )}
                      />
                    </Box>
                  )}
                </>
              )}
            </>
          )}
        </Box>
      </div>

      <div style={{ opacity: selectedPlace ? "1" : "0.5" }}>
        <Box as="section" margin={{ vertical: "large" }}>
          <Heading level={2} children="3. Add some notes (optional)" />
          <TextArea placeholder="type here" value={notes} onChange={event => setNotes(event.target.value)} disabled={!selectedPlace} />
        </Box>
      </div>

      <Button margin={{ vertical: "large" }} primary disabled={!selectedPlace} label="Save" onClick={submit} />
    </SContainer>
  );
};

export default CreateAmenity;
