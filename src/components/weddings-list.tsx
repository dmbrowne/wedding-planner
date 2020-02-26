import React from "react";
import styled from "styled-components";
import { Add } from "grommet-icons";

import RoundedCard from "../components/rounded-card";
import { IWedding } from "../store/types";
import { Text } from "grommet";

interface IProps {
  weddings: IWedding[];
  onViewWedding: (weddingId: string) => any;
  onAddWedding: () => any;
}
const Listing = styled.div`
  display: grid;
  grid-gap: ${({ theme }) => theme.global?.spacing};

  @media (min-width: 600px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const WeddingsList: React.FC<IProps> = ({ weddings, onViewWedding, onAddWedding }) => {
  return (
    <Listing>
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
    </Listing>
  );
};

export default WeddingsList;
