import React, { useContext } from "react";
import { Heading, Text } from "grommet";
import { Add } from "grommet-icons";
import { RouteComponentProps } from "react-router-dom";

import RoundedCard from "../components/rounded-card";
import SContainer from "../components/container";
import { useStateSelector } from "../store/redux";
import { orderedAmenitiesSelector } from "../selectors/selectors";
import GridListing from "../styled/grid-listing";
import AllAmenitiesContext from "../context/all-amenities";

const AllAmenities: React.FC<RouteComponentProps<{ weddingId: string }>> = ({ history, match }) => {
  const amenities = useStateSelector(orderedAmenitiesSelector);
  const { subscribe, subscribed } = useContext(AllAmenitiesContext);

  if (!subscribed) subscribe(match.params.weddingId);

  return (
    <SContainer>
      <Heading level={1}>Amenities</Heading>
      <GridListing>
        {amenities.map(amenity => (
          <RoundedCard key={amenity.id} margin={{ vertical: "xxsmall" }} elevation="small" pad="medium">
            <Heading level="3" size="small" as="header" children={amenity.name} />
          </RoundedCard>
        ))}
        <RoundedCard elevation="small" align="center" justify="center" gap="small" onClick={() => history.push(`${match.url}/add-amenity`)}>
          <Text color="brand">Add amenity</Text>
          <Add color="brand" />
        </RoundedCard>
      </GridListing>
    </SContainer>
  );
};

export default AllAmenities;
