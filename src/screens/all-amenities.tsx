import React from "react";
import { useStateSelector } from "../store/redux";
import { orderedAmenitiesSelector } from "../selectors/selectors";
import GridListing from "../styled/grid-listing";
import RoundedCard from "../components/rounded-card";
import { Heading, Text } from "grommet";
import { Add } from "grommet-icons";
import { RouteComponentProps } from "react-router-dom";
import SContainer from "../components/container";

const AllAmenities: React.FC<RouteComponentProps> = ({ history, match }) => {
  const amenities = useStateSelector(orderedAmenitiesSelector);
  return (
    <SContainer>
      <Heading level={1}>Amenities</Heading>
      {amenities.length === 0 && <Text margin={{ horizontal: "medium", bottom: "medium" }} children="No amenities added yet" />}
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
