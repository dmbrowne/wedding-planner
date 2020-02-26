import React, { useState, useEffect, useRef, ReactNode } from "react";
import { Box, TextInput, TextInputProps } from "grommet";
import GoogleApiGuard from "./google-api-guard";
import { withDummyMap } from "./google-dummy-map";

interface ISuggestion {
  label: ReactNode;
  value: google.maps.places.AutocompletePrediction;
}

type TTextProps = TextInputProps & Omit<JSX.IntrinsicElements["input"], "onSelect" | "size" | "placeholder">;

interface IProps extends Omit<TTextProps, "suggestions" | "value" | "onSelect" | "onChange"> {
  requestOptions?: Omit<google.maps.places.AutocompletionRequest, "input" | "sessionToken">;
  onSelect?: (result: google.maps.places.AutocompletePrediction) => void;
  onPlaceLoadSuccess: (place: google.maps.places.PlaceResult) => void;
  initialQuery?: string;
}

const GoogleAutoCompleteSearchComponent: React.FC<IProps> = withDummyMap(
  ({ requestOptions = {}, initialQuery = "", onSelect, onPlaceLoadSuccess, dummyEl, ...textInputProps }) => {
    const [query, setQuery] = useState(initialQuery);
    const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([]);
    const [sessionToken, setSessionToken] = useState("");
    const placesservice = useRef(new google.maps.places.PlacesService(dummyEl));
    const service = useRef(new google.maps.places.AutocompleteService());
    const autoCompleteService = service.current;
    let placesService = placesservice.current;

    useEffect(() => updateSessionToken(), []);
    useEffect(() => {
      if (!query) setPredictions([]);
      else {
        autoCompleteService.getPlacePredictions({ input: query, sessionToken, ...requestOptions }, displaySuggestions);
      }
    }, [query]);

    const displaySuggestions = (
      suggestions: google.maps.places.AutocompletePrediction[],
      status: google.maps.places.PlacesServiceStatus
    ) => {
      if (status !== google.maps.places.PlacesServiceStatus.OK) {
        alert(status);
        return;
      }

      setPredictions(suggestions);
    };

    const updateSessionToken = () => {
      const newSessionToken = new google.maps.places.AutocompleteSessionToken() as string;
      setSessionToken(newSessionToken);
    };

    const onSuggestionSelect = ({ suggestion }: { suggestion: ISuggestion }) => {
      setQuery(suggestion.value.description);
      if (placesService) {
        placesService.getDetails({ placeId: suggestion.value.place_id, sessionToken }, onLoadDetails);
      }
      updateSessionToken();
    };

    const onLoadDetails = (place: google.maps.places.PlaceResult, status: google.maps.places.PlacesServiceStatus) => {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        onPlaceLoadSuccess(place);
      }
    };

    return (
      <TextInput
        value={query}
        onChange={e => setQuery(e.target.value)}
        suggestions={predictions.map(prediction => ({
          label: <Box pad="small">{prediction.description}</Box>,
          value: prediction,
        }))}
        onSelect={onSuggestionSelect}
        {...(textInputProps as any)}
      />
    );
  }
);

const GoogleAutoCompleteSearch: React.FC<IProps> = props => {
  return (
    <GoogleApiGuard>
      <GoogleAutoCompleteSearchComponent {...props} />
    </GoogleApiGuard>
  );
};

export default GoogleAutoCompleteSearch;
