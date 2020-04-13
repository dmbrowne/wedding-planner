import React, { useEffect, useContext } from "react";
import algoliasearch from "algoliasearch/lite";
import { Spinner } from "gestalt";
import { TextInput } from "grommet";

import { AlgoliaSearchKeyContext } from "../algolia-search-key";
import { IGuestGroup } from "../../store/guest-groups";

export interface IAlgoliaGuestGroup extends IGuestGroup {
  _objectID: string;
  memberNames: string[];
}

export interface IProps {
  onResult: (groups: IAlgoliaGuestGroup[]) => any;
  onChange: (value: string) => void;
  query: string;
  eventId?: string;
}

export const AlgoliaGroupSearch: React.FC<IProps> = ({ onResult, query, eventId, onChange }) => {
  const { key } = useContext(AlgoliaSearchKeyContext);
  const searchClient = key ? algoliasearch("KDLM57WWV5", key) : null;
  const index = searchClient ? searchClient.initIndex("guestGroups") : null;

  useEffect(() => {
    if (index) {
      index.search({ query, ...(eventId ? { filters: `eventId:${eventId}` } : {}) }).then(response => onResult(response.hits));
    }
  }, [query]);

  if (!key) {
    return <Spinner show={true} accessibilityLabel="guest search loader" />;
  }

  return <TextInput value={query} onChange={e => onChange(e.target.value)} placeholder="Search by group or a group's member name" />;
};

export default AlgoliaGroupSearch;
