import React, { useState, useEffect, useContext } from "react";
import algoliasearch from "algoliasearch/lite";
import { TextInput, Text, Box, Button } from "grommet";
import { IGuestGroup } from "../store/guest-groups";
import { AlgoliaSearchKeyContext } from "./algolia-search-key";
import { useStateSelector } from "../store/redux";
import { Checkmark } from "grommet-icons";
import { INewGuestGroup } from "../store/use-new-guests-reducer";

type TGuestGroup = INewGuestGroup | IGuestGroup;
export interface IProps {
  onSelect: (group: TGuestGroup) => any;
  unsavedGroups?: TGuestGroup[];
  selectedIds?: string[];
  onCreateNewGroup?: (name: string) => any;
}

const AlgoliaGroupSearch: React.FC<IProps> = ({ onSelect, unsavedGroups, selectedIds, onCreateNewGroup }) => {
  const { key } = useContext(AlgoliaSearchKeyContext);
  const searchClient = algoliasearch("KDLM57WWV5", key);
  const index = searchClient.initIndex("guestGroups");
  const activeWeddingId = useStateSelector(state => state.activeWeddingId);

  const [groupResults, setGroupResults] = useState<IGuestGroup[]>([]);
  const [query, setquery] = useState("");

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setquery(e.target.value);
  };

  useEffect(() => {
    if (!query) setGroupResults([]);
    else {
      index.search({ query, filters: `weddingId:${activeWeddingId}` }).then(response => setGroupResults(response.hits));
    }
  }, [query]);

  return (
    <Box fill="horizontal">
      <TextInput value={query} onChange={onChange} placeholder="Search saved groups" />
      {!!onCreateNewGroup && query && groupResults.length === 0 && (
        <Box direction="row" margin={{ top: "xxsmall" }} align="center">
          <Text size="small" color="dark-6">
            No group found with that name -&nbsp;
          </Text>
          <Button plain onClick={() => onCreateNewGroup && onCreateNewGroup(query)}>
            <Text size="small">create it?</Text>
          </Button>
        </Box>
      )}

      {!query && unsavedGroups && unsavedGroups.length > 0 && (
        <>
          <Text
            color="dark-3"
            size="small"
            margin={{ top: "medium", left: "small" }}
            children="Recently added groups:"
          />
          {unsavedGroups.map(group => (
            <Box pad="small" key={group.id} hoverIndicator direction="row" gap="xsmall" onClick={() => onSelect(group)}>
              {selectedIds?.includes(group.id) && <Checkmark />}
              <Text>{group.name}</Text>
            </Box>
          ))}
        </>
      )}
      {groupResults.length > 0 && (
        <>
          <Text color="dark-3" size="small" margin={{ top: "medium", left: "small" }} children="Guest groups:" />
          <Box height={{ max: "300px" }}>
            {groupResults.map(guest => (
              <Box pad="small" key={guest.id} hoverIndicator onClick={() => onSelect(guest)} children={guest.name} />
            ))}
          </Box>
        </>
      )}
    </Box>
  );
};

export default AlgoliaGroupSearch;
