import React, { useRef, useEffect, useState, ReactNode } from "react";
import { withDummyMap } from "./google-dummy-map";
import { EAmenityTypes } from "../store/types";

interface IProps {
  map: google.maps.Map;
  latLng: google.maps.LatLng | google.maps.LatLngLiteral;
  type: Exclude<EAmenityTypes, EAmenityTypes.other>;
  renderItem: (
    result: google.maps.places.PlaceResult,
    idx: number,
    getDetails: (cb: (place: google.maps.places.PlaceResult) => any) => void
  ) => ReactNode;
}

const NearbyPlaces: React.FC<IProps> = withDummyMap(({ map, latLng, type, renderItem, dummyEl }) => {
  const service = useRef<google.maps.places.PlacesService>(new google.maps.places.PlacesService(map || dummyEl));
  const [results, setResults] = useState<google.maps.places.PlaceResult[]>([]);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const placesService = service.current;
  const request: google.maps.places.PlaceSearchRequest = { location: latLng, radius: 800, type };

  useEffect(() => {
    setResults([]);
    markers.forEach(marker => marker.setMap(null));
    placesService.nearbySearch(request, onResults);
  }, [type]);

  const onClickResult = (result: google.maps.places.PlaceResult, cb: (place: google.maps.places.PlaceResult) => any) => {
    if (result.place_id) {
      placesService.getDetails({ placeId: result.place_id }, (...args) => onLoadDetails(args[0], args[1], cb));
    }
  };

  const onLoadDetails = (
    place: google.maps.places.PlaceResult,
    status: google.maps.places.PlacesServiceStatus,
    cb: (place: google.maps.places.PlaceResult) => any
  ) => {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      cb(place);
    }
  };

  const onResults = (results: google.maps.places.PlaceResult[], status: google.maps.places.PlacesServiceStatus) => {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      results.forEach(({ geometry, name }, idx) => {
        if (geometry && geometry.location) {
          const { lat: lt, lng: lg } = geometry.location;
          const marker = new google.maps.Marker({
            position: { lat: lt(), lng: lg() },
            map: map,
            title: name,
            label: (idx + 1).toString(),
          });
          setMarkers([...markers, marker]);
        }
      });
      setResults(results);
    }
  };
  return (
    <>
      {results.map((result, idx) => (
        <React.Fragment key={result.place_id}>{renderItem(result, idx, onClickResult.bind(undefined, result))}</React.Fragment>
      ))}
    </>
  );
});

export default NearbyPlaces;
