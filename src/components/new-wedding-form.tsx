import React, { useState, useContext } from "react";
import { Box, Button, Text, Heading, Form, FormField, TextInput, ResponsiveContext } from "grommet";
import styled from "styled-components";
import { Close } from "grommet-icons";
import { SegmentedControl } from "gestalt";
import { IGuest } from "../store/types";

export type TSubmitValue = {
  weddingName: string;
  partners: [Omit<IGuest, "id" | "weddingId">, Omit<IGuest, "id" | "weddingId">];
};

interface IProps {
  onCancel: () => any;
  onSubmit: (values: TSubmitValue) => any;
}

const PlainFieldSet = styled.fieldset`
  border: none;
  margin: 64px 0 40px;
  padding: 0;
`;

const PartnerNamesGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 50px 1fr;
  grid-gap: ${({ theme }) => theme.global?.spacing};
  align-items: flex-start;
`;

const NewWeddingForm: React.FC<IProps> = ({ onCancel, onSubmit }) => {
  const titles = ["Bride", "Groom"];
  const parties = { Bride: "bridal", Groom: "groom" };
  const [weddingPartner1, setweddingPartner1] = useState("");
  const [weddingPartner2, setweddingPartner2] = useState("");
  const [partner1PartyIdx, setPartner1PartyIdx] = useState<number>(0);
  const [partner2PartyIdx, setPartner2PartyIdx] = useState<number>(0);
  const [weddingDayName, setWeddingDayName] = useState("");
  const screenSize = useContext(ResponsiveContext);

  const NameContainerEl = screenSize === "small" ? Box : PartnerNamesGrid;
  const weddingDayNamePlaceholder =
    weddingPartner1 && weddingPartner2 && !weddingDayName ? `${weddingPartner1} and ${weddingPartner2}` : "";

  const nameChange = (partner1: boolean) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const update = partner1 ? setweddingPartner1 : setweddingPartner2;
    update(e.target.value);
  };

  return (
    <Form
      onSubmit={() =>
        onSubmit({
          weddingName: weddingDayName ? weddingDayName : weddingDayNamePlaceholder,
          partners: [
            {
              name: weddingPartner1,
              weddingTitle: titles[partner1PartyIdx].toLowerCase(),
              weddingParty: parties[titles[partner1PartyIdx] as "Bride" | "Groom"] as "groom" | "bridal"
            },
            {
              name: weddingPartner2,
              weddingTitle: titles[partner2PartyIdx].toLowerCase(),
              weddingParty: parties[titles[partner2PartyIdx] as "Bride" | "Groom"] as "groom" | "bridal"
            }
          ]
        })
      }
    >
      <PlainFieldSet>
        <Heading level={3} as="legend" margin={{ bottom: "medium" }} children="Who's tying the knot?" />
        <NameContainerEl>
          <Box>
            <FormField htmlFor="wedding-partner-1">
              <TextInput
                placeholder="Name"
                id="wedding-partner-1"
                value={weddingPartner1}
                onChange={nameChange(true)}
              />
            </FormField>
            <SegmentedControl
              items={titles}
              selectedItemIndex={partner1PartyIdx}
              onChange={({ activeIndex }) => setPartner1PartyIdx(activeIndex)}
            />
          </Box>
          <Box
            align="center"
            margin={{ vertical: screenSize === "small" ? "large" : "small" }}
            justify={screenSize === "small" ? "start" : "center"}
          >
            <Text color="dark-6" children="and" />
          </Box>
          <Box>
            <FormField htmlFor="wedding-partner-2">
              <TextInput
                placeholder="Name"
                id="wedding-partner-2"
                value={weddingPartner2}
                onChange={nameChange(false)}
              />
            </FormField>
            <SegmentedControl
              items={titles}
              selectedItemIndex={partner2PartyIdx}
              onChange={({ activeIndex }) => setPartner2PartyIdx(activeIndex)}
            />
          </Box>
        </NameContainerEl>
      </PlainFieldSet>
      <PlainFieldSet>
        <Heading level={3} as="legend" margin={{ bottom: "medium" }} children="Give it a name..." />
        <FormField htmlFor="wedding-day-name">
          <TextInput
            placeholder={weddingDayNamePlaceholder}
            id="wedding-day-name"
            value={weddingDayName}
            onChange={e => setWeddingDayName(e.target.value)}
          />
        </FormField>
      </PlainFieldSet>
      <Box direction="row" justify="end" gap="medium">
        <Button label="Cancel" onClick={onCancel} />
        <Button type="submit" primary label="Create" />
      </Box>
    </Form>
  );
};

export default NewWeddingForm;
