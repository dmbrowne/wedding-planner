import React, { useState, useEffect, useRef, ReactNode } from "react";
import { Box, TextInput, TextInputProps } from "grommet";
import debounce from "debounce";
import GoogleApiGuard from "./google-api-guard";
import { withDummyMap } from "./google-dummy-map";

interface ISuggestion {
  label: ReactNode;
  value: google.maps.places.AutocompletePrediction;
}

interface IProps extends Omit<TextInputProps, "suggestions" | "value" | "onSelect" | "onChange"> {
  requestOptions: Omit<google.maps.places.FindPlaceFromQueryRequest, "query">;
  onSelect?: (result: google.maps.places.AutocompletePrediction) => void;
  onPlaceLoadSuccess: (place: google.maps.places.PlaceResult) => void;
  map?: HTMLDivElement | google.maps.Map;
}

const GooglePlacesSearchComponent = withDummyMap<IProps>(
  ({ requestOptions, onSelect, onPlaceLoadSuccess, map, dummyEl, ...textInputProps }) => {
    const [query, setQuery] = useState("");
    const [placesResult, setPlacesResult] = useState<google.maps.places.PlaceResult[]>([]);
    const service = useRef<google.maps.places.PlacesService>(new google.maps.places.PlacesService(map || dummyEl));
    const search = useRef(
      debounce((txtSearch: string) => {
        console.log(txtSearch);
        if (!txtSearch) setPlacesResult([]);
        else placesService.findPlaceFromQuery({ query: txtSearch, ...requestOptions }, displaySuggestions);
      }, 500)
    );
    let placesService = service.current;

    useEffect(() => {
      search.current(query);
    }, [query]);
    useEffect(() => search.current.clear, []);

    const displaySuggestions = (results: google.maps.places.PlaceResult[], status: google.maps.places.PlacesServiceStatus) => {
      if (status !== google.maps.places.PlacesServiceStatus.OK) {
        if (status !== google.maps.places.PlacesServiceStatus.ZERO_RESULTS) alert(status);
        return;
      }
      setPlacesResult(results);
    };

    const onSuggestionSelect = ({ suggestion }: { suggestion: ISuggestion }) => {
      setQuery(suggestion.value.description);
      placesService.getDetails({ placeId: suggestion.value.place_id }, onLoadDetails);
    };

    const onLoadDetails = (place: google.maps.places.PlaceResult, status: google.maps.places.PlacesServiceStatus) => {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        console.log(place);
      }
    };

    return (
      <TextInput
        value={query}
        onChange={e => setQuery(e.target.value)}
        suggestions={placesResult.map(place => ({
          label: <Box pad="small">{place.name}</Box>,
          value: place,
        }))}
        onSelect={onSuggestionSelect}
        {...textInputProps}
      />
    );
  }
);

const GooglePlacesSearch: React.FC<IProps> = props => {
  return (
    <GoogleApiGuard>
      <GooglePlacesSearchComponent {...props} />
    </GoogleApiGuard>
  );
};

export default GooglePlacesSearch;
