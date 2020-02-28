import React from "react";
import { Add } from "grommet-icons";

import RoundedCard from "../components/rounded-card";
import { IWedding } from "../store/types";
import { Text } from "grommet";
import GridListing from "../styled/grid-listing";

interface IProps {
  weddings: IWedding[];
  onViewWedding: (weddingId: string) => any;
  onAddWedding: () => any;
}

const WeddingsList: React.FC<IProps> = ({ weddings, onViewWedding, onAddWedding }) => {
  return (
    <GridListing>
      {weddings.map(wedding => (
        <RoundedCard elevation="small" pad="medium" key={wedding.id} onClick={() => onViewWedding(wedding.id)}>
          <Text size="medium">{wedding.name}</Text>
          <Text size="small" color="dark-6" children={wedding.id} />
        </RoundedCard>
      ))}
      <RoundedCard elevation="small" align="center" justify="center" gap="small" onClick={onAddWedding}>
        <Text color="brand">Add a new wedding</Text>
        <Add color="brand" />
      </RoundedCard>
    </GridListing>
  );
};

export default WeddingsList;
