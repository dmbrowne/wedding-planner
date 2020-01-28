import React, { useState, useEffect, useContext } from "react";
import algoliasearch from "algoliasearch/lite";
import { TextInput, Text, Box } from "grommet";
import { IGuest } from "../store/types";
import { AlgoliaSearchKeyContext } from "./algolia-search-key";
import { Spinner } from "gestalt";
import { INewGuest } from "../store/use-new-guests-reducer";

type TGuest = IGuest | INewGuest;
export interface IProps {
  onSelect: (guest: TGuest) => any;
  unsavedGuests?: TGuest[];
  hideGuests?: string[];
  filters?: string;
}

const AlgoliaGuestSearch: React.FC<IProps> = ({ onSelect, unsavedGuests, hideGuests, filters }) => {
  const { key } = useContext(AlgoliaSearchKeyContext);
  const [guestResults, setGuestResults] = useState<IGuest[]>([]);
  const [query, setquery] = useState("");

  const searchClient = key ? algoliasearch("KDLM57WWV5", key) : null;
  const index = searchClient ? searchClient.initIndex("guests") : null;

  useEffect(() => {
    if (!query) setGuestResults([]);
    else {
      if (index) {
        index.search({ query, ...(filters ? { filters } : {}) }).then(response => setGuestResults(response.hits));
      }
    }
  }, [query]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setquery(e.target.value);
  };

  const queriedNewGuests = unsavedGuests
    ? unsavedGuests.filter(guest => {
        return Object.entries(guest).some(([, v]) => {
          return (v || "").toLowerCase().indexOf(query.trim().toLowerCase()) >= 0;
        });
      })
    : [];

  if (!key) {
    return <Spinner show={true} accessibilityLabel="guest search loader" />;
  }

  return (
    <div>
      <TextInput value={query} onChange={onChange} placeholder="Start typing a guest name" />
      {(guestResults.length > 0 || queriedNewGuests.length > 0) && (
        <>
          <Text color="dark-3" size="small" margin={{ top: "small", left: "small" }} children="Guests:" />
          <Box height={{ max: "300px" }}>
            {queriedNewGuests.map(guest =>
              hideGuests && hideGuests.includes(guest.id) ? null : (
                <Box pad="small" key={guest.id} hoverIndicator onClick={() => onSelect(guest)} children={guest.name} />
              )
            )}
            {guestResults.map(guest => (
              <Box pad="small" key={guest.id} hoverIndicator onClick={() => onSelect(guest)} children={guest.name} />
            ))}
          </Box>
        </>
      )}
    </div>
  );
};

export default AlgoliaGuestSearch;
